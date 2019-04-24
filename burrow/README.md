# What is Burrow
하이퍼레저 버로우는 Ethereum 사양에 따라 스마트 컨트랙트 코드를 실행하는 허가된 블록체인 노드다. 버로우는 어플리케이션별 최적화를 염두에 두고 멀티체인 우주를 위해 구축되었다. 노드로써 버로우는 컨센서스 엔진, 허가된 Ethereum 가상 시스템 및 rpc 게이트웨이의 세 가지 주요 구성 요소로 구성된다. 

* Consensus Engine: 트랜잭션은 Byzantine fault-tolerant Tendermint 프로토콜을 사용하여 정렬되고 완료된다. Tendermint 프로토콜은 알려진 일련의 검증자보다 높은 트랜잭션 처리량을 제공하고 블록체인의 분기를 방지한다.

* Application Blockchain Interface (ABCI): 스마트 컨트랙트 어플리케이션은 ABCI를 통한 컨센서스 엔진과 인터페이스로 접속한다. ABCI는 컨센서스 엔진이 스마트 컨트랙트 어플리케이션과 무관하게 유지되도록한다.

* Smart Contract Application: 트랜잭션은 컨센서스 엔진이 완료한 순서대로 검증되고 어플리케이션 스테이트(state)에 적용된다. 어플리케이션 스테이트(state)에는 모든 account, validator set 및 name registry로 구성된다. 버로우의 계정은 권한이 있으며 스마트 컨트랙트 코드를 포함하거나 public-private 키 쌍에 해당된다. 특정 계정의 스마트 컨트랙트 코드를 호출하는 트랜잭션은 허가된 VM에서 해당 계정의 코드 실행을 활성화할 것이다.

* Permissioned Ethereum Virtual Machine: 
이 VM은 Ethereum 작업 코드 사양을 준수하도록 구축되었으며, 추가적으로 올바른 권한이 부여되었음을 주장한다. 권한 부여는 secure native functions을 통해 수행되며 모든 스마트 컨트랙트 코드의 기초가 된다. 한정된 실행 기간을 보장하기 위해 모든 실행에 대해 임의의 제한된 양의 가스가 전달된다. - "이용할 수 있는 권한이 있을 때, 돈을 낼 필요가 없다."

* Application Binary Interface (ABI): 트랜잭션은 블록체인 노드에서 처리할 수 있는 바이너리 포맷으로 나타낼 필요가 있다. 현재의 툴링은 솔리디티 스마트 컨트랙트를 컴파일, 배포 및 연계하고 거래를 형성하여 체인 상의 스마트 컨트랙트를 호출할 수 있는 기능을 제공한다.

* API Gateway: 버로우는 전파된 트랜잭션을 통해 블록체인 네트워크 및 어플리케이션 상태와 상호작용하거나 어플리케이션의 현재 상태를 쿼리하기 위해 REST 및 JSON-RPC 엔드포인트를 노출한다. 웹 소켓은 이벤트 등록 허용으로 컨센서스 엔진 및 스마트 컨트랙트 어플리케이션이 약 1 초의 블록타임 내에 트랜잭션에 명확한 최종 결과를 제공 할 수 있으므로 특히 유용하다.

## Key Characteristics
### Burrow 의 3가지 목표:
* 통합체를 위한 호환성이 뛰어나고 단순한 EVM 라이브러리 제공 (예 [sawtooth-seth](https://github.com/hyperledger/sawtooth-seth))
* 트랜잭션 완결성을 갖춘 Tendermint/EVM의 허가된 전체 원장을 빠르고 가볍고 슬림한 단일 프로세스
* 멀티체인 세계에 EVM 확장을 위한 실질적인 기반을 제공 
### Burrow 가 지양하는 것 :
* 고도로 플러그형 (Sawtooth 나 Fabric 처럼)
* 배포의 어려움


## Minimum requirements
Requirement|Notes
---|---
Go version | Go1.11 or higher