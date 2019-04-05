# Sawtooth-Seth

Seth는 Sawtooth 프로젝트에서 분리되어 별도로 페키징되었고 사용하기 가장 좋은 방법은 docker-compose를 이용하는 것이다. 

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


### Creating an Account

* Generating a Key Pair

Seth와 연동을 위해서 계정을 생성해야 하고 두가지 secp256k1 PK 포멧을 사용한다.

1. ``sawtooth keygen``에 의해 생성된 A plaintext hex encoded private key
2. ``openssl`` 커맨드로 생성한 A PEM encoded private key 

* PEM encoded key 생성하기

**seth-cli-go 접속**  
``seth-cli-go`` 컨테이너에 이미 OpenSSL이 설치되어 컨테이너에 연결해서 명령어만 실행하면 된다.

```bash
    $ docker exec -it seth-cli-go bash
```

**password-encrypted key 생성**  
root로 해당 컨테이너에 접속해야 되고 ``openssl`` 커맨드로 새로운  password-encrypted key를 생성한다.  
마지막에 ``-aes128``를 붙인 암호문을 사용하거나 이 flag를 제외하고 암호화되지 않은 키를 생성할 수 있다.  

```bash
    $ openssl ecparam -genkey -name secp256k1 | openssl ec -out key-file.pem -aes128
    
    read EC key
    writing EC key
    Enter PEM pass phrase:
    Verifying - Enter PEM pass phrase:
```

**alias 생성**  
키가 생성되면 network에 계정을 생성할 준비가 된것이고 키를 생성할지 ``seth`` 커맨드로 실행한다.
내부 디렉토리에 키를 복사하고 나중에 사용할 커맨드를 위해서 alias를 생성한다.

```bash
    $ seth account import key-file.pem myalias
    
    Key at key-file.pem imported with alias myalias
```

**계정 생성**  
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

* 계정의 address, nonce 정보 확인
```bash
    #seth show account {address}
    $ seth show account f6fe0c0cd896f1840eff12ebd53e44f45b043409
    
    Address: f6fe0c0cd896f1840eff12ebd53e44f45b043409
    Balance: 0
    Code   :
    Nonce  : 1
    Perms  : +root,+send,+call,+contract,+account
```

## Contract

계정을 생성했다면 EVM 스마트 컨트랙트 배포 시 사용가능하다.  
컨트랙트 배포와 호출을 위해 ``contracts/contract.sol`` 파일을 생성한다.

```javascript
  pragma solidity ^0.4.0;

  contract intkey {
    mapping (uint => uint) intmap;

    event Set(uint key, uint value);

    function set(uint key, uint value) public {
      intmap[key] = value;
      emit Set(key, value);
    }

    function inc(uint key) public {
      intmap[key] = intmap[key] + 1;
    }

    function dec(uint key) public {
      intmap[key] = intmap[key] - 1;
    }

    function get(uint key) public constant returns (uint retVal) {
      return intmap[key];
    }
  }
```

.. _Solidity: https://solidity.readthedocs.io/en/develop/

sawtooth-seth 디렉토리의 컨트랙트 사용하기
```bash
    cd sawtooth-seth/
    cp contracts/examples/simple_intkey/simple_intkey.sol contracts/contract.sol
```

### Contracts 컴파일

배포 전 먼저 컴파일을 진행한다. ``solc``로 컴파일 후 hex-encoded byte array형태로 ``seth`` client에 사용될 것이다.

* 컨트랙트 컴파일  
앞으로 사용될 hex-encoded bytes를 저장한다.
```bash
    $ solc --bin contract.sol

    ======= simple_intkey.sol:intkey =======
    Binary:
    608060405234801561001057600080fd5b50610239806100206000396000f300608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631ab06ee514610067578063812600df1461009e5780639507d39a146100cb578063c20efb901461010c575b600080fd5b34801561007357600080fd5b5061009c6004803603810190808035906020019092919080359060200190929190505050610139565b005b3480156100aa57600080fd5b506100c960048036038101908080359060200190929190505050610193565b005b3480156100d757600080fd5b506100f6600480360381019080803590602001909291905050506101c2565b6040518082815260200191505060405180910390f35b34801561011857600080fd5b50610137600480360381019080803590602001909291905050506101de565b005b80600080848152602001908152602001600020819055507f545b620a3000f6303b158b321f06b4e95e28a27d70aecac8c6bdac4f48a9f6b38282604051808381526020018281526020019250505060405180910390a15050565b600160008083815260200190815260200160002054016000808381526020019081526020016000208190555050565b6000806000838152602001908152602001600020549050919050565b6001600080838152602001908152602001600020540360008083815260200190815260200160002081905550505600a165627a7a72305820db9e778e020441599ea5a4c88fbc38a17f36647f87712224f92815ad23c3d6a00029
```


### Deploying Contracts

