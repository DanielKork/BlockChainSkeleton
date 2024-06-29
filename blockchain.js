const { SHA256 } = require("crypto-js");
const { MerkleTree } = require('merkletreejs');
const { BloomFilter } = require('bloom-filters');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        if (!toAddress) {
            throw new Error('Transaction must include a to address');
        }
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timeStamp = Date.now();
        this.Burninfee = 2; // Burning fee
        this.minerFee = 3; // New fee for the miner
        this.signature = null;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timeStamp + this.fee + this.minerFee).toString();
    }

    signTransaction(signingKey) {
        if (this.fromAddress === null) return;

        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

















class Block {
    constructor(timestamp, transactions = [], previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.merkleRoot = this.createMerkleRoot();
        this.bloomFilter = this.createBloomFilter();
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    // createMerkleRoot() {
    //     const leaves = this.transactions.map(tx => SHA256(JSON.stringify(tx)).toString());
    //     const tree = new MerkleTree(leaves, SHA256);
    //     this.tree = tree;  // Store the tree for proof generation
    //     return tree.getRoot().toString('hex');
    // }
    createMerkleRoot() {
        const leaves = this.transactions.map(tx => tx.calculateHash());
        const tree = new MerkleTree(leaves, SHA256);
        this.tree = tree;  // Store the tree for proof generation
        return tree.getRoot().toString('hex');
    }    

    // createBloomFilter() {
    //     const filter = new BloomFilter(20, 4);
    //     this.transactions.forEach(tx => filter.add(JSON.stringify(tx)));
    //     return filter;
    // }
    createBloomFilter() {
        const filter = new BloomFilter(20, 4);
        this.transactions.forEach(tx => filter.add(tx.calculateHash()));
        return filter;
    }  

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + this.merkleRoot + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash + ' nonce: ' + this.nonce);
    }

    hasTransaction(transaction) {
        return this.bloomFilter.has(transaction.calculateHash());
    }       

    // generateProof(transaction) {
    //     const hash = SHA256(JSON.stringify(transaction)).toString();
    //     return this.tree.getProof(Buffer.from(hash, 'hex'));
    // }

    // verifyTransaction(transaction, proof) {
    //     const hash = SHA256(JSON.stringify(transaction)).toString();
    //     const rootBuffer = Buffer.from(this.merkleRoot, 'hex');
    //     const hashBuffer = Buffer.from(hash, 'hex');
    //     return this.tree.verify(proof, hashBuffer, rootBuffer);
    // }

    // generateProof(transaction) {
    //     const transactionHash = transaction.calculateHash();
    //     const proof = this.tree.getProof(Buffer.from(transactionHash, 'hex'));
    //     //console.log('Generated proof:', proof); // Debugging
    //     return proof;
    // }
    generateProof(transaction) {
        const transactionHash = transaction.calculateHash();
        const proof = this.tree.getProof(Buffer.from(transactionHash, 'hex'));
        return proof;
    }     

    // verifyTransaction(transaction, proof) {
    //     const transactionHash = SHA256(JSON.stringify(transaction)).toString();
    //     const verificationResult = this.tree.verify(proof, Buffer.from(transactionHash, 'hex'), Buffer.from(this.merkleRoot, 'hex'));
    //     //console.log('Verification result:', verificationResult, 'for transaction:', transactionHash); // Debugging
    //     return verificationResult;
    // }
    verifyTransaction(transaction, proof) {
        const transactionHash = transaction.calculateHash();
        const verificationResult = this.tree.verify(proof, Buffer.from(transactionHash, 'hex'), Buffer.from(this.merkleRoot, 'hex'));
        return verificationResult;
    }        
    
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) return false;
        }
        return true;
    }
}











class Mempool {
    constructor() {
        this.transactions = [];
    }

    addTransaction(transaction) {
        if (transaction.fromAddress === null) {
            this.transactions.push(transaction);
            return;
        }

        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to mempool');
        }

