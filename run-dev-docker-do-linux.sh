#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"
cd $MY_DIR

docker run \
    --rm \
    -it \
    -v ~/.kube/config:/root/.kube/config \
    -v ~/.config/doctl/config.yaml:~/.config/doctl/config.yaml \
    -p 5001:5001 \
    -e NODE_ENV=development \
    kubevious/portable:dev-do