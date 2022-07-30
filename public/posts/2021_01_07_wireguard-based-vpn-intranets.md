---
slug: wireguard-based-vpn-intranets
title: Wireguard Based VPN Intranets
date: 2021-01-07
description: Understanding and Implementing Private Intranets
tags: technical
---

In this post, we will discuss why you might want a private intranet. An intranet
is a private computer network, a subspace of the internet.

- [LAN Intranets](#lan-intranets)
- [VPN Intranets](#vpn-intranets)
- [Private and Off the Grid](#private-and-off-the-grid)
- [How VPN's Work](#how-vpns-works)
- [Domains and DNS](#domains-and-dns)
- [PKI (SSL Certs)](#pki-and-certificates)
- [Implementation](#implementation)

## LAN Intranets

Almost everyone these days has an intranet already, your wifi router gives all
of your home devices a LAN (pocket of the internet) behind a single public IP
address. This process of mapping ports to and from device IP addresses to a port
not in use on the external-facing IP address is called
[Network Address Translation](https://en.wikipedia.org/wiki/Network_address_translation).

Inside this network, you can access other computers and servers like a NAS for
instance say maybe to perform a backup or watch a movie of it. What happens
though when you want to access this server remotely or maybe have a family
member access or host a server themselves for you to access.

## VPN Intranets

In this case, we want a
[Virtual Private Network VPN](https://en.wikipedia.org/wiki/Virtual_private_network),
this is a server that acts very much like the router you have at home. The VPN
also authenticates and encrypts any connections to the VPN server. Most people
are familiar with this usage to send all your data over a VPN for privacy or to
route around Geolocation restrictions.

## Private and "Off the Grid"

In many situations, if you wanted to access your self-hosted server you could
always port forward to a proxy inside your LAN. The problem of course is now
everyone can access your server good passwords or not it would still be nicer if
we could both access our servers remotely but not have them publicly accessible.

## How VPN's works

Both your VPN and it's clients (your devices and server) all get an IP address,
the VPN most likely listening on an either port forwarded port from your public
external IP or listings directly on the external address.

The clients get LAN IP addresses from whatever router's lan they are on.

### VPN Subnet

Now all these LANs have their subnets defined by the router. Our VPN is no
different (then a router) and has it's own
[subnet](https://en.wikipedia.org/wiki/Subnetwork).

For my VPN subnets I typically like `10.2.3.0/24` (easy to remember it 1.2.3),
this means our VPN server would usually give it's self the first IP in that list
of 256 IP address, all the clients would then get an IP from the remainder
available on the subnet and would send their data to `10.2.3.1` (the VPN
server's address inside the VPN).

This now means if you on your phone (eg: IP address 10.2.3.4) you could access
your NAS (eg: 10.2.3.10) even on separate networks.

## Domains and DNS

Now trying to connect to all of your services by IP address would be a huge pain
And this is cause we've only implemented
[layer 3 (Network layer IP4/IP6)](https://en.wikipedia.org/wiki/Network_layer)
and
[Layer 4 (Transport Layer TCP/UDP)](https://en.wikipedia.org/wiki/Transport_layer)
of the [OSI Model](https://en.wikipedia.org/wiki/OSI_model)

[DNS](https://en.wikipedia.org/wiki/Domain_Name_System) the protocol that maps
hostnames to IP address is actually
[layer 7 (Application Layer)](https://en.wikipedia.org/wiki/Application_layer)
and not required or implemented by a VPN server.

Furthermore, we probably want to have our services sit behind a
[proxy server](https://en.wikipedia.org/wiki/Proxy_server) so we could have many
services sitting behind a single VPN IP address.

### Unlimited Domains

Once we have our DNS server we can then assign any IP address routed by our VPN
to any number of hostnames. We can typically tell our VPN client software we
would like all DNS traffic routed to a specified server (typically one also
listening on the VPN).

## PKI and Certificates

PKI means
[Public Key Infrastructures](https://en.wikipedia.org/wiki/Public_key_infrastructure)

Even though all of our network traffic is encrypted already over the VPN, all
major browsers will give you the dreaded SSL warnings. Furthermore, with trusted
SSL certs for these custom domains, the VPN server itself would not be able to
read traffic in the clear between any two clients or servers.

This means generating a
[Root CA](https://en.wikipedia.org/wiki/Root_certificate), distributing and
installing it to any clients or servers, then generating Certs for your various
services.

## Implementation

I've implemented this concept of an intranet using various open-source tools and
Ansible roles I've built out.

The "stack" per se here consists of

- VPN - [Wireguard](https://www.wireguard.com/)
- DNS - [PiHole](https://pi-hole.net/)
- PKI - [Scytale](https://github.com/ncrmro/scytale)

### Wireguard

To set up the VPN server I use an
[Ansible Playbook](https://docs.ansible.com/ansible/latest/user_guide/playbooks.html)
I wrote called [Mercury](https://github.com/ncrmro/mercury), which at the time
of writing could use some refactoring.

Essentially you specify the subnet and clients you want to be defined and the
ansible script will install Wireguard and generate all of the various
certificates.

Adding new users allows for subsequent runs to generate any deltas required.

### PiHole

I typically install PiHole inside of a docker container and call it a day. The
PiHole also blocks ads and trackers, while also, allow you to specify custom DNS
records (eg any custom domains).

### PKI

For PKI I also use an Ansible Playbook called
[Scytale](https://github.com/ncrmro/scytale) that generates the Root CA and any
other certificates you need. It then checks those certs into the Vault allow
them to be committed as encrypted files.
