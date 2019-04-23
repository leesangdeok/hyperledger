# What is Burrow
Hyperledger Burrow is a permissioned blockchain node that executes smart contract code following the Ethereum specification. Burrow is built for a multi-chain universe with application specific optimization in mind. Burrow as a node is constructed out of three main components: the consensus engine, the permissioned Ethereum virtual machine and the rpc gateway. More specifically Burrow consists of the following:

Consensus Engine: Transactions are ordered and finalised with the Byzantine fault-tolerant Tendermint protocol. The Tendermint protocol provides high transaction throughput over a set of known validators and prevents the blockchain from forking.

Application Blockchain Interface (ABCI): The smart contract application interfaces with the consensus engine over the ABCI. The ABCI allows for the consensus engine to remain agnostic from the smart contract application.

Smart Contract Application: Transactions are validated and applied to the application state in the order that the consensus engine has finalised them. The application state consists of all accounts, the validator set and the name registry. Accounts in Burrow have permissions and either contain smart contract code or correspond to a public-private key pair. A transaction that calls on the smart contract code in a given account will activate the execution of that account’s code in a permissioned virtual machine.

Permissioned Ethereum Virtual Machine: This virtual machine is built to observe the Ethereum operation code specification and additionally asserts the correct permissions have been granted. Permissioning is enforced through secure native functions and underlies all smart contract code. An arbitrary but finite amount of gas is handed out for every execution to ensure a finite execution duration - “You don’t need money to play, when you have permission to play”.

Application Binary Interface (ABI): Transactions need to be formulated in a binary format that can be processed by the blockchain node. Current tooling provides functionality to compile, deploy and link solidity smart contracts and formulate transactions to call smart contracts on the chain.

API Gateway: Burrow exposes REST and JSON-RPC endpoints to interact with the blockchain network and the application state through broadcasting transactions, or querying the current state of the application. Websockets allow subscribing to events, which is particularly valuable as the consensus engine and smart contract application can give unambiguously finalised results to transactions within one blocktime of about one second.

## Key Characteristics
### Burrow has three primary aims:
* To be a good compliant and simple EVM library friendly towards integrators (see for example https://github.com/hyperledger/sawtooth-seth)
* To be a fast, light, lean single-process full Tendermint/EVM permissioned ledger with transaction finality
* To provide a practical base for EVM extensions in a many-chain world
### Burrow is not trying to be:
* Highly pluggable (see Sawtooth or Fabric)
* Hard to deploy


## Minimum requirements
Requirement|Notes
---|---
Go version | Go1.11 or higher
