const fs = require('fs');
const monax = require('@monax/burrow');
var express = require('express');
var router = express.Router();

// Burrow address (GRPC)
let burrowURL = '54.180.125.245:10997';
const accountFile = './burrow/account.json';

function slurp(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Grab the account file that is expected to have 'Address' field
let account = slurp(accountFile);

// Connect to running burrow chain using the account address to identify our input account and return values as an object
// using named returns where provided
let burrow = monax.createInstance(burrowURL, account.Address, {objectReturn: true});

// The contract we will call
let contractAddress;

// The ABI file produced by the solidity compiler (through burrow deploy) that acts as a manifest for our deployed contract
const abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "storedData",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "set",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "get",
        "outputs": [
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "initVal",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }
]; // Get the contractABIJSON from somewhere such as solc
const bytecode = '608060405234801561001057600080fd5b506040516020806101618339810180604052810190808051906020019092919050505080600081905550506101178061004a6000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632a1afcd914605857806360fe47b11460805780636d4ce63c1460aa575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b5060a86004803603810190808035906020019092919050505060d8565b005b34801560b557600080fd5b5060bc60e2565b6040518082815260200191505060405180910390f35b60005481565b8060008190555050565b600080549050905600a165627a7a72305820a8f4763e53ef7150b044388780ce580b35ce5231b17141a56d1416f79ea480950029';

// A Javascript object that wraps our simplestorage contract and will handle translating Javascript calls to EVM invocations
let contract = burrow.contracts.new(abi, bytecode);

router.post('/deploy', async (req, res) => {
    contractAddress  = await contract._constructor('contract');
    console.log(">>>>>> contract address : " + contractAddress);
    res.send(contractAddress);
});

router.post('/set', async (req, res) => {
    try {
        let result  = await contract.set.at(contractAddress, req.body.value)
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

router.post('/get', async (req, res) => {
    try {
        let result  = await contract.get.at(contractAddress)
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

module.exports = router;
