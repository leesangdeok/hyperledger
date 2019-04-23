# What is Burrow
Hyperledger Burrow is a permissioned blockchain node that executes smart contract code following the Ethereum specification. Burrow is built for a multi-chain universe with application specific optimization in mind. Burrow as a node is constructed out of three main components: the consensus engine, the permissioned Ethereum virtual machine and the rpc gateway. More specifically Burrow consists of the following:

Consensus Engine: Transactions are ordered and finalised with the Byzantine fault-tolerant Tendermint protocol. The Tendermint protocol provides high transaction throughput over a set of known validators and prevents the blockchain from forking.

Application Blockchain Interface (ABCI): The smart contract application interfaces with the consensus engine over the ABCI. The ABCI allows for the consensus engine to remain agnostic from the smart contract application.

Smart Contract Application: Transactions are validated and applied to the application state in the order that the consensus engine has finalised them. The application state consists of all accounts, the validator set and the name registry. Accounts in Burrow have permissions and either contain smart contract code or correspond to a public-private key pair. A transaction that calls on the smart contract code in a given account will activate the execution of that account’s code in a permissioned virtual machine.

Permissioned Ethereum Virtual Machine: This virtual machine is built to observe the Ethereum operation code specification and additionally asserts the correct permissions have been granted. Permissioning is enforced through secure native functions and underlies all smart contract code. An arbitrary but finite amount of gas is handed out for every execution to ensure a finite execution duration - “You don’t need money to play, when you have permission to play”.

Application Binary Interface (ABI): Transactions need to be formulated in a binary format that can be processed by the blockchain node. Current tooling provides functionality to compile, deploy and link solidity smart contracts and formulate transactions to call smart contracts on the chain.

API Gateway: Burrow exposes REST and JSON-RPC endpoints to interact with the blockchain network and the application state through broadcasting transactions, or querying the current state of the application. Websockets allow subscribing to events, which is particularly valuable as the consensus engine and smart contract application can give unambiguously finalised results to transactions within one blocktime of about one second.

## Key Characteristics
### Burrow 의 3가지 목표:
* 통합체를 위한 호환성이 뛰어나고 단순한 EVM 라이브러리 제공 (예 [sawtooth-seth](https://github.com/hyperledger/sawtooth-seth))
* 트랜잭션 완결성을 갖춘 Tendermint/EVM의 허가된 전체 원장을 빠르고 가볍고 슬림한 단일 프로세스
* 다양한 블록체인 세계에 EVM 확장을 위한 실질적인 기반을 제공 
### Burrow 가 지양하는 것 :
* 고도로 플러그형 (Sawtooth 나 Fabric 처럼)
* 배포의 어려움


## Minimum requirements
Requirement|Notes
---|---
Go version | Go1.11 or higher
