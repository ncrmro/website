---
title: ""
tags: []
description: ""
slug: docker-rootless-etherium-node
headerImage: null
id: 074d5757-2e41-539f-b9a5-18a18df3b001
createdAt: 2022-11-16
---


Why

How
https://docs.docker.com/engine/security/rootless/
curl -fsSL https://get.docker.com/rootless | sh

What

https://docs.nethermind.io/nethermind/ethereum-client/docker
https://hub.docker.com/r/nethermind/nethermind


```bash
docker pull nethermind/nethermind

docker run -it -v /home/ncrmro/nethermind:/nethermind/data \
nethermind/nethermind:1.14.5 --config mainnet --datadir data
```

https://hub.docker.com/r/sigp/lighthouse
https://lighthouse-book.sigmaprime.io/docker.html

```bash
docker run -it -v /home/ncrmro/nethermind:/nethermind/data \
sigp/lighthouse:v3.2.1-modern
```

```bash
docker run -p 9000:9000/tcp -p 9000:9000/udp -p 127.0.0.1:5052:5052 \
-v /home/ncrmro/lighthouse:/root/.lighthouse sigp/lighthouse:v3.2.1-modern lighthouse \
--network mainnet beacon --http --http-address 0.0.0.0
```

