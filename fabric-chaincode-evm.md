# EVM Smart Contracts

Hyperledger Burrow 프로젝트 EVM이 Fabric에 통합되었고 EVM bytecode를 이용하여 스마트 컨트랙트를 배포할 수 있다.

## Installing the EVM Chaincode

EVM chaincode path : "/fabric-chaincode-evm/evmcc"  
[fabric-samples](https://github.com/hyperledger/fabric-samples)의 `first-network`을 기초로 EVM chaincode 인스톨 진행

### Mount the EVM Chaincode
first-network의 ``docker-compose-cli.yaml``파일 volumes ``fabric-chaincode-evm``을 업데이트 한다.

```yaml
  cli:
    volumes:
      #- {fabric-chaincode-evm directory path}:/opt/gopath/src/github.com/hyperledger/fabric-chaincode-evm
      - ./../fabric-chaincode-evm:/opt/gopath/src/github.com/hyperledger/fabric-chaincode-evm
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

### Using the Peer CLI
일반적으로 EVM에서 이더리움 트랜잭션을 발생하기 위해 `to` address와 `input` 두개의 args가 필수이다.

#### Deploying a Contract

* [remix](https://medium.com/coinmonks/solidity-smart-contract-on-hyperledger-fabric-3d50f25e577b) 에서 간단한 컨트랙트 작성하기
([Storage Example](https://solidity.readthedocs.io/en/v0.4.24/introduction-to-smart-contracts.html#storage))

```
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

* 스마트컨트랙트 배포  
`channel-name`을 설정, `to`에는 address 0을 입력하고 `input`에는 컴파일된 컨트랙트의 bytecode(json의 object)를 입력한다.  
배포된 스마트컨트랙트의 결과 중 payload는 컨트랙트의 address이다.
```bash
  peer chaincode invoke -n evmcc -C <channel-name>  -c '{"Args":["0000000000000000000000000000000000000000","608060405234801561001057600080fd5b5060df8061001f6000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b114604e5780636d4ce63c146078575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060a0565b005b348015608357600080fd5b50608a60aa565b6040518082815260200191505060405180910390f35b8060008190555050565b600080549050905600a165627a7a72305820645b741fb425e55fe93343e04f015a790a9a1c0d7f19ec9ab2f68800f20299470029"]}' -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  # output
  [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 payload:"9aa59b002e3eff302c5290bc30eaa705d83f9753"
```

정상적으로 배포된 컨트랙트를 확인하기 위해 evmcc을 통해 동작중인 컨트랙트의 bytcode를 확인할 수 있다.
```bash
  # peer chaincode query -n evmcc -C <channel-name> -c '{"Args":["getCode","<contract addr>"]}'
  peer chaincode query -n evmcc -C mychannel -c '{"Args":["getCode","9aa59b002e3eff302c5290bc30eaa705d83f9753"]}'
  # output
  # 해당 payload(address)의 bytecode
```

#### Interacting with a Deployed Contract
배포 후 생성된 payload(address)를 통해서 스마트 컨트랙트를 수행할 수있다.

SimpleStorage 스마트 컨트랙트는 `set(x)` and `get()` 두개의 function으로 구성되어있다.  
`to` 필드에 address
`input` 필드에 function hash 입력(remix에서 해당 필드 트랜잭션 발생 후 로그에서 0x를 제외한 input값)

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

#### Getting the User Account Address
Fabic과 EVMCC에서는 user accounts의 정보를 저장, 사용하지 않지만 user pk로부터 user account address를 생성하는  
메카니즘이 있다. 필요에 따라 address는 EVMCC 트랜잭션 시 사용된다.

```bash
  peer chaincode query -n evmcc -C <channel-name> -c '{"Args":["account"]}'
  peer chaincode query -n evmcc -C mychannel -c '{"Args":["account"]}'
```