* 컨트랙트 배포  
``{contract}``에 앞에서 저장한 hex 데이터를 입력한다. 
```bash
    $ seth contract create --wait {alias} {contract}
    
    Enter Password to unlock myalias:
    Contract created
    Transaction Receipt:  {
      "TransactionID": "378c465f1f9712e3af47f13f4aa21fc52b2e03142e738ec43e76f7674280b1e621b440a73c26578cf95dcaadc6c5ad27ef286ce9607131788521e6c4e8c6df9c",
      "GasUsed": 24,
      "Address": "43a428f3578e928616a5f1f620920b1ce045bfad",
      "ReturnValue": "608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631ab06ee514610067578063812600df1461009e5780639507d39a146100cb578063c20efb901461010c575b600080fd5b34801561007357600080fd5b5061009c6004803603810190808035906020019092919080359060200190929190505050610139565b005b3480156100aa57600080fd5b506100c960048036038101908080359060200190929190505050610193565b005b3480156100d757600080fd5b506100f6600480360381019080803590602001909291905050506101c2565b6040518082815260200191505060405180910390f35b34801561011857600080fd5b50610137600480360381019080803590602001909291905050506101de565b005b80600080848152602001908152602001600020819055507f545b620a3000f6303b158b321f06b4e95e28a27d70aecac8c6bdac4f48a9f6b38282604051808381526020018281526020019250505060405180910390a15050565b600160008083815260200190815260200160002054016000808381526020019081526020016000208190555050565b6000806000838152602001908152602001600020549050919050565b6001600080838152602001908152602001600020540360008083815260200190815260200160002081905550505600a165627a7a72305820db9e778e020441599ea5a4c88fbc38a17f36647f87712224f92815ad23c3d6a00029"
```

* 배포된 컨트랙트 확인  
``address``에 정상적으로 생성된 address정보를 입력한다.
```bash
    $ seth show account {address}
    
    Address: 43a428f3578e928616a5f1f620920b1ce045bfad
    Balance: 0
    Code   : 608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631ab06ee514610067578063812600df1461009e5780639507d39a146100cb578063c20efb901461010c575b600080fd5b34801561007357600080fd5b5061009c6004803603810190808035906020019092919080359060200190929190505050610139565b005b3480156100aa57600080fd5b506100c960048036038101908080359060200190929190505050610193565b005b3480156100d757600080fd5b506100f6600480360381019080803590602001909291905050506101c2565b6040518082815260200191505060405180910390f35b34801561011857600080fd5b50610137600480360381019080803590602001909291905050506101de565b005b80600080848152602001908152602001600020819055507f545b620a3000f6303b158b321f06b4e95e28a27d70aecac8c6bdac4f48a9f6b38282604051808381526020018281526020019250505060405180910390a15050565b600160008083815260200190815260200160002054016000808381526020019081526020016000208190555050565b6000806000838152602001908152602001600020549050919050565b6001600080838152602001908152602001600020540360008083815260200190815260200160002081905550505600a165627a7a72305820db9e778e020441599ea5a4c88fbc38a17f36647f87712224f92815ad23c3d6a00029
    Nonce  : 1
    Perms  : -root,+send,+call,+contract,+account
    (No Storage Set)
```

.. note::  
  컨트랙트 address를 잃어버릴 경우 ``seth contract list {alias}``로 확인 가능하다.

.. For more info,  
  _Ethereum Quirks and Vulns: http://martin.swende.se/blog/Ethereum_quirks_and_vulns.html

### Calling Contracts

배포된 컨트랙트 호출을 위해 컨트랙트 address, 호출을 위해 input data가 필요하다.  
컨트랙트의 function을 사용하기 위해 Solidity는 `Application Binary Interface`_ 또는 ABI와  
호출 시 필요한 args를 사용한다.  
컨트랙트 호출을 위한 여러 방법 중 하나가 ``seth`` client(`ethereumjs-abi`_ library) 이고  
seth docker container에 설치되어 있다.

.. _Application Binary Interface: https://solidity.readthedocs.io/en/develop/abi-spec.html  
.. _ethereumjs-abi: https://www.npmjs.com/package/ethereumjs-abi

* simpleEncode 라이브러리 사용  
컨트랙트의 function을 호출하기 위하여 ``simpleEncode`` 라이브러리를 사용한다.  
컨트랙트의 ``set()`` function을 호출하기 위하여 다음고 같이 먼저 ``19`` 와 ``42``를 컨트랙트에 배포한다.
```javascript
    $ node
    > var abi = require('ethereumjs-abi')
    undefined
    > abi.simpleEncode("set(uint,uint)", "0x13", "0x2a").toString("hex")
    '1ab06ee50000000000000000000000000000000000000000000000000000000000000013000000000000000000000000000000000000000000000000000000000000002a'
```

* 컨트랙트의 ``set(19,42)`` 호출하기  
``{input}``에 위에서 생성한 contract의 ABI를 따라 hex포맷을 입력한다.  
정상적으로 호출되면 transaction은 성공된것이고 transaction id를 확인할 수 있다.
```bash
    $ seth contract call --wait {alias} {address} {input}
```

* 호출 검증  
정상적인 호출 확인을 위해 ``{transaction-id}``에 컨트랙트 호출 후 나오는 id 입력
```bash
    $ seth show receipt {transaction-id}
```