        this.transactions.push(transaction);
    }

    getTransactions() {
        return this.transactions;
    }

    // clear() {
    //     this.transactions = [];
    // }
    clearTransactions(transactions) {
        this.transactions = this.transactions.filter(tx => !transactions.includes(tx));
    }
}













class Blockchain {
    constructor(initialBalance = 200) {
        this.chain = [];
        this.difficulty = 2;
        this.miningReward = 75;
        this.mempool = new Mempool();
        this.initialBalance = initialBalance;
        this.wallets = new Set();
        this.balances = {};
        this.totalCoins = 0;
        this.minedCoins = 0;
        this.burnedCoins = 0;
        this.createGenesisBlock();
    }

    getTotalCoins() {
        return this.totalCoins;
    }
    
    getMinedCoins() {
        return this.minedCoins;
    }
    
    getBurnedCoins() {
        return this.burnedCoins;
    }

    // createGenesisBlock() {
    //     const initialTransactions = this.createInitialTransactions();
    //     const genesisBlock = new Block(Date.now(), initialTransactions, '0');
    //     this.chain.push(genesisBlock); // Add genesis block to the chain
    //     //console.log('Genesis block created:', genesisBlock);
    // }
    createGenesisBlock() {
        if (this.chain.length === 0) {
            const initialTransactions = this.createInitialTransactions();
            const genesisBlock = new Block(Date.now(), initialTransactions, '0');
            this.chain.push(genesisBlock); // Add genesis block to the chain
            this.updateBalances(initialTransactions); // Initialize balances with the genesis block transactions
            console.log('Genesis block created:', genesisBlock);    
        }
    }

    // createInitialTransactions() {
    //     const transactions = [];
    //     this.wallets.forEach(wallet => {
    //         const transaction = new Transaction(null, wallet, this.initialBalance);
    //         transactions.push(transaction);
    //         this.balances[wallet] = this.initialBalance; // Set initial balance for each wallet
    //     });
    //     return transactions;
    // }

    // addWallet(address) {
    //     this.wallets.add(address);
    // }
    createInitialTransactions() {
        const transactions = [];
        this.wallets.forEach(wallet => {
            const transaction = new Transaction(null, wallet, this.initialBalance);
            transactions.push(transaction);
            this.balances[wallet] = this.initialBalance;
            this.totalCoins += this.initialBalance; // Track total coins
        });
        return transactions;
    }

    // addWallet(address) {
    //     this.wallets.add(address);
    //     if (!this.balances[address]) {
    //         this.balances[address] = this.initialBalance; // Initialize balance for new wallets
    //     }
    // }
    addWallet(address) {
        this.wallets.add(address);
        if (!this.balances[address]) {
            this.balances[address] = this.initialBalance;
            this.totalCoins += this.initialBalance; // Track total coins
        }
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // minePendingTransactions(miningRewardAddress) {
    //     while (this.mempool.transactions.length > 0) {
    //         const transactionsToMine = this.mempool.transactions.splice(0, 4);
    //         const block = new Block(Date.now(), transactionsToMine, this.getLatestBlock().hash);
    //         block.mineBlock(this.difficulty);
    //         this.chain.push(block);
    //         this.updateBalances(transactionsToMine, miningRewardAddress); // Pass mining address to update balances with miner fee
    //         this.balances[miningRewardAddress] = (this.balances[miningRewardAddress] || 0) + this.miningReward; // Add mining reward to the miner's balance
    //         console.log('Block successfully mined!');
    //     }
    // }
    minePendingTransactions(miningRewardAddress) {
        while (this.mempool.transactions.length > 0) {
            const transactionsToMine = this.mempool.transactions.splice(0, 4);
            const block = new Block(Date.now(), transactionsToMine, this.getLatestBlock().hash);
            block.mineBlock(this.difficulty);
            this.chain.push(block);
            this.updateBalances(transactionsToMine, miningRewardAddress);
            this.balances[miningRewardAddress] = (this.balances[miningRewardAddress] || 0) + this.miningReward;
            this.totalCoins += this.miningReward; // Track total coins
            this.minedCoins += this.miningReward; // Track mined coins
            console.log('Block successfully mined!');
        }
    }    

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
    
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }
    
