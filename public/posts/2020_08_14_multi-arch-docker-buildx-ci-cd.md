---
title: Multi Arch Docker Buildx in CI/CD
description: Automated Multi Arch Docker Image Builds
tags: technical,docker,devops,ci,cd
---

I've recently been working on some projects with some heavy dependencies
(FFmpeg, scipy, NumPy, etc).

Python Libraries, in particular, take forever to install if a
[wheel](https://pythonwheels.com/) is not available for your OS/Arch
[This](https://pythonspeed.com/articles/alpine-docker-python/) explains why it
takes so long to build on Alpine (not even a different arch).

> Side note: Future Mac's being ARM-based makes the issue of multi-arch builds
> even more poignant.

For less common platforms eg linux/arm/v6 (pi zero and original pis) or
linux/arm64 some of these builds can take forever and require a dedicated PI (or
a
[emulated VM](/posts/gondola_ansible_playbook_for_emulating_raspberry_pi_os_with_kvm))

#### The Difference is in the logs

To demonstrate this we can look at the buildx logs of a image _based_ on the one
_we will be building_ in this post.

If we later build the image on an arm64 based on our prebuilt multi arch image
we can see it's building for `linux/arm64`, we can also see it

- already has Pythom FFmpeg
- Installing Pip packages
  - `aionotify` does have a pre built wheel for this arch.
  - `asyncpg` doesn't have a wheel to download for this arch

The `asyncpg` not having a wheel is what takes so long for different
distributions/architectures.

```bash
 => CACHED [linux/arm64 production 4/5] COPY requirements.txt /app/requirements.txt                                                                                                                                                                                                                                                 0.0s
 => [linux/arm64 production 5/5] RUN apt-get update     && apt-get install -y build-essential     && pip install --no-cache-dir -r requirements.txt && apt-get remove -y build-essential && apt-get auto-remove -y && rm -rf /var/lib/apt/lists/*                                                                                  75.5s
 => => # Requirement already satisfied: python-ffmpeg==1.0.11 in /usr/local/lib/python3.8/site-packages (from -r requirements.txt (line 3)) (1.0.11)
 => => # Collecting aionotify==0.2.0
 => => #   Downloading aionotify-0.2.0-py3-none-any.whl (6.6 kB)
 => => # Requirement already satisfied: pyee in /usr/local/lib/python3.8/site-packages (from python-ffmpeg==1.0.11->-r requirements.txt (line 3)) (7.0.2)
 => => # Building wheels for collected packages: asyncpg
 => => #   Building wheel for asyncpg (setup.py): started
```

## [Docker BuildX](https://docs.docker.com/buildx/working-with-buildx/)

Some notes from the Docker Docs.

> Docker Buildx is a CLI plugin that extends the docker command.... It provides
> the same user experience as docker build with many new features like creating
> scoped builder instances and building against multiple nodes concurrently.

...

> Build multi-platform images BuildKit is designed to work well for building for
> multiple platforms and not only for the architecture and operating system that
> the user invoking the build happens to run. When you invoke a build, you can
> set the --platform flag to specify the target platform for the build output,
> (for example, linux/amd64, linux/arm64, darwin/amd64).

Now to show your how to install BuildX (they say it comes with 19.03 and up but
does not..) we can look at the dockerfile I wrote for a buildx enabled docker
image (to run
[docker in docker](https://www.docker.com/blog/docker-can-now-run-within-docker/))
.

To install locally just run the last two `RUN`'s.

```dockerfile
FROM docker:19.03.10

RUN wget https://github.com/docker/buildx/releases/download/v0.4.1/buildx-v0.4.1.linux-amd64

RUN mkdir -p ~/.docker/cli-plugins && mv buildx-v0.4.1.linux-amd64  ~/.docker/cli-plugins/docker-buildx && chmod a+x ~/.docker/cli-plugins/docker-buildx
```

Source for this can be found on
[Github](https://github.com/ncrmro/docker-buildx) the Docker Image is available
[here](https://hub.docker.com/repository/docker/ncrmro/docker-buildx)

## Automated Builds and Deployment (CI/CD)

### The Dockerfile

Let's take a super simple example. We want to create an image based on the
standard [python image](https://hub.docker.com/_/python), that comes
preinstalled with [FFMPEG](https://ffmpeg.org/). More so we want to build this
for multiple CPU Architectures, eg amd64 and ARM.

The
[Dockerfile](https://github.com/ncrmro/py-ffmpeg-docker-images/blob/master/Dockerfile)
looks like this an automatically handles cleaning up dependencies. This file
could have a few layers, but it's the same dockerfile I use for all my Debian
based python docker images.

```dockerfile
ARG BASE_IMAGE=python:3.8.5-slim-buster
FROM $BASE_IMAGE as base
WORKDIR /app
ENV PYTHONPATH "${PYTHONPATH}:/app"

##
# Install any runtime depenencies here
ENV RUNTIME_DEPENDENCIES="ffmpeg"

RUN apt-get update \
    && apt-get install -y $RUNTIME_DEPENDENCIES \
&& rm -rf /var/lib/apt/lists/*

ENV BUILD_DEPENDENCIES="build-essential"

COPY requirements.txt /app/requirements.txt

# Install any build dpendencies depenencies here
RUN apt-get update \
    && apt-get install -y $BUILD_DEPENDENCIES \
    && pip install --no-cache-dir -r requirements.txt \
&& apt-get remove -y $BUILD_DEPENDENCIES \
&& apt-get auto-remove -y \
&& rm -rf /var/lib/apt/lists/*
```

### The CI config file.

I'm using a self-hosted Drone CI server and runners. This example could easily
be switched to anywhere you can enable an experimental docker _server_. Note at
the bottom we use docker in docker.

The
[.drone.yml](https://github.com/ncrmro/py-ffmpeg-docker-images/blob/master/.drone.yml)
file looks like this (a few changes to only show the important parts).

```yamlex
kind: pipeline
name: default

environment:
  DOCKER_HOST: tcp://docker-in-docker:2375
  DOCKER_CLI_EXPERIMENTAL: enabled

steps:
- name: Docker Information
  image: ncrmro/docker-buildx:19.03.10
  environment:
    DOCKER_USERNAME: ncrmro
    DOCKER_PASSWORD:
      from_secret: dockerhub_access_token
  commands:
  - docker version
  - docker buildx version
  - echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  - docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
  - docker buildx create --name multiarch --use
  - docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 -t ncrmro/py-ffmpeg-docker-images:latest -t ncrmro/py-ffmpeg-docker-images:1.0.11 -t ncrmro/py-ffmpeg-docker-images:$DRONE_COMMIT_SHA --push .

services:
- name: docker-in-docker
  docker:
  image: docker:19.03.12-dind
  command: ["dockerd", "--host", "0.0.0.0", "--experimental"]
  privileged: true
```

Also note we

- started `qemu-user-static` This is what emulates our different cpu
  architectures.
- created a builder and seet it as the active builder
- created three image's, `latest`, `python FFmpeg ver`, `git sha`

Hope you enjoyed the post
