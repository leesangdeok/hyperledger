# Burrow

## Prerequisites

* [go version 1.11.9](https://golang.org/dl/) or above
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

```bash
# To select our validator address by index in the GenesisDoc
burrow start --validator-index=0
# Or to select based on address directly (substituting the example address below with your validator's):
burrow start --validator-address=BE584820DC904A55449D7EB0C97607B40224B96E
```

## Deploy Contracts
컨트랙트 배포를 위해서 `solidity contracts` 와 `deploy.yaml`가 필요하다. 

예제인 deploy.yaml 와 storage.sol이 준비되면 디렉토리 내 다른 *.sol 이나 *.yaml 파일은 없어야 한다.


burrow spec --participant-accounts=1 --full-accounts=1 > genesis-spec.json
