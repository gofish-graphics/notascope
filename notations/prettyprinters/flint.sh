#!/bin/zsh

cat $1 | jq 'del(..|.data?.values?)' | jq -S > $2
