---
slug: docker-linux-workstation-development
title: Docker Linux Workstation Development
date: "2021-02-06"
description:
Brining Linux Workstation Docker Development inline with Docker Desktop for
macOS and Windows.
tags: ["docker", "zfs", "linux", "ubuntu"]
---

Something that will become apparent at some point of your journey using a Linux
workstation as a development environment is that Docker runs as Root hence all
commands must be run with sudo, directories and volumes will be owned by the
root users (and must be removed with sudo for instance) as well.

## [Docker Rootless](https://docs.docker.com/engine/security/rootless/#daemon)

Best practice to run Docker in Rootless mode whenever you can.

If you follow the
[guide](https://docs.docker.com/engine/security/rootless/#daemon) over at
Docker's website will get your pretty far.

This essentially boils down to a few things

## Finding a Compatible Storage Driver

I ran into some problems around Docker by default continuing to use ZFS (my
workstation
[OS root file system is ZFS](https://openzfs.github.io/openzfs-docs/Getting%20Started/Ubuntu/Ubuntu%2020.04%20Root%20on%20ZFS.html#id5))
for storage that now no longer has permissions to run ZFS commands.

These docs were not immediately clear on how to alleviate this.

Attempting to set the storage driver to any of the recommended `overlay2`,
`fuse-overlay`, `aufs` or depreciated `devicemapper` all gave errors on startup
looking something like a stopped docker service.

Starting the rootless docker image like so

```bash
~/bin/dockerd-rootless.sh
```

Would result in something like this.

```
...
ERRO[2021-02-06T07:59:07.331974204-06:00] failed to mount overlay: invalid argument     storage-driver=overlay2
INFO[2021-02-06T07:59:07.332726224-06:00] stopping healthcheck following graceful shutdown  module=libcontainerd
INFO[2021-02-06T07:59:07.332739655-06:00] stopping event stream following graceful shutdown  error="context canceled" module=libcontainerd namespace=plugins.moby
failed to start daemon: error initializing graphdriver: driver not supported
[rootlesskit:child ] error: command [/home/ncrmro/bin/dockerd-rootless.sh] exited: exit status 1
[rootlesskit:parent] error: child exited: exit status 1
```

### VFS

VFS is pretty heavy-handed when
[looking into the details](https://docs.docker.com/storage/storagedriver/vfs-driver/),
Each layer for a downloaded container image is stored separately taking up
exponentially more space than other storage drivers, we will address that caveat
in a second.

Stop Docker

```bash
systemctl --user stop docker
```

Create or modify the `daemon.json`

```bash
nano ~/.config/docker/daemon.json
```

Content should be as follows.

```json5
{
  "storage-driver": "vfs",
}
```

Start Docker

```bash
systemctl --user start docker
```

Check Status of Docker Daemon

```bash
systemctl --user status docker.service
```

### VFS Capping Usage

To keep our VFS from consuming all of our disk space we can set a max amount of
storage the VFS storage driver will use.

```json5
{
  "storage-driver": "vfs",
  "storage-opts": ["size=25GB"],
}
```