        const totalFee = transaction.Burninfee + transaction.minerFee;
    
        if (transaction.amount + totalFee > this.getBalanceOfAddress(transaction.fromAddress)) {
            throw new Error('Not enough balance to cover the transaction and fees');
        }
    
        this.mempool.addTransaction(transaction);
    }
    
    // getBalanceOfAddress(address) {
    //     let balance = 0;
    //     // let balance = this.initialBalance;

    //     for (const block of this.chain) {
    //         for (const trans of block.transactions) {
    //             if (trans.fromAddress === address) {
    //                 balance -= trans.amount + trans.fee;    
    //             }
    //             if (trans.toAddress === address) {
    //                 balance += trans.amount;
    //             }
    //         }
    //     }
    //     return balance;
    // }
    getBalanceOfAddress(address) {
        return this.balances[address] || 0; // Return the balance from the dictionary
    }

    // updateBalances(transactions, minerAddress) {
    //     transactions.forEach(tx => {
    //         if (tx.fromAddress) {
    //             this.balances[tx.fromAddress] -= tx.amount + tx.fee + tx.minerFee;
    //         }
    //         this.balances[tx.toAddress] += tx.amount;
    //         if (tx.minerFee > 0) {
    //             this.balances[minerAddress] = (this.balances[minerAddress] || 0) + tx.minerFee;
    //         }
    //     });
    // }
    updateBalances(transactions, minerAddress) {
        transactions.forEach(tx => {
            if (tx.fromAddress) {
                this.balances[tx.fromAddress] -= tx.amount + tx.Burninfee + tx.minerFee;
                this.burnedCoins += tx.Burninfee; // Track burned coins
                this.totalCoins -= tx.Burninfee; // Remove burned coins from total coins
            }
            this.balances[tx.toAddress] += tx.amount;
            if (tx.minerFee > 0) {
                this.balances[minerAddress] = (this.balances[minerAddress] || 0) + tx.minerFee;
            }
        });
    }
    
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) return false;

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            if (currentBlock.merkleRoot !== currentBlock.createMerkleRoot()) {
                return false;
            }
        }
        return true;
    }

    hasTransaction(transaction) {
        for (const block of this.chain) {
            if (block.hasTransaction(transaction)) {
                return true;
            }
        }
        return false;
    }

    // verifyTransactionInBlock(transaction) {
    //     for (const block of this.chain) {
    //         if (block.hasTransaction(transaction)) {
    //             const proof = block.generateProof(transaction);
    //             const verified = block.verifyTransaction(transaction, proof);
    //             return verified;
    //         }
    //     }
    //     return false;
    // }
    verifyTransactionInBlock(transaction) {
        const blockContainingTx = this.chain.find(block =>
            block.transactions.some(tx => tx.calculateHash() === transaction.calculateHash())
        );
        if (!blockContainingTx) {
            console.log('Transaction not found in any block.');
            return false;
        }
        
        const proof = blockContainingTx.generateProof(transaction);
        return blockContainingTx.verifyTransaction(transaction, proof);
    }
}

module.exports = { Blockchain, Block, Transaction, Mempool };




// const { SHA256 } = require("crypto-js")
// const { MerkleTree } = require('merkletreejs');
// const { BloomFilter } = require('bloom-filters');
// const EC = require('elliptic').ec
// const ec = new EC('secp256k1')


// class Transaction{
//     constructor(fromAddress, toAddress, amount){
//         if (!toAddress) {
//             throw new Error('Transaction must include a to address');
//         }
//         this.fromAddress = fromAddress
//         this.toAddress = toAddress
//         this.amount = amount
//         this.timeStamp = Date.now();
//         this.signature = null;
//     }

//     calculateHash(){
//         return SHA256(this.fromAddress + this.toAddress + this.amount + this,this.timeStamp).toString()
//     }

