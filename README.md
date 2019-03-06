# Hyperledger Fabric

## Prerequisites

### Docker and docker compose
* Docker version 17.06.2-ce or greater is required.
* Docker Compose version 1.14.0 or greater installed.

### Go Programming Language
* Go version 1.11.x is required
```bash
$ wget -P /usr/local https://dl.google.com/go/go1.11.5.darwin-amd64.tar.gz (mac)

$ tar -xzf go1.11.5.darwin-amd64.tar

$ export PATH=$PATH:/usr/local/go/bin

$ go version
```

### Node.js Runtime and NPM
* Node.js version 8.9.x of Node.js installed.  
[install Node.js](https://github.com/leesangdeok/nvm)
* Python version 2.7.x (ubuntu 16.04 users only!!!)  
  Fabric Node.js SDK에서 npm 사용 시 python 2.7.x 필요
  
## Building Your First Network

### Install Samples, Binaries and Docker Images
```bash
$ curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.0
```

### path 환경설정
```bash
# export PATH=<path to download location>/bin:$PATH
$ export PATH=$PWD/fabric-samples/bin:$PATH
```

### Generate Network Artifacts
```bash
$ cd fabric-samples/first-network
$ ./byfn.sh generate
```

### Bring Up the Network  
* go chaincode(default)
```bash
$ ./byfn.sh up 
```
* node chaincode
```bash
$ ./byfn.sh up -l node
```
* java chaincode
```bash
$ ./byfn.sh up -l java
```

### Bring Down the Network
```bash
$ ./byfn.sh down
```
## Building Your First Network (수동설정)
### Configuration Transaction 생성
* MSP 생성  
orderer, peer user 클라이언트 정보 생성
```bash
$ ../bin/cryptogen generate --config=./crypto-config.yaml
# outpurt
org1.example.com
org2.example.com

# 환경설정
$ export FABRIC_CFG_PATH=$PWD
```

* Genesis block 생성  
하이퍼레저 패브릭 컨소시엄과 채널 정보가 담긴 genesis.block 생성
```bash
$ ../bin/configtxgen -profile TwoOrgsOrdererGenesis -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block
#output (channel-artifacts 디렉토리에 genesis block생성)
2019-02-28 16:01:00.823 KST [common.tools.configtxgen] main -> INFO 001 Loading configuration
2019-02-28 16:01:00.845 KST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 002 orderer type: solo
2019-02-28 16:01:00.845 KST [common.tools.configtxgen.localconfig] Load -> INFO 003 Loaded configuration: /tmp/fabric-samples/first-network/configtx.yaml
2019-02-28 16:01:00.867 KST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 004 orderer type: solo
2019-02-28 16:01:00.867 KST [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 005 Loaded configuration: /tmp/fabric-samples/first-network/configtx.yaml
2019-02-28 16:01:00.870 KST [common.tools.configtxgen] doOutputBlock -> INFO 006 Generating genesis block
2019-02-28 16:01:00.870 KST [common.tools.configtxgen] doOutputBlock -> INFO 007 Writing genesis block
```

* 채널 설정  
configtx.yaml의 TwoOrgsChannel을 참조하여 채널 구축을 위한 channel.tx 트랜젝션 생성
```bash
$ export CHANNEL_NAME=mychannel  && ../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
# output
2019-02-28 16:09:14.982 KST [common.tools.configtxgen] main -> INFO 001 Loading configuration
2019-02-28 16:09:15.005 KST [common.tools.configtxgen.localconfig] Load -> INFO 002 Loaded configuration: /tmp/fabric-samples/first-network/configtx.yaml
2019-02-28 16:09:15.026 KST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 003 orderer type: solo
2019-02-28 16:09:15.026 KST [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 004 Loaded configuration: /tmp/fabric-samples/first-network/configtx.yaml
2019-02-28 16:09:15.026 KST [common.tools.configtxgen] doOutputChannelCreateTx -> INFO 005 Generating new channel configtx
2019-02-28 16:09:15.027 KST [common.tools.configtxgen] doOutputChannelCreateTx -> INFO 006 Writing new channel tx
```

* Anchor peer 설정(다른 조직간 통신)  
TwoOrgsChannel을 참조하여 각 조직의 Anchor peer 설정 트랜잭셔 생성
```bash
# Anchor peer for Org1
$ ../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP

# Anchor peer for Org2
$ ../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
```

### start the network
```bash
$ docker-compose -f docker-compose-cli.yaml up -d
# 컨테이너 목록 확인
$ docker ps
# 로그확인
$ docker logs {container name}

# 다른 peers나 orderer 호출할 경우 docker실행 전 base/docker-compose-base.yaml 수정 
```

### Create & Join Channel
* docker CLI container 접속
```bash
$ docker exec -it cli bash

# container에 접속된 상태
root@c9af1f76d0ea:/opt/gopath/src/github.com/hyperledger/fabric/peer#
```

* Create & Join Channel
```bash
# Environment variables for PEER0
export CHANNEL_NAME=mychannel

# the channel.tx file is mounted in the channel-artifacts directory within your CLI container
# as a result, we pass the full path for the file
# we also pass the path for the orderer ca-cert in order to verify the TLS handshake
# be sure to export or replace the $CHANNEL_NAME variable appropriately

peer# peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
# output
2019-02-28 09:25:11.612 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2019-02-28 09:25:11.657 UTC [cli.common] readBlock -> INFO 002 Received block: 0
```

* peer 채널에 조인
```bash
# By default, this joins ``peer0.org1.example.com`` only
# the <channel-ID.block> was returned by the previous command
# if you have not modified the channel name, you will join with mychannel.block
# if you have created a different channel name, then pass in the appropriately named block

# Org1("peer0.org1.example.com")
peer# peer channel join -b mychannel.block
# output
2019-02-28 09:28:30.363 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2019-02-28 09:28:30.399 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel

# Org2("peer0.org1.example.com")
peer# CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt peer channel join -b mychannel.block
```

### Update the anchor peers
```bash
# Org1(peer0.org1.example.com)
peer# peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
# output
2019-03-03 14:41:30.224 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2019-03-03 14:41:30.242 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update

# Org2(peer0.org2.example.com)
peer# CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
# output
2019-02-28 09:41:53.478 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2019-02-28 09:41:53.494 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update
```

### Install Chaincode
* Golang
```bash
# Org1
peer# peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/
# output
2019-02-28 09:46:37.093 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-02-28 09:46:37.093 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2019-02-28 09:46:37.299 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" >
# Org2
peer# CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/
# output
2019-02-28 09:52:20.064 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-02-28 09:52:20.064 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2019-02-28 09:52:20.267 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" >
```
* Node.js
```bash
peer# peer chaincode install -n mycc -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/chaincode_example02/node/
```
* Java
```bash
peer# peer chaincode install -n mycc -v 1.0 -l java -p /opt/gopath/src/github.com/chaincode/chaincode_example02/java/
```

### Instantiate Chaincode
* Golang
```bash
peer# peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
# output
2019-02-28 09:59:39.755 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-02-28 09:59:39.755 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
```
* Node.js
```bash
peer# peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -l node -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
```
* Java
```bash
peer# peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -l java -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
```

### Test
* Query  
a계정 잔액조회
```bash
peer# peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
# output
100
```
* Invoke  
a에서 b에게 10 전달
```bash
peer# peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["invoke","a","b","10"]}'
```
* Query  
a계정 잔액조회
```bash
peer# peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
# output
90
```
* Query  
b계정 잔액조회
```bash
peer# peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","b"]}'
# output
210
```
