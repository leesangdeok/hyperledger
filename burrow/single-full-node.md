# Burrow

## Prerequisites

* install [go](https://golang.org/dl/)
* set `$GOPATH`

## Install

* Download & Build
```bash
# GOPATH=/Users/test/gopath
cd $GOPATH/src/github.com/hyperledger
git clone https://github.com/hyperledger/burrow.git
cd burrow
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
burrow start --validator-address=414EADA263040BFD14E3545C3A8832A6B34494A6
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

## Send transactions to a burrow network1
[@monax/burrow](https://www.npmjs.com/package/@monax/burrow) 자바스립트 라이브러리를 이용하여 burrow GRPC를 통해 Hyperledger Burrow와 통신한다.

* 작업순서
  * simplestorage.sol 작성
  * simplestorage.sol 에 해당하는 deploy.yaml 작성
  * CLI에서 배포 후 생성된 deploy.output.json, simplestorage.bin을 dapp에서 로드
  * @monax/burrow 설치
  * GRPC 연결 및 컨트랙트 호출 코드 작성
  * 컨트랙트 호출

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

let chainURL = 'localhost:10997'; // GRPC 포트
const abiFile = './burrow/simplestorage.bin'; // 바이트코드
const deployFile = './burrow/deploy.output.json'; // ABI
const accountFile = './burrow/account.json'; // 사이닝을 위하 계정의 address

let chain = burrow.createInstance(chainURL, account.Address, {objectReturn: true}); // 인스턴스 생성
let store = chain.contracts.new(<ABI>, null, <CONTRACT-ADDRESS>); // simplestorage 컨트랙트 자바스크립트로 랩핑

// 솔리디티 get 메소드 호출
router.get('/', (req, res) => store.get()
    .then(ret => res.send(ret.values))
    .catch(err => res.send(handleError(err))));

// 솔리디티 set 메소드 호출
router.post('/', (req, res) => param(req.body, 'value')
    .then(value => asInteger(value))
    .then(value => store.set(value).then(() => value))
    .then(value => res.send({value: value, success: true}))
    .catch(err => res.send(handleError(err))));
```

참고 : [burrow.js](https://github.com/leesangdeok/hyperledger/blob/master/burrow/example/burrow.js)


## Send transactions to a burrow network2
[바로 위 예제](https://github.com/leesangdeok/hyperledger/blob/master/burrow/single-full-node.md#send-transactions-to-a-burrow-network1)의 경우 다음과 같은 어려움들이 존재한다. 
* 컨트랙트 작성 후 별도로 해당 컨트랙트에 해당하는 deploy.yaml 작성해야 한다. (컨트랙트 작성이 복잡할 수록 deploy.yaml 작성도 복잡해진다)
* deploy.yaml 작성하고 배포가 성공했더라도 정상적인 호출 확인이 어렵다.
* deploy.yaml작성과 배포에 많은 리소스가 들어갈 것으로 예상된다. 

### 더 나은 방법 찾아보기 
[hyperledger burrow wiki](https://wiki.hyperledger.org/display/burrow)의 Key Characteristics에 burrow는 `Hard to deploy` 지양한다고 설명하고 있다. 지금까지 어려운 방법으로 테스트를 진행했지만 믿어보고 진행하도록 하자

### DApp에서 컨트랙트 배포 및 호출하기
작업 절차 순서는 별다른 차이가 없지만 deploy.yaml의 작성 여부가 큰 차이를 보인다.

* 작업순서
  * simplestorage.sol 작성
  * solc 나 [remix](https://remix.ethereum.org)를 통한 컴파일
  * 컴파일 후 생성된 ABI, bytecode dapp에서 로드
  * @monax/burrow 설치
  * GRPC 연결 및 컨트랙트 호출 코드 작성
  * 컨트랙트 호출
  
* 인스턴스 생성하기
```javascript
const monax = require('@monax/burrow');
let burrowURL = 'localhost:10997';
const accountFile = './burrow/account.json';
let burrow = monax.createInstance(burrowURL, account.Address, {objectReturn: true});
```

* 컨트랙트 배포
  * deploy test : curl -H "Content-Type: application/json" -X POST http://127.0.0.1:3000/api/deploy
```javascript
let contractAddress;
const abi = [{....}]
const bytecode = '6080604052......';
let contract = burrow.contracts.new(abi, bytecode);

router.post('/deploy', async (req, res) => {
    contractAddress  = await contract._constructor('contract');
    console.log(">>>>>> contract address : " + contractAddress);
    res.send(contractAddress);
});
```

* 컨트랙트 호출
  * set test : curl -d '{"value": 2000}' -H "Content-Type: application/json" -X POST http://127.0.0.1:3000/api/set
  * get test : curl http://127.0.0.1:3000/api/get
```javascript
// 컨트랙트의 set 호출
router.post('/set', async (req, res) => {
    try {
        let result  = await contract.set.at(contractAddress, req.body.value)
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

// 컨트랙트의 get 호출
router.get('/get', async (req, res) => {
    try {
        let result  = await contract.get.at('contractAddress')
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});
```

참고 : [deploy-contracts-with-dapp.js](https://github.com/leesangdeok/hyperledger/blob/master/burrow/example/deploy-contracts-with-dapp.js)
