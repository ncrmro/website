---
title: Rsync'ing Code Directories Between two computers
description: A script to attempt keeping my code folder in sync between my laptop and workstation.
tags: technical
state: published
---

I often find myself trying to keep the folder called code in which I keep my
code, synced between my workstation and laptop. I'd also like to be able to sync
when I'm not at home so I set the host dynamically based on if we can access the
workstaion at the \*.local domain.

```bash
scode() {
    if nc -z ncrmro-workstation.local 22 > /dev/null 2>&1
    then
        HOST=ncrmro-workstation.local
    else
        HOST=ncrmro-workstation.wg
    fi
    rsync -azP \
    --exclude='node_modules' --exclude='venv' --exclude='target' --exclude='temp' \
    --exclude='*.img' --exclude='*.iso' --exclude='*.qcow2' --exclude='*.zip' \
    --exclude='vish' --exclude='vish_ml'  --exclude='panotti' \
    ncrmro@$HOST:/home/ncrmro/code /Users/ncrmro/code.ts
}
```
