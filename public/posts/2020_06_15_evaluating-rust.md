---
slug: evaluating-rust
title: Evaluating Rust.
description: A look at setting using Rust for REST APIs and Embedded development.
date: 2020-06-15
tags: technical
---

# [Rust](https://www.rust-lang.org)

This post documents my experience learning and working with Rust and why I
choose to add it to my daily driver [Python](https://www.python.org), javascript
etc.

## [Strong Typing](https://en.wikipedia.org/wiki/Strong_and_weak_typing)

Python is also not typed although things like Python type hints and Fast API use
these. In Rust, typing is strictly enforced. My first experience using types was
a bit of [c#](<https://en.wikipedia.org/wiki/C_Sharp_(programming_language)>)
although I didn't get the hang of it until using
[Typescript](https://www.typescriptlang.org) which has a great ecosystem

I've found working with types initially a bit confusing until a basic
understanding of
[genrics](https://en.wikipedia.org/wiki/Generic_programming#Programming_language_support_for_genericity)
is understood. Now disregarding the Javascript ecosystem. Once you have all the
build tools set up typescript is pretty nice, most packages have a pre-existing
typed version of their packages such as
[@types/express](https://www.npmjs.com/package/@types/express).

## Development Velocity

In any case, a developer's initial velocity will feel quite low working with
typed languages often struggling to figure out specific errors or how to extend
a type using the previously mentioned generics.

But you will spend waay less time down the road catching undiscovered bugs, like
undefined variables, unhandled errors or exceptions and other bad coding
practices.

Once core functionality and workflow are established releasing new features or
refactors becomes much easier. Plus your CLI's and web server start nearly
instantly which makes spinning up a free [Heroku](http://heroku.com) Dyno from
sleep is feel like a quick lambda

## Strong Ecosystem

Cargo is the default package manager for Rust and is very easy to use. The
communities are all great, often getting back to you very quickly.

## Building Better API's: Moving away from Django

[Django](http://djangoproject.com) batteries included is a blessing and a curse,
concepts that don't work well with a pure API such as using
[django forms](https://docs.djangoproject.com/en/3.0/topics/forms/) for example
in [django-rest-frameworks](https://www.django-rest-framework.org) to validate
request
[REST validation](https://www.django-rest-framework.org/api-guide/validators/#validation-in-rest-framework)
is great piggybacking if you already have a Django codebase, but doesn't
translate well outside of Django. Or trying to build anything custom in the
Django Admin becomes laborious when the rest of your front end is written in
[React](http://reactjs.org).

Previously I've written a React/Django Boilerplate called
[Rjango](https://github.com/ncrmro/rjango), which I spoke a
[PyCon India 2017](https://in.pycon.org/cfp/2017/proposals/building-single-page-javascript-apps-with-django-graphql-relay-and-react~axoze/)
I've found GraphQL and Relay are pretty optional outside (Relay I don't even
really recommend using) so I like to stick to stick with just REST nowadays.

### The replacement API built in Rust: [planet-express](https://github.com/ncrmro/planet-express)

My replacement for Rjango is a Rust Boilerplate called
[planet-express](https://github.com/ncrmro/planet-express). It uses
[SQLx](https://github.com/launchbadge/sqlx) so your queries are written in SQL
which is checked at compile time to ensure your SQL is compliant and your
Database and Rust Types are always in line.

For the webserver, I've used [Actix](https://actix.rs) in conjunction wither
[PaperClip](https://github.com/wafflespeanut/paperclip) generate
[OpenAPI](https://www.openapis.org) spec which can be used to generate
client-side libraries for your API.

## Embedded Development

I've been wanting to get into more IoT,
[Home Automation](https://en.wikipedia.org/wiki/Home_automation),
Robotics/Drones and [SCADA](https://en.wikipedia.org/wiki/SCADA),
[MicroSats](https://en.wikipedia.org/wiki/Small_satellite) etc. I've got a few
projects in mind. Although typically you will be working at a much lower level
using Rust and I'm finding quick MVPs may still be easier in
[Arduino](http://arduino.cc) or [MicroPython](https://micropython.org).

For hardware, I've primarily been using
[Raspberry Pi Zero WH](https://www.raspberrypi.org/blog/raspberry-pi-zero-w-joins-family/)
and [ESP32](https://en.wikipedia.org/wiki/ESP32) (ESP32 and ESP8266) are often
used to add WiFi or Bluetooth capabilities to Ardunio but can be programmed
outright with their own set of
[GPIO](https://en.wikipedia.org/wiki/General-purpose_input/output) pins,
[I2C](https://en.wikipedia.org/wiki/I²C), PWM, real-time clock support, etc.

For the various kids of hardware you might find there is usally a
[embedded-hal](https://github.com/rust-embedded/embedded-hal)) implementation
available.

A [HAL](https://en.wikipedia.org/wiki/Hardware_abstraction) is a hardware
abstraction layer it provides a standardized way to interact with GPIO pins,
i2c, PWM etc. One available for linx is
[linux-embedded-hal](https://github.com/rust-embedded/linux-embedded-hal)

### Rust on Pi

Getting Rust to work on a Pi is much simpler with compiling happening in a
docker container on your local machine and then being deployed over
[SCP](https://en.wikipedia.org/wiki/Secure_copy), the binary on the Pi is is
then executed using [SSH](https://en.wikipedia.org/wiki/Secure_Shell) with
output piped to back to your local machine. When the SSH connection is closed
the binary is stopped, this is easy to verify with say an LED from a Blink
example (a common form of hello world in the embedded community). This all
happens in
[this](https://gist.github.com/ncrmro/ac6fa59c9125ac612c827391998e09fb) script
which also only builds and copies the files if anything has changed. It will
execute the binary regardless. I've got a few of these simple repositories up
for personal reference and experimenting with the various packages.
[Here](https://github.com/ncrmro/rust-pi-blink) is the code for a rust based
blink on a pi.

### Rust on ESP32

To get the ESP32 to work with rust we used
[MabezDev's](https://github.com/MabezDev)
[rust-extensa](https://github.com/MabezDev/rust-xtensa) fork.
[Extensa](https://docs.espressif.com/projects/esp-idf/en/release-v3.0/get-started/linux-setup.html)
being the ESP32 platform. He is very helpful on the
[esp-rs matrix channel](https://matrix.to/#/#esp-rs:matrix.org).

Although atm I've been unable to get WiFi or Bluetooth working in a super
streamlined manner.
[MabezDev linked](https://matrix.to/#/!LdaNPfUfvefOLewEIM:matrix.org/$WB3t660N0rQ-wyOue1-cB6UtDnH-nxqo1u5JHVJOoKY?via=matrix.org&via=matrix.0x1010.de&via=laas.fr)
to [this](https://github.com/reitermarkus/esp32-hello) project by
[reitermarkus](https://github.com/reitermarkus) which builds on the
[ESP-IDF](https://github.com/espressif/esp-idf) the official ESP32 framework.

## Closing

I've just scratched the surface. But I feel I've got a pretty good evaluation of
what using Rust is like. As per usual when learning a new technology I'm trying
to figure out when not to use as much as when to use it.
