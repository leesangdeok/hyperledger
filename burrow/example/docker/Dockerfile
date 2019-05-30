FROM ubuntu:16.04
# For solc binary
FROM ethereum/solc:0.4.25 as solc-builder
# We use a multistage build to avoid bloating our deployment image with build dependencies
FROM golang:1.12.0-alpine3.9 as builder

RUN apk add --no-cache --update git bash make

# Variable arguments to populate labels
ARG USER=burrow

# Run burrow as burrow user; not as root user
ENV BURROW_PATH /home/$USER
RUN addgroup -g 101 -S $USER && adduser -S -D -u 1000 $USER $USER
WORKDIR $BURROW_PATH

RUN wget https://github.com/hyperledger/burrow/releases/download/v0.25.1/burrow_0.25.1_Linux_x86_64.tar.gz
RUN tar -xvf burrow_0.25.1_Linux_x86_64.tar.gz -C $BURROW_PATH
RUN rm burrow_0.25.1_Linux_x86_64.tar.gz

# set burrow path
ENV PATH="${PATH}:$BURROW_PATH/bin"

ADD file/modify_config.sh modify_config.sh
ADD file/run_burrow.sh run_burrow.sh
RUN chmod +x modify_config.sh
RUN chmod +x run_burrow.sh

# create burrow*.toml files
ARG PEER
RUN burrow spec -f${PEER} | burrow configure -s- --pool

ARG HOST
RUN ./modify_config.sh ${HOST}

ARG INSTALL_BASE=/usr/local/bin
# Copy binaries built in previous stage
COPY --from=solc-builder /usr/bin/solc $INSTALL_BASE/

# Expose ports for 26656:peer; 26658:info; 10997:grpc
EXPOSE 26656
EXPOSE 26758
EXPOSE 10997
