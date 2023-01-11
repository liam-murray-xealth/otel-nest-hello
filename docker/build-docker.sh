#!/usr/bin/env bash
#
# For testing:
#  - sets some env vars (e.g. GITHUB_SHA_SHORT) 
#
# Normally you can just run "docker compose build"
#
IMAGE_NAME=otel-hello
VERSION=latest

: ${GITHUB_SHA_SHORT:=$(git rev-parse --short HEAD)}

# <commit-hash>
echo "Building $IMAGE_NAME:$GITHUB_SHA_SHORT"
docker build --build-arg GITHUB_SHA_SHORT --tag "$IMAGE_NAME:$GITHUB_SHA_SHORT" ..


echo "Tagging $IMAGE_NAME:$GITHUB_SHA_SHORT => $VERSION"
docker tag $IMAGE_NAME:$GITHUB_SHA_SHORT $IMAGE_NAME:$VERSION
