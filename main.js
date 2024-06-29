// const { Blockchain, Transaction } = require('./blockchain');
// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');

// const myKey = ec.keyFromPrivate('9df30cc9086ad31f2df324ae27917a1e8329cf4640607a17584a6037580f2fcb');
// const myWalletAddress = myKey.getPublic('hex');

// const Wallet1Key = ec.keyFromPrivate('9df30cc9086ad31f2df324ae27917a1e8329cf4640607a17584a6037580f2fcc');
// const Wallet1 = Wallet1Key.getPublic('hex');

// let micaNet = new Blockchain();

// micaNet.addWallet(Wallet1);
// micaNet.addWallet('Wallet2');
// micaNet.addWallet(myWalletAddress);

// console.log('Creating Genesis Block with initial distribution...');
// micaNet.createGenesisBlock();

// console.log('Balance of Wallet1:', micaNet.getBalanceOfAddress(Wallet1));
// console.log('Balance of Wallet2:', micaNet.getBalanceOfAddress('Wallet2'));
// console.log('Balance of my wallet:', micaNet.getBalanceOfAddress(myWalletAddress));

// for (let i = 2; i <= 4; i++) {
//     const toAddress = `Wallet${i}`;
//     const tx = new Transaction(Wallet1, toAddress, i * 10);
//     tx.signTransaction(Wallet1Key);
//     micaNet.addTransaction(tx);
//     console.log(`Added transaction from ${Wallet1} to ${toAddress} for amount ${i * 10}`);
// }

// console.log('\nMining pending transactions...');
// micaNet.minePendingTransactions(myWalletAddress);

// micaNet.chain.forEach((block, index) => {
//     console.log(`Block ${index}:`);
//     console.log(block.transactions);
// });

// console.log('Updated balance of Wallet1:', micaNet.getBalanceOfAddress(Wallet1));
// console.log('Updated balance of Wallet2:', micaNet.getBalanceOfAddress('Wallet2'));
// console.log('Updated balance of my wallet:', micaNet.getBalanceOfAddress(myWalletAddress));




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

for (let i = 2; i <= 4; i++) {
    const toAddress = `Wallet${i}`;
    const tx = new Transaction(Wallet1, toAddress, i * 10);
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

const txToCheck = new Transaction(Wallet1, 'Wallet2', 50);
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


// Log the entire blockchain for debugging
//console.log('Current Blockchain: ', JSON.stringify(micaNet, null, 4));




// const { Blockchain, Transaction } = require('./blockchain');
// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');

// // Generate a key pair for demonstration purposes
// const myKey = ec.keyFromPrivate('9df30cc9086ad31f2df324ae27917a1e8329cf4640607a17584a6037580f2fcb');
// const myWalletAddress = myKey.getPublic('hex');

// // Create a new blockchain instance
// let micaNet = new Blockchain();

// // Add wallets to the blockchain
// micaNet.addWallet(myWalletAddress);

// micaNet.createGenesisBlock(); 

// // Verify that the genesis block was created
// console.log('Initial Blockchain:', micaNet.chain); // Add this line to check initial blockchain state

// // Add and sign transactions
// const tx1 = new Transaction(myWalletAddress, 'toAddress', 75);
// tx1.signTransaction(myKey);
// micaNet.addTransaction(tx1);

// // Mine pending transactions
// micaNet.minePendingTransactions(myWalletAddress);

// // Add another transaction
// const tx2 = new Transaction(myWalletAddress, 'toAddress', 50);
// tx2.signTransaction(myKey);
// micaNet.addTransaction(tx2);

// // Mine another block
// micaNet.minePendingTransactions(myWalletAddress);

// console.log('\nStart mining...');
// console.log('Balance of the miner:', micaNet.getBalanceOfAddress(myWalletAddress));

// // Check if transaction might be in the blockchain
// console.log('\nChecking transaction presence...');
// console.log('Transaction 1 might be in blockchain:', micaNet.hasTransaction(tx1));
// console.log('Transaction 2 might be in blockchain:', micaNet.hasTransaction(tx2));

// // Verify transactions using Merkle proof
// console.log('\nVerifying transactions...');
// console.log('Transaction 1 verified:', micaNet.verifyTransactionInBlock(tx1));
// console.log('Transaction 2 verified:', micaNet.verifyTransactionInBlock(tx2));

// const { Blockchain, Transaction } = require('./blockchain');
// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');

// // Generate key pairs for two wallets
// const key1 = ec.keyFromPrivate('9df30cc9086ad31f2df324ae27917a1e8329cf4640607a17584a6037580f2fcb');
// const wallet1 = key1.getPublic('hex');

// const key2 = ec.keyFromPrivate('8e7b2924f1ae63a77ec314d0af0fcd72a626b65b1d4e8d8b15b6dd73649cf1dc');
// const wallet2 = key2.getPublic('hex');

// // Create a new blockchain instance
// let micaNet = new Blockchain();

// // Add wallets to the blockchain
// micaNet.addWallet(wallet1);
// micaNet.addWallet(wallet2);

// micaNet.createGenesisBlock();

// // Add and sign transactions from both wallets
// const tx1 = new Transaction(wallet1, 'toAddress1', 50);
// tx1.signTransaction(key1);
// micaNet.addTransaction(tx1);

// const tx2 = new Transaction(wallet2, 'toAddress2', 100);
// tx2.signTransaction(key2);
// micaNet.addTransaction(tx2);

// // Mine pending transactions
// micaNet.minePendingTransactions(wallet1); // Specify a wallet to receive the mining reward

// // Check if the transactions are in the blockchain
// console.log('Is transaction 1 in the blockchain:', micaNet.hasTransaction(tx1));
// console.log('Is transaction 2 in the blockchain:', micaNet.hasTransaction(tx2));

// // Verify transactions
// console.log('Transaction 1 verified:', micaNet.verifyTransactionInBlock(tx1));
// console.log('Transaction 2 verified:', micaNet.verifyTransactionInBlock(tx2));
