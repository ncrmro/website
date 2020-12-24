---
slug: gondola-ansible-playbook-for-emulating-raspberry-pi-os-with-kvm
title: Gondola
date: '2020-07-22'
description: Ansible Playbook for Emulating Raspberry Pi OS with KVM
tags: ['ansible', 'kvm', 'opensource', 'raspberr pi']
---

Recently I was working a project that is deployed on a raspberry pi zero. This became problematic with trying to build
stuff on the zero.

It's pretty simple, check the repo out. Install ansible and the rest of the pip requirements.

`pip install -r requirements.txt`

Then run `sh main.sh` this will take a few minutes.

After running the Ansible play you'll have a PI that you can clone, revert etc.

The project is available [here](https://github.com/ncrmro/gondola).

## Some updates jul 29 2020
Some limitations is its single threaded and limited to 256mb of ram and I haven't had enough time to investigate.
