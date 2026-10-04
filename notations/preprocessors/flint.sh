#!/bin/zsh

cat $1 | jq 'del(..|.data?.values?)' | jq -c -S > $2
