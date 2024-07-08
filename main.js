const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('9df30cc9086ad31f2df324ae27917a1e8329cf4640607a17584a6037580f2fcb');
const myWalletAddress = myKey.getPublic('hex');

const Wallet1Key = ec.keyFromPrivate('9df30cc9086ad31f2df324ae27917a1e8329cf4640607a17584a6037580f2fcc');
const Wallet1 = Wallet1Key.getPublic('hex');

let micaNet = new Blockchain();

micaNet.addWallet(Wallet1);
micaNet.addWallet('Wallet2');
micaNet.addWallet(myWalletAddress);

console.log('Balance of address1:', micaNet.getBalanceOfAddress(Wallet1));
console.log('Balance of address2:', micaNet.getBalanceOfAddress('Wallet2'));
console.log('Balance of my wallet:', micaNet.getBalanceOfAddress(myWalletAddress));

for (let i = 1; i <= 30; i++) {
    const toAddress = `Wallet${i}`;
    const tx = new Transaction(Wallet1, toAddress, 1);
    tx.signTransaction(Wallet1Key);
    micaNet.addTransaction(tx);
    console.log(`Added transaction from ${Wallet1} to ${toAddress} for amount ${i * 10}`);
}

console.log('\nMining pending transactions...');
micaNet.minePendingTransactions(myWalletAddress);

micaNet.chain.forEach((block, index) => {
    console.log(`Block ${index}:`);
    console.log(block.transactions);
});

const txToCheck = new Transaction(Wallet1, 'Wallet2', 10);
txToCheck.signTransaction(Wallet1Key);
micaNet.addTransaction(txToCheck);

micaNet.minePendingTransactions(myWalletAddress);``

const isTransactionInBlockchain = micaNet.hasTransaction(txToCheck);
console.log('Is transaction in the blockchain:', isTransactionInBlockchain);

if (micaNet.hasTransaction(txToCheck)) {
    console.log('Transaction is likely in the blockchain (Bloom Filter check).');

    const verified = micaNet.verifyTransactionInBlock(txToCheck);
    console.log('Transaction verification result using Merkle proof:', verified);
    if (verified) {
        console.log('Transaction successfully verified in the blockchain.');
    } else {
        console.log('Failed to verify the transaction in the blockchain.');
    }
} else {
    console.log('Transaction is not in the blockchain.');
}

console.log('Updated balance of Wallet1:', micaNet.getBalanceOfAddress(Wallet1));
console.log('Updated balance of Wallet2:', micaNet.getBalanceOfAddress('Wallet2'));
console.log('Updated balance of my wallet:', micaNet.getBalanceOfAddress(myWalletAddress));

console.log('');

console.log('Total coins in the network:', micaNet.getTotalCoins());
console.log('Total coins mined:', micaNet.getMinedCoins());
console.log('Total coins burned:', micaNet.getBurnedCoins());