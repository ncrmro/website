---
slug: scytale_automated_private_key_infrastructure
title: 'Scytale: Ansible Automated Private Key Infrastructure.'
date: '2020-08-23'
description: Automated private key infrastructure (PKI), Ansible managed certificate authority, server and client certificates. 
tags: ['Private Key Infrastructure', 'Security', 'Intranet', 'Ansible', 'Certificate Authority', 'Certificates', 'TLS', 'SSL']
---


> In cryptography, a scytale, is a tool used to perform a transposition cipher, consisting of a cylinder with a strip of parchment
> wound around it on which is written a message. The ancient Greeks, and the Spartans in particular, are said to have used this cipher to communicate during military campaigns.
>
> [Wikipedia](https://en.wikipedia.org/wiki/Scytale)

Scytale Github Link [here](https://github.com/ncrmro/scytale)

## Background

While building my own infrastructure/intranet I started wanting to have SSL/TLS connections. Almost all of my connections
currently take place over Wireguard anyway. This is handled by a project called Mercury that I still need to opensource.

Now I have a couple VM's at the moment that host various docker containers. While they all sit inside the Wireguard
network some connections I would prefer to happen without leaving the LAN. All of the hosts are VM's
on the same NAS that creates the NFS shares that the Docker hosts create their volumes from. But only one of the Docker hosts
contains the stateful applications, eg Postgres, Docker Registry, RabitMQ, Prometheus. 

This is where the SSL comes in we want our services to talk to Postgres/RabitMQ etc over SSL/TLS. Additionally
we can require any clients to also present a certificate for authentication.

## PKI Basics

Both the server and client certificates are signed by our Root CA. The Root CA certificate is installed on
both the client and server thus they can each validate each other against the Root CA. More of this is covered in the project's
readme.

## Getting Started

Some setup

```
git clone https://github.com/ncrmro/scytale.git

cd scytale

pip install ansible==2.9.10

# If you already have an Ansible Vault Key set its path in vars.yml otherwise
echo random_password > ~/.ansible/vault/default_key.txt
```

To run the ansible play just run

```bash
sh ./main.sh
```

This calls

```bash
ansible-playbook --vault-password-file ~/.ansible/vault/default_key.txt -i hosts main.yml
```

Whoot! now you have your private key infrastructure.

If you check your `vars_vault.yml` it now contains all your private keys which can be checked into your git repo!
