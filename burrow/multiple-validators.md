# Multiple validators
여러 validators를 멀티 호스트로 구성한다.

### 3개의 full accounts 와 validators 로 체인 구성하기
```bash
# GOPATH=/Users/test/gopath
 cd $GOPATH/src/github.com/hyperledger/burrow/bin
 rm -rf .burrow* .keys*
 burrow spec -f3 | burrow configure -s- --pool
 
 # output
 # burrow000.toml
 # burrow001.toml
 # burrow002.toml
 ```
 
### config 수정(burrow*.toml)

#### burrow*.toml
수정할 목록
* [Tendermint]
  * PersistentPeers
  * ListenHost
  * ListenPort
* [RPC]
  * [RPC.Info] ListenHost, ListenPort
  * [RPC.GRPC] ListenHost, ListenPort
   
#### 파일 동기화
생성된 .keys 폴더와 burrow00*.toml 파일들을 다른 호스트에 복사한다.

### 네트워크 시작하기

#### 첫 번째 노드 실행하기
```bash
burrow start --config=burrow000.toml &
```

burrow000.log에서 `Blockpool has no peers` 확인
노드가 네트워크에서 정족수 (2/3)을 채우기 위해 유효성 alidator power가 충분하지 않기 때문에 두 번째 유효성 validator 참여하기를 기다리는 동안 차단됩니다.

#### 두 번째 노드 실행하기
```bash
burrow start --config=burrow001.toml &
```

#### 세 번째 노드 실행하기
```bash
burrow start --config=burrow002.toml &
```
연결이 성공하면 빈 블록이 자동으로`Sending vote message`와`Finalizing commit of block with 0 txs`를 보게 될 것입니다. 

### 컨센서스 상태 보기
```bash
curl -s 127.0.0.1:26758/consensus
```
