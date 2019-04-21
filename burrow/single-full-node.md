# Burrow
Hyperledger Burrow is a permissioned Ethereum smart-contract blockchain node. It executes Ethereum EVM smart contract code (usually written in Solidity) on a permissioned virtual machine. Burrow provides transaction finality and high transaction throughput on a proof-of-stake Tendermint consensus engine.

## Prerequisites

* install [go](https://golang.org/dl/)
* set `$GOPATH`

## Install

* Download & Build
```bash
# GOPATH=/Users/test/gopath
git clone https://github.com/hyperledger/burrow.git
cd $GOPATH/src/github.com/hyperledger/burrow
make build
```

## Configure Burrow

* add an alias for burrow
```bash
vi ~/.zshrc

alias burrow='/Users/test/gopath/src/github.com/hyperledger/burrow/bin/burrow'
```

* burrow.toml 생성하기
```bash
burrow spec -p1 -f1 | burrow configure -s- > burrow.toml
```
or  
```bash
kdir chain_dir && cd chain_dir
burrow spec --participant-accounts=1 --full-accounts=1 > genesis-spec.json
burrow configure --genesis-spec=genesis-spec.json > burrow.toml
```

## Run Burrow

* burrow 시작하기
```bash
# To select our validator address by index in the GenesisDoc
burrow start --validator-index=0
burrow start --config burrow.toml --validator-index=0
# Or to select based on address directly (substituting the example address below with your validator's):
burrow start --validator-address=BE584820DC904A55449D7EB0C97607B40224B96E
```
* node 재설정
.burrow 디렉토리 삭제로 node 재설정이 가능하다.
```bash
rm -rf .burrow
```

## Deploy Contracts
컨트랙트 배포를 위해서 `solidity contracts` 와 `deploy.yaml` 두 파일이 필요하고 Solidity code 컴파일을 위해서 [solc binary](https://solidity.readthedocs.io/en/v0.4.21/installing-solidity.html) 가 설치되어야 한다.
예제인 [deploy.yaml](https://github.com/leesangdeok/hyperledger/blob/master/burrow/example/deploy.yaml) 와 [simplestorage.sol](https://github.com/leesangdeok/hyperledger/blob/master/burrow/example/simplestorage.sol)이 준비되면 디렉토리 내 다른 *.sol 이나 *.yaml 파일은 없어야 한다.

* 컨트랙트 배포
`burrow.toml` 에 정의된 `ValidatorAddress` 중 컨트랙트 생성 권한이 있는 address를 사용한다.
```bash
burrow deploy --address 414EADA263040BFD14E3545C3A8832A6B34494A6 deploy.yaml

#output
#deploy.output.json
```

## Send transactions to a burrow network
[@monax/burrow](https://www.npmjs.com/package/@monax/burrow) 자바스립트 라이브러리를 이용하여 burrow GRPC를 통해 Hyperledger Burrow와 통신한다.

* Prerequisites
  * Burrow version 0.20 or higher
  * Node.js version 7 or higher
  
* @monax/burrow 설치
```bash
npm install @monax/burrow
```

* burrow와 통신을 위한 파일 준비
배포후 생성된 simplestorage.bin(abi), deploy.output.json, [account.json](https://github.com/leesangdeok/hyperledger/blob/master/burrow/example/account.json) 준비
```javascript
const monax = require('@monax/burrow');
let chainURL = 'localhost:10997'; //GRPC 포트
const abiFile = './burrow/simplestorage.bin';
const deployFile = './burrow/deploy.output.json';
const accountFile = './burrow/account.json'; // 사이닝을 위하 계정의 address
```