//     signTransaction(signingKey){
//         if (this.fromAddress === null) return;

//         if(signingKey.getPublic('hex') !== this.fromAddress){
//             throw new Error('You cant sign transaction from other wallet')
//         }

//         const hashTx = this.calculateHash()
//         console.log(hashTx);
//         const sig = signingKey.sign(hashTx,'base64')
//         this.signature = sig.toDER('hex')
//     }

//     isValid(){
//         if(this.fromAddress  === null) return true

//         if(!this.signature || this.signature.length == 0){
//             throw new Error('No signature in this transaction')
//         }

//         const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
//         return publicKey.verify(this.calculateHash(),this.signature)
//     }

// }

// class Block {
//     constructor(timestamp, transactions = [], previousHash = '') {
//         this.timestamp = timestamp;
//         this.transactions = transactions;
//         this.previousHash = previousHash;
//         this.merkleRoot = this.createMerkleRoot();  // Merkle root for transaction integrity
//         this.bloomFilter = this.createBloomFilter();  // Bloom filter for quick lookups
//         this.hash = this.calculateHash();
//         this.nonce = 0;
//     }

//     // Calculate Merkle root
//     createMerkleRoot() {
//         const leaves = this.transactions.map(tx => SHA256(JSON.stringify(tx)).toString());
//         const tree = new MerkleTree(leaves, SHA256);
//         this.tree = tree;  // Store the tree for proof generation
//         return tree.getRoot().toString('hex');
//     }

//     // Initialize Bloom filter and add transactions
//     createBloomFilter() {
//         const filter = new BloomFilter(20, 4);  // Customize parameters as needed
//         this.transactions.forEach(tx => filter.add(JSON.stringify(tx)));
//         return filter;
//     }

//     // Calculate block hash
//     calculateHash() {
//         return SHA256(this.previousHash + this.timestamp + this.merkleRoot + this.nonce).toString();
//     }

//     // Mine the block
//     mineBlock(difficulty) {
//         while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
//             this.nonce++;
//             this.hash = this.calculateHash();
//         }
//         console.log("Block mined: " + this.hash + ' nonce: ' + this.nonce);
//     }

//     // Check if a transaction might be in the block
//     hasTransaction(transaction) {
//         return this.bloomFilter.has(JSON.stringify(transaction));
//     }

//     // Generate Merkle proof for a transaction
//     generateProof(transaction) {
//         const hash = SHA256(JSON.stringify(transaction)).toString();
//         console.log(hash);
//         console.log(this.tree.getProof(Buffer.from(hash, 'hex')));
//         return this.tree.getProof(Buffer.from(hash, 'hex'));
//     }

//     // Verify Merkle proof
//     verifyTransaction(transaction, proof) {
//         const hash = SHA256(JSON.stringify(transaction)).toString();
//         const verificationResult = this.tree.verify(proof, Buffer.from(hash, 'hex'), Buffer.from(this.merkleRoot, 'hex'));

//         return verificationResult;
//     }
//     // verifyTransaction(transaction, proof) {
//     //     const hash = SHA256(JSON.stringify(transaction)).toString();
//     //     return this.tree.verify(proof, hash, this.merkleRoot);
//     // }

//     // Check if all transactions are valid
//     hasValidTransactions() {
//         for (const tx of this.transactions) {
//             if (!tx.isValid()) return false;
//         }
//         return true;
//     }
// }

// class Mempool {
//     constructor() {
//         this.transactions = [];
//     }
    
//     addTransaction(transaction) {
//         if (transaction.fromAddress === null) {
//             // Allow transactions with null fromAddress (mining rewards)
//             this.transactions.push(transaction);
//             return;
//         }

//         if (!transaction.fromAddress || !transaction.toAddress) {
//             throw new Error('Transaction must include from and to address');
//         }

//         if (!transaction.isValid()) {
//             throw new Error('Cannot add invalid transaction to mempool');
//         }

//         this.transactions.push(transaction);
//     }

