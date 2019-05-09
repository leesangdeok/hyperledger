## docker build

* PEER : 생성할 PEER의 수
* HOST : 생성할 PEER들의 IP:PORT 정보

docker build --tag abt-burrow --build-arg PEER=3 --build-arg HOST="10.0.0.1:26656 10.0.0.2:26656 10.0.0.3:26656" .

## docker run

* NUM : 실행할 PEER의 번호 (ex. 000, 001, 002...)

docker run -d --rm --network=host --name abt-burrow-ins -p 26656:26656 -p 26758:26758 -p 10997:10997 abt-burrow ./run_burrow.sh {NUM}
