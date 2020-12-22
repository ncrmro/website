---
slug: 2019-04-15_how-homekit-led-to-learning-about-network-security
title: 'Learning network security with IoT/HomeKit.'
date: '2019-04-15'
description: 'How setting up IoT/HomeKit can teach you about network security.'
---

## It started with [HomeKit](https://www.apple.com/ios/home/).

When I started writing this post I was evaluating weather or not to start buying home kit smart gear. Mostly simple things like turning lights on and off with my phone. I found out you need ["home hub"](https://support.apple.com/en-us/HT207057) which works out to a newer Apple tv, Home Pod, or IPad you always have at home.

## Ubiquity, Subnets and Firewalls

Getting back to Ubiquity's Unifi gear. At the moment I have a Google fiber's router plugged into a Ubiquity secuirty gateway, thats plugged into a inline POE adapter that feeds the network switch and which powers a access point. I had been wanting to start digging into networking more. I've often find myself saying the networking is usually a skill most developers could use a little brushing up on.

To get the most out of Ubquitiy I believe it's pretty much required to have a unifi controller. I have mine hosted on a ubuntu vm. It's one of this things that I believe it's better to set up following their instructions for a specific os version than a homebrew docker container. I've personally experienced exotic networking bugs before like syslog packets not combing in.

## The guest network

First thing I did was set up separate subnets, ubiquity has a few different network types with varying firewall config profiles. One is a guest network. Which by the way you can now tell your iOS devices to not automatically connect to certian wifi networks, but keep the wifi password in your keychain. This lets you share your guest network password easly using the iOS wifi password sharing feature.

By default the guest network does not allow any connections other that to the WAN, this is nice your smart tvs like Roku where you dont want them [snooping on](https://www.reddit.com/r/YouShouldKnow/comments/97an7p/ysk_roku_hardware_is_collecting_and_sharing/?depth=1) your network Traffic.

## Subnets for everyone.

So we have the default network which becomes the Management Network/VLAN all the devices talk to each other on. Since my Unifi controller is a VM on bridge mode I expierenced some dificulty getting everything moved to a newly created managment VLAN. This is why we keep the orginal LAN as Managment and created a new LAN network.

We also create a network for homekit/IoT. Each network is tagged with a VLAN. Most of the networks will then be associated with their respective network and VLAN tags. We splits the homekit network between 2 and 5 GHz because some devices do not support 5.

## Firewall

At this point the network isn't completely hygienic. That is because VLAN's while ideally are secure they shouldn't be thought as air tight by default.

A good rule of thumb is default deny every thing on LAN in and make a groups if Staticlly assigned IPs access. I followed [this](https://community.ubnt.com/t5/UniFi-Routing-Switching/HomeKit-on-Isolated-VLAN/m-p/2263456/highlight/true#M79654) post orginally which covers setting up homekit. I just made it where my phone, laptop, and desktop I remote into are admin devices which can access anything.
