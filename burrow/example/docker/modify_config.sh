#!/bin/bash

FILELIST=`ls -1 burrow*.toml`
FILELIST_LEN=`ls -1 burrow*.toml | wc -l`

echo "ARGS=$@"

# check file count
if [ $# != $FILELIST_LEN ]
then
        echo "required $FILELIST_LEN IP:Port"
        echo ">>> ./modify_config.sh IP:Port IP:Port ..."
        exit 1
fi

# modify host & port
FILELIST_IDX=0
ARGS_IDX=0
for file in $FILELIST
do
        echo "$file"
        # RPC.Info, RPC.Profiler, RPC.GRPC, RPC.Metrics IP
        sed -i -e '/RPC.Info/,/Logging/ s/127.0.0.1/0.0.0.0/' $file
        # RPC.Info Port
        sed -i -e '/RPC.Info/,/RPC.Profiler/ s/[0-9]\{4,5\}/26758/' $file
        # RPC.GRPC Port
        sed -i -e '/RPC.GRPC/,/RPC.Metrics/ s/[0-9]\{4,5\}/10997/' $file

        for i in "$@"
        do
                IP=`echo $i | cut -d ":" -f1`
                PORT=`echo $i | cut -d ":" -f2`
                echo "IP:$IP |  PORT:$PORT"

                if [ $FILELIST_IDX = $ARGS_IDX ]
                then
                        HOST_LINE=`grep -n "ListenHost" $file | head -1 | cut -d: -f1`
                        PORT_LINE=`grep -n "ListenPort" $file | head -1 | cut -d: -f1`
                        sed -i -e "${HOST_LINE} s/127.0.0.1/${IP}/" $file
                        sed -i -e "${PORT_LINE} s/[0-9]\+/${PORT}/" $file
                else
                        sed -i -e "s/127.0.0.1:[0-9]\+/${IP}:${PORT}/" $file
                fi
                ARGS_IDX=$((ARGS_IDX+1))
        done

        FILELIST_IDX=$((FILELIST_IDX+1))
        ARGS_IDX=0
done
