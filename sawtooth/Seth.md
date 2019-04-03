# Sawtooth-Seth

Sawtooth 프로젝트에서 분리되어 별도로 페키징된 Seth를 사용하기 가장 좋은 방법은 docker-compose를 이용하는 것이다. 

## Prerequisites
* Docker and docker compose

 `sawtooth-seth` 다운
최신버전 Seth는 현재 bug가 존재하여 제대로 실행되지 않는다.   
2018.12.14까지 commit 된  `0a409f333ed6311e3c65f4e6101accb2d438487f ` 버전을 사용한다.

```bash
    $ git clone https://github.com/hyperledger/sawtooth-seth.git
    $ cd sawtooth-seth
    $ git checkout 0a409f333ed6311e3c65f4e6101accb2d438487f
    $ git branch
```

## Seth 시작하기

Seth 컨포넌트들이 정의된 Dockerfile과 docker 이미지와 컨테이너들을 빌드할 docker-compose 파일들이 있다.

```bash
    $ docker-compose up --build
```

* Seth가 정상적으로 실행 시 연동되는 포트

| Host Port | Service |
|:---------:|:-------:|
|8080       | Sawtooth REST API Server     |
|3030       | Seth-RPC Server          |

* REST API 확인

```bash
    $ curl http://0.0.0.0:8080/blocks
```

* Seth-RPC 확인
```bash
    $ curl http://0.0.0.0:3030 -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber"}' -H "Content-Type: application/json"
    # 현재 block 정보
    {"jsonrpc":"2.0","result":"0x1","id":1}
```


## Creating an Account

* Generating a Key Pair

Seth와 연동을 위해서 계정을 생성해야 하고 두가지 secp256k1 PK 포멧을 사용한다.

1. ``sawtooth keygen``에 의해 생성된 A plaintext hex encoded private key
2. ``openssl`` 커맨드로 생성한 A PEM encoded private key 

* PEM encoded key 생성하기

``seth-cli-go`` 컨테이너에 이미 OpenSSL이 설치되어 컨테이너에 연결해서 명령어만 실행하면 된다.

```bash
    $ docker exec -it seth-cli-go bash
```

root로 해당 컨테이너에 접속해야 되고 ``openssl`` 커맨드로 새로운  password-encrypted key를 생성한다.  
마지막에 ``-aes128``를 붙인 암호문을 사용하거나 이 flag를 제외하고 암호화되지 않은 키를 생성할 수 있다.  

```bash
    $ openssl ecparam -genkey -name secp256k1 | openssl ec -out key-file.pem -aes128
    
    read EC key
    writing EC key
    Enter PEM pass phrase:
    Verifying - Enter PEM pass phrase:
```

키가 생성되면 network에 계정을 생성할 준비가 된것이고 키를 생성할지 ``seth`` 커맨드로 실행한다.
내부 디렉토리에 키를 복사하고 나중에 사용할 커맨드를 위해서 alias를 생성한다.

```bash
    $ seth account import key-file.pem myalias
    
    Key at key-file.pem imported with alias myalias
```

 ``seth`` 커맨드로 network에 계정을 생성한다.
```bash
    $ seth account create --nonce=0 --wait myalias
    
    Enter Password to unlock myalias:
    Account created
    Transaction Receipt:  {
      "TransactionID": "af5f666976497413d2d81c05ece843ffb64260ed122253b0367ba818ca130e856543862c439be8e3ad1ddec078496e8e6e668c883cd00734de8c7f71b3e05361",
      "Address": "f6fe0c0cd896f1840eff12ebd53e44f45b043409"
    }
```

계정의 address, nonce 정보 확인
```bash
    #seth show account {address}
    $ seth show account f6fe0c0cd896f1840eff12ebd53e44f45b043409
    
    Address: f6fe0c0cd896f1840eff12ebd53e44f45b043409
    Balance: 0
    Code   :
    Nonce  : 1
    Perms  : +root,+send,+call,+contract,+account
```
