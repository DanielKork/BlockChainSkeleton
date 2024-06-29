const EC = require('elliptic').ec

const ec = new EC('secp256k1')

const key = ec.genKeyPair();

const publicKey = key.getPublic('hex')
const privetKey = key.getPrivate('hex')

console.log('Your public key ' + publicKey)
console.log('Your privet key ' + privetKey)