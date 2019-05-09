#!/bin/bash

burrow start --config=burrow$1.toml

tail -f burrow$1.log