//     getTransactions() {
//         return this.transactions;
//     }

//     clear() {
//         this.transactions = [];
//     }
// }

// class Blockchain {
//     constructor() {
//         //this.chain = [this.createGenesisBlock()];
//         this.chain = [];
//         this.difficulty = 2;
//         this.miningReward = 5000;
//         this.mempool = new Mempool();
//         this.initialBalance = 200; // Initial balance for each wallet
//         this.wallets = new Set(); // Store all wallet addresses
//     }

//     // createGenesisBlock() {
//     //     return new Block(Date.now(), [], '0');
//     // }
//     createGenesisBlock() {
//         const initialTransactions = this.createInitialTransactions();
//         return new Block(Date.now(), initialTransactions, '0');
//     }

//     createInitialTransactions() {
//         const transactions = [];
//         this.wallets.forEach(wallet => {
//             transactions.push(new Transaction(null, wallet, this.initialBalance));
//         });
//         return transactions;
//     }
//     // createInitialTransactions() {
//     //     const transactions = [];
//     //     if (!this.wallets) {
//     //         console.log('this.wallets is undefined!');
//     //         //return transactions; // Return an empty array if undefined
//     //     }
//     //     console.log('Wallets before initial transactions:', Array.from(this.wallets)); // Debug statement
//     //     this.wallets.forEach(wallet => {
//     //         console.log(`Creating initial transaction for wallet: ${wallet}`); // Debug statement
//     //         transactions.push(new Transaction(null, wallet, this.initialBalance));
//     //     });
//     //     return transactions;
//     // }

//     addWallet(address) {
//         this.wallets.add(address);
//     }

//     getLatestBlock() {
//         return this.chain[this.chain.length - 1];
//     }

//     minePendingTransactions(miningRewardAddress) {
//         // const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
//         // this.mempool.addTransaction(rewardTx);

//         const transactions = this.mempool.getTransactions();
//         console.log("Transactions to be included in the new block:", transactions);

//         const block = new Block(Date.now(), transactions, this.getLatestBlock().hash);
//         block.mineBlock(this.difficulty);

//         console.log("Block successfully mined!");
//         this.chain.push(block);

//         this.mempool.clear();
//     }

//     addTransaction(transaction) {
//         if (!transaction.fromAddress || !transaction.toAddress) {
//             throw new Error('Transaction must include from and to address');
//         }

//         if (!transaction.isValid()) {
//             throw new Error('Cannot add invalid transaction to chain');
//         }

//         this.mempool.addTransaction(transaction);
//     }

//     getBalanceOfAddress(address) {
//         let balance = 0;

//         for (const block of this.chain) {
//             for (const trans of block.transactions) {
//                 if (trans.fromAddress === address) {
//                     balance -= trans.amount;
//                 }
//                 if (trans.toAddress === address) {
//                     balance += trans.amount;
//                 }
//             }
//         }
//         return balance;
//     }

//     isChainValid() {
//         for (let i = 1; i < this.chain.length; i++) {
//             const currentBlock = this.chain[i];
//             const previousBlock = this.chain[i - 1];

//             if (!currentBlock.hasValidTransactions()) return false;

//             if (currentBlock.hash !== currentBlock.calculateHash()) {
//                 return false;
//             }

//             if (currentBlock.previousHash !== previousBlock.hash) {
//                 return false;
//             }

//             if (currentBlock.merkleRoot !== currentBlock.createMerkleRoot()) {
//                 return false;
//             }
//         }
//         return true;
//     }

//     hasTransaction(transaction) {
//         for (const block of this.chain) {
//             if (block.hasTransaction(transaction)) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     verifyTransactionInBlock(transaction) {
//         for (const block of this.chain) {
//             if (block.hasTransaction(transaction)) {
//                 const proof = block.generateProof(transaction);
//                 return block.verifyTransaction(transaction, proof);
//             }
//         }
//         return false;
//     }
// }

// module.exports = { Blockchain, Block, Transaction, Mempool };

