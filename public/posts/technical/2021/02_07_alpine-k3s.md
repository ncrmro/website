---
slug: alpine-k3s
title: Alpine k3s based single node Kubernetes cluster.
date: "2021-02-07"
description: This guide shows how to set up a Kubernetes node with Alpine
tags: ["tech", "Linux", "Kubernetes", "alpine", "k3s"]
---

Setting up a Kubernetes cluster can be pretty straightforward, in this guide we
are going to set up a Single Node Kubernetes cluster using
[Alpine](https://alpinelinux.org/about/) and [k3s](https://k3s.io/). If you've
worked with containers previously you should have some experience with Alpine
and if not this is a great way to familiarize yourself.

I originally was using [k3os](https://github.com/rancher/k3os) (an operating
system specifically for running k3s) but its terseness becomes slightly
difficult to work around at a certain point.

The breaking point for k3os for me was utilizing
[9p filesystem passthrough](https://wiki.qemu.org/Documentation/9psetup) when
running my cluster from inside a VM running on my
[KVM](https://en.wikipedia.org/wiki/Kernel-based_Virtual_Machine) based
[baremetal Hypervisor](https://en.wikipedia.org/wiki/Hypervisor), which I was
not able to configure using k3os.

The beauty here is you don't need to concern yourself with the esoteric
idiosyncrasy of various cloud providers. Instead, you can
[install Alpine](https://wiki.alpinelinux.org/wiki/Installation) in what ever
environment most suites you.

This means your free to install Alpine on bare-metal, in a VM, or even on a
cloud provider.

## Alpine Install

I'm not going to cover
[how to install Alpine](https://wiki.alpinelinux.org/wiki/Installation) here
in-depth.

You'll need to
[download the extended edition](https://alpinelinux.org/downloads/) of Alpine,
then flash to a USB or boot in a VM.

You'll find yourself at the login prompt and the username is `root` if you read
the notes post login you'll see it mentions running a script to install Alpine.

```bash
setup-alpine
```

Follow the directions and reboot. If you're running inside a VM for initial
testing now is a good time to take a snapshot.

### Alpine OS configurations

We need to set up SSH access. Feel free to enable root password SSH key access,
although a more modern approach would be to download your Public Keys from
Github.

```bash
apk add curl
mkdir ~/.ssh
touch ~/.ssh/authorized_keys
curl https://github.com/your-username.keys >> ~/.ssh/authorized_keys
```

Now you should be able to login!

```bash
ssh root@ALPINE_IP_ADDRESS
```

## K3s Install

[Installing K3s](https://github.com/k3s-io/k3s#quick-start---install-script) is
quite easy.

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" sh -
```

At this point, we have a fully functional (single node) Kubernetes cluster!

```bash
kubectl get pods --all-namespaces
```

This will output the following.

```bash
NAMESPACE     NAME                                      READY   STATUS      RESTARTS   AGE
kube-system   local-path-provisioner-7c458769fb-mqcqm   1/1     Running     0          18m
kube-system   metrics-server-86cbb8457f-nwwb9           1/1     Running     0          18m
kube-system   coredns-854c77959c-4jcx8                  1/1     Running     0          18m
kube-system   helm-install-traefik-qgxr2                0/1     Completed   0          18m
kube-system   svclb-traefik-kgb8n                       2/2     Running     0          18m
kube-system   traefik-6f9cbd9bd4-5kk9d                  1/1     Running     0          18m
```

## Remote Kubectl Access

Now to set up remote access and control of our Kubernetes cluster we can
download the Kube config locally.

```bash
scp root@ALPINE_IP_ADDRESS:/etc/rancher/k3s/k3s.yaml ./
```

Once you have the file locally we need to edit the cluster IP address

```yaml
apiVersion: v1
clusters:
  - cluster:
    server: https://127.0.0.1:6443
```

At this point, we can move this to the default kube config location

```bash
mv k3s.yaml ~/.kube/config
```
