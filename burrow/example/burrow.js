const fs = require('fs');
const burrow = require('@monax/burrow');
const bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();

// Burrow address
let chainURL = '54.180.125.245:10997';
const abiFile = './burrow/simplestorage/simplestorage.bin';
const deployFile = './burrow/simplestorage/deploy.output.json';
const accountFile = './burrow/account.json';

function slurp(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Grab the account file that is expected to have 'Address' field
let account = slurp(accountFile);
// Connect to running burrow chain using the account address to identify our input account and return values as an object
// using named returns where provided
let chain = burrow.createInstance(chainURL, account.Address, {objectReturn: true});
// The ABI file produced by the solidity compiler (through burrow deploy) that acts as a manifest for our deployed contract
let abi = slurp(abiFile).Abi;
// The deployment receipt written to disk by burrow deploy that contains the deployed address of the contract amongst other things
let deploy = slurp(deployFile);
// The contract we will call
let contractAddress = deploy.simplestorage;
// A Javascript object that wraps our simplestorage contract and will handle translating Javascript calls to EVM invocations
let store = chain.contracts.new(abi, null, contractAddress);

// For this example we use a simple router based on expressjs
const app = express();
// Apparently this needs to be its own module...
app.use(bodyParser.json());

// Some helpers for parsing/validating input
let asInteger = value => new Promise((resolve, reject) =>
    (i => isNaN(i) ? reject(`${value} is ${typeof value} not integer`) : resolve(i))(parseInt(value)));

let param = (obj, prop) => new Promise((resolve, reject) =>
    prop in obj ? resolve(obj[prop]) : reject(`expected key '${prop}' in ${JSON.stringify(obj)}`));

let handleError = err => {
  console.log(err);
  return err.toString()
}

// curl ${url}
// We define some method endpoints
// Get the value from the contract by calling the Solidity 'get' method
router.get('/', (req, res) => store.get()
    .then(ret => res.send(ret.values))
    .catch(err => res.send(handleError(err))));

// $ curl -d '{"value": 2000}' -H "Content-Type: application/json" -X POST ${url}
// Sets the value by accepting a value in HTTP POST data and calling the Solidity 'set' method
router.post('/', (req, res) => param(req.body, 'value')
    .then(value => asInteger(value))
    .then(value => store.set(value).then(() => value))
    .then(value => res.send({value: value, success: true}))
    .catch(err => res.send(handleError(err))));

module.exports = router;
