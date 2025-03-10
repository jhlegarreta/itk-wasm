#!/usr/bin/env bash

set -eo pipefail

debug=true
for param; do
  if [[ $param == '--no-debug' ]]; then
    debug=false
  else
    newparams+=("$param")
  fi
done
set -- "${newparams[@]}"  # overwrites the original positional params

TAG=$(date '+%Y%m%d')-$(git rev-parse --short HEAD)

if test ! -z ${DOCKERHUB_ITKWasm_PASSWORD+x}; then
  echo $DOCKERHUB_ITKWasm_PASSWORD | docker login --username "$DOCKERHUB_ITKWasm_USERNAME" --password-stdin
fi

function push_image() {
  local image=$1
  local tag=$2
  local debug=$3
  docker push ${image}:${tag}
  docker tag ${image}:${tag} quay.io/${image}:${tag}
  docker push quay.io/${image}:${tag}
  if $debug; then
    docker push ${image}:${tag}-debug
    docker tag ${image}:${tag}-debug quay.io/${image}:${tag}-debug
    docker push quay.io/${image}:${tag}-debug
  fi
}

push_image itkwasm/wasi ${TAG} ${debug}
push_image itkwasm/wasi-base ${TAG} ${debug}
push_image itkwasm/emscripten ${TAG} ${debug}
push_image itkwasm/emscripten-base ${TAG} ${debug}