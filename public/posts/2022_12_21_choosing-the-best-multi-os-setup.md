---
title: Choosing the best multi-OS setup with PCIe device passthrough
description: In this post I discuss my experience with my Linux workstations that use a technology called PCIe passthrough to use a dedicated GPU for gaming in a Windows Guest.
tags: technical,linux,spike
state: published
---

## Why have bare-metal hypervisor Linux workstation

- Choose your hardware
- Free and opensource OS
- Easily experiment with other OS
  - Can be transferred to new hardware without re-activating
- Windows Guest
- PCIe Passthrough
  - Pass an entire device like a GPU into a guest VM for near baremetal
    performance.

In this post, I will attempt to outline a few ways to run multiple OS's on a
single workstation host but also use the hardware for other tasks such as
passing the GPU into a VM for gaming and machine learning workloads,

- Multiple OS installed as root and choice is selected at the bootloader (system
  startup).
- Linux Desktop OS installed with two graphics cards, two USB chipsets each
  going into a KVM switch.
- Minimal Server OS installed with GPU and USB chipsets reallocated at guest
  boot.
- Linux Desktop OS installed as Workstation with GPU and USB chipsets
  reallocated at guest boot.

As a note, it is significantly easier to have a Linux desktop environment (could
be a VM) to run [`virt-manager`](https://virt-manager.org/) which is a GUI to
manage KVM VM's.

## Multiple root OS's

The original the one we know and love.

## Linux KVM baremetal hypervisors

[KVM](https://en.wikipedia.org/wiki/Kernel-based_Virtual_Machine) (Kernal-based
Virtual Machine) allows the Linux kernel to act as a
[hypervisor](https://en.wikipedia.org/wiki/Hypervisor) which can create and run
[virtual machines](https://en.wikipedia.org/wiki/Virtual_machine).

One of the neat things we can do is choose PCIe devices not in use by the host
os to pass into a virtual machine to get near bare metal performance. Later in
this post, we will discuss how to reallocate devices that are already in use by
the host OS.

Additionally, we can easily transfer an activated Windows Guest VM between
computers without having to reactivate.

### Linux Desktop OS with KVM Switch

My first successful foray into PCIe passthrough into a guest VM had a
[i5 4790k](https://www.intel.com/content/www/us/en/products/sku/80811/intel-core-i54690k-processor-6m-cache-up-to-3-90-ghz/specifications.html)
which contained an iGPU and a
[770 GTX](https://www.nvidia.com/en-us/geforce/graphics-cards/geforce-gtx-770/specifications/).

The KVM switch used is made by [Black Box](https://www.blackbox.com).

In this configuration our KVM switch which is typically used to share a
keyboard, mouse, and monitor between multiple computers is instead used to have
a video, sound, and USB cable (keyboard and mouse) split between two GPU's/USB
chipsets.

- Dedicated GPU has drivers blacklisted on boot typically to avoid host OS
  attaching
- KVM switch can be expensive, extra wires (three display/USB cables)
- Needs two GPU's as well as two USB chipsets on the motherboard
  - Note\* having a dedicated PCIe based USB chipset also passed into the VM is
    the best option here is if your going to also plug in a Bluetooth dongle.
  - Alternatively, the entire Bluetooth chipset can be passed to guest for the
    best controller performance.

### Minimal Linux Server OS, Single Dedicated GPU (no iGPU) with Guest VM's

At the time of writing this post is being typed on the following setup. The
hardware chosen was a
[AMD Ryzen 7 5800X3D](https://www.amd.com/en/products/cpu/amd-ryzen-7-5800x3d)
(one of the first CPU's to feature 3D cache) which does not come with an iGPU,
furthermore I choose a mini ITX case
[Louqe Raw S1](https://www.louqe.com/portfolio/raw-s1/) and motherboard (one
PCIe slot) paired with a
[3080 RTX Ti](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/).

Essentially as much power as one can fit into the smallest space possible.

In this scenario, we install a minimal OS like Ubuntu server for the host OS.
The novel idea here is that we use KVM hooks to mount and unmount hardware
during the lifecycle stages of a guest VM.

The flow after the host VM is booted and we are in the terminal logged in as the
root user is we would type `virst start gamevm`.

This c

- Host OS is kept super clean with minimal amount of dependencies.
  - This allows us to try out multiple linux distributions quite easily
- By default the entire system never goes to sleep nor does the monitor sleep if
  GPU is attached to host OS
- Guest also don't ever quite go to sleep as nicely as one would like.
- Host OS only has a root account, disk is unencrypted.
  - Having this disk unencrypted allows us to remotely (re)start the host using
    WoL magic packets
  - Guest VM's can manage their own disk encryption.

### Desktop Linux OS (Workstation)

This I think is the best solution for a true Workstation and what I think my
next iteration will be. While I don't like the idea of having a hypervisor OS
cluttered with dependencies I think this provides us with a more
workstation-like setup that can also be used for gaming.

- Boot directly to a Desktop environment
- Prometheus Metrics/Temp Hardware etc are more directly accessible

Unknowns

- When shutting down the host what happens to VM's that are suspended but still
  have a GPU is attached.
