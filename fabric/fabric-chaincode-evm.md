# EVM Smart Contracts

Hyperledger Burrow 프로젝트 EVM이 Fabric에 통합되었고 EVM bytecode를 이용하여 스마트 컨트랙트를 배포할 수 있다.


## Installing the EVM Chaincode
[fabric-samples](https://github.com/hyperledger/fabric-samples)의 `first-network`을 진행하고 연속으로 EVM chaincode 인스톨 진행

### download src
EVM chaincode path : "/fabric-chaincode-evm/evmcc"  
```bash
cd /Users/fabric/gopath/src/github.com/hyperledger

git clone https://github.com/hyperledger/fabric-chaincode-evm.git
```

### Mount the EVM Chaincode

* docker volumes 업데이트  
first-network의 ``docker-compose-cli.yaml``파일 volumes ``fabric-chaincode-evm``을 업데이트 한다.
```yaml
  cli:
    volumes:
      #- {fabric-chaincode-evm directory path}:/opt/gopath/src/github.com/hyperledger/fabric-chaincode-evm
      - ./../../fabric-chaincode-evm:/opt/gopath/src/github.com/hyperledger/fabric-chaincode-evm
```

* Start the network by running:

```bash
  ./byfn up
```

### Build and Start the EVM

* docker container에 접속
```bash
  docker exec -it cli bash
  
  root@9ce29addafbd:/opt/gopath/src/github.com/hyperledger/fabric/peer#
```

* peer0에 대한 환경설정
```bash
  # Environment variables for PEER0 (default)
  export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
```

* 각 peer에서 EVM chaincode 인스톨
```bash
    peer chaincode install -n evmcc -l golang -v 0 -p github.com/hyperledger/fabric-chaincode-evm/evmcc
```

* ``<channel-name>``을 설정하고 evmcc을 Instantiate 

```bash
    peer chaincode instantiate -n evmcc -v 0 -C <channel-name> -c '{"Args":[]}' -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

## Interact with the EVM Chaincode

EVM Chaincode와 상호작용하기 위해서 Fabric tools과 Web3을 이용한 두가지 방법이 있다.

### Using the Peer CLI(Fabric Tool)
peer command에서 컨트랙트 배포 및 실행할 수 있고 일반적으로 EVM에서 이더리움 트랜잭션을 발생하기 위해 to address와 input 두개의 args가 필수이다.

* 컨트랙트 작성  
[remix](https://medium.com/coinmonks/solidity-smart-contract-on-hyperledger-fabric-3d50f25e577b) 에서 간단한 컨트랙트 작성하기
([Storage Example](https://solidity.readthedocs.io/en/v0.4.24/introduction-to-smart-contracts.html#storage))

```javascript
pragma solidity ^0.4.21;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```

* 컨트랙트 배포  
`channel-name`을 설정, `to`에는 address 0을 입력하고 `input`에는 컴파일된 컨트랙트의 bytecode(json의 object)를 입력한다.  
배포된 스마트컨트랙트의 결과 중 payload는 컨트랙트의 address이다.
```bash
  peer chaincode invoke -n evmcc -C <channel-name>  -c '{"Args":["0000000000000000000000000000000000000000","608060405234801561001057600080fd5b5060df8061001f6000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b114604e5780636d4ce63c146078575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060a0565b005b348015608357600080fd5b50608a60aa565b6040518082815260200191505060405180910390f35b8060008190555050565b600080549050905600a165627a7a72305820645b741fb425e55fe93343e04f015a790a9a1c0d7f19ec9ab2f68800f20299470029"]}' -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  # output
  [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 payload:"9aa59b002e3eff302c5290bc30eaa705d83f9753"
```

* 배포된 컨트랙트 확인  
정상적으로 배포된 컨트랙트를 확인하기 위해 evmcc을 통해 동작중인 컨트랙트의 bytcode를 확인할 수 있다.
```bash
  # peer chaincode query -n evmcc -C <channel-name> -c '{"Args":["getCode","<contract addr>"]}'
  peer chaincode query -n evmcc -C mychannel -c '{"Args":["getCode","9aa59b002e3eff302c5290bc30eaa705d83f9753"]}'
  # output
  # 해당 payload(address)의 bytecode
```

* 컨트랙트 호출
배포 후 생성된 payload(address)를 통해서 스마트 컨트랙트를 호출할 수있다.

SimpleStorage 스마트 컨트랙트는 `set(x)` and `get()` 두개의 function으로 구성되어있다.  
`to` 필드에 address `input` 필드에 function hash 입력(remix에서 해당 필드 트랜잭션 발생 후 로그에서 0x를 제외한 input값)

```bash
  # set(x)
  # peer chaincode invoke -n evmcc -C <channel-name> -c '{"Args":["<contract-address>","60fe47b1000000000000000000000000000000000000000000000000000000000000000a"]}' -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  peer chaincode invoke -n evmcc -C mychannel -c '{"Args":["9aa59b002e3eff302c5290bc30eaa705d83f9753","60fe47b10000000000000000000000000000000000000000000000000000000000000457"]}' -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  
  # get()
  # peer chaincode query -n evmcc -C <channel-name> -c '{"Args":["<contract-address>","6d4ce63c"]}' --hex
  peer chaincode query -n evmcc -C mychannel -c '{"Args":["9aa59b002e3eff302c5290bc30eaa705d83f9753","6d4ce63c"]}' --hex
  # output
  # 000000000000000000000000000000000000000000000000000000000000006f (hex -> decimal = 111)
```

* Getting the User Account Address  
Fabic과 EVMCC에서는 user accounts의 정보를 저장, 사용하지 않지만 user pk로부터 user account address를 생성하는  
메카니즘이 있다. 필요에 따라 address는 EVMCC 트랜잭션 시 사용된다.

```bash
  peer chaincode query -n evmcc -C <channel-name> -c '{"Args":["account"]}'
  peer chaincode query -n evmcc -C mychannel -c '{"Args":["account"]}'
```

### Web3
Fab(Fabric) Proxy를 통해서 web3 사용할 수 있는 제한적인 API를 제공한다. 

#### Hyperledger Fabric EVM Chaincode 작업순서

1. Fabric Network  
[Hyperledger Fabric Sample](https://github.com/leesangdeok/hyperledger/blob/master/fabric/tutorial.md) tutorial을 통해 Fabric Network를 구성한다.  

2. Fab Proxy 세팅  
fabric network에 접속하고 컨트랙트의 실행을 위해서 Fabric Go SDK를 사용한다.

  * SDK config
  ```bash
  # Environment Variables for Fab3:
  # GOPATH=/Users/abtunit/gopath
  export FAB3_CONFIG=${GOPATH}/src/github.com/hyperledger/fabric-chaincode-evm/examples/first-network-sdk-config.yaml # Path to a compatible Fabric SDK Go config file
  export FAB3_USER=User1 # User identity being used for the proxy (Matches the users names in the crypto-config directory specified in the config)
  export FAB3_ORG=Org1  # Organization of the specified user
  export FAB3_CHANNEL=mychannel # Channel to be used for the transactions
  export FAB3_CCID=evmcc # ID of the EVM Chaincode deployed in your fabric network. If not provided default is evmcc.
  export FAB3_PORT=5000 # Port the proxy will listen on. If not provided default is 5000.
  ```
  
  * Fab Proxy 빌드
  ```bash
  cd /Users/abtunit/gopath/src/github.com/hyperledger/fabric-chaincode-evm
 
  make fab3

  # output
  # bin 서브디렉토리에 fab3 binary생성

  bin/fab3
  # output
  # {"level":"info","ts":1552440793.027321,"logger":"fab3","caller":"cmd/main.go:143","msg":"Starting Fab3","port":5000}
  ```

3. SimpleStorage DAPP  
Fabric에서 실행 가능한 DAPP을 생성한다.

  * Proxy 연결하기
    * node와 web3 설치
  ```bash
  npm install web3@0.20.2
  ```
  
    * 설치 후 web3연동  
  ```bash
  Web3 = require('web3')
  ...
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:5000'))
  ...
  ```
  
    * account address 확인
  ```bash
  web3.eth.accounts
  ```
  
    * default account 세팅
  tx 실행을 위해서 web3.eth.defaultAccount가 세팅되어야 한다.
  ```bash
  web3.eth.defaultAccount = web3.eth.account[0]
  ```
  
  * 스마트컨트랙트 배포
  simpleStorage 컨트랙트 ABI
  ```bash
  simpleStorageABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "x",
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
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ]
 
// simpleStorage 컨트랙트의 bytecode
simpleStorageBytecode = '608060405234801561001057600080fd5b5060df8061001f6000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b114604e5780636d4ce63c146078575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060a0565b005b348015608357600080fd5b50608a60aa565b6040518082815260200191505060405180910390f35b8060008190555050565b600080549050905600a165627a7a723058203dbaed52da8059a841ed6d7b484bf6fa6f61a7e975a803fdedf076a121a8c4010029'
 
SimpleStorage = web3.eth.contract(simpleStorageABI)
 
deployedContract = SimpleStorage.new([], {data: simpleStorageBytecode})
myContract = SimpleStorage.at(web3.eth.getTransactionReceipt(deployedContract.transactionHash).contractAddress)
  ```
  
* 컨트랙트 호출하기
```bash
# 배포된 컨트랙트에 연동할 경우
myContract = SimpleStorage.at(<contract-address>)

# 10 입력
myContract.set(10)

# 입력값 확인
myContract.get().toNumber()
# return
# 10
```
