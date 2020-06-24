---
slug: '/posts/2020_06_16_driving_stepper_motors_with_microcontroller.md'
title: 'Driving a stepper motor with a microcontroller'
date: '2020-06-16'
description: 'Controlling a stepper motor.'
tags: ['embedded', 'esp32', 'microcontroller']
featuredImage: ./images/2020_06_16_driving_stepper_motors_with_microcontroller/header_image.jpeg
---

I'm sitting here after accidentally destroying another ESP32 module and 3.3v buck converter...
Working with physical hardware can be a bit of a doozy coming from the world of software.

## Hardware

Currently, I've anciently destroyed...

Parts I've anciently destroyed.

- x4 [ESP32](https://en.wikipedia.org/wiki/ESP32) Modules These get cooked with the voltage converters
- x3 [Voltage Buck converters](https://smile.amazon.com/dp/B07FSLGPR8/ref=cm_sw_em_r_mt_dp_U_e.18EbYT0QC4M)
- x1 [drv8833](https://learn.adafruit.com/adafruit-drv8833-dc-stepper-motor-driver-breakout-board) (didn't realize it wasn't a fan of 12v)
- x1 [drv8825](https://www.pololu.com/product/2133)
- couple LEDs

Some of these where simply wires coming loose in the breadboard and touching things they
were not supposed to. Having a multimeter on hand is a physical debugger, kinda running blind without out. (left mine in Houston)

Also included

- bread boards
- NEMA 17 motor
- [Arduino Uno](https://en.wikipedia.org/wiki/Arduino_Uno)
- Pi Zero WH (The h means the headers are soldered to the board)
- 100 uf capacitor
- [12v Wall wart](https://smile.amazon.com/dp/B07DCPT1N7/ref=cm_sw_em_r_mt_dp_U_dz28EbW3A14S0)
- [Barrel jack plugs](https://smile.amazon.com/dp/B074LK7G86/ref=cm_sw_em_r_mt_dp_U_Rz28Eb3CF0KZ4)

![A drv8833 stepper motor in a breakout board format.](images/2020_06_16_driving_stepper_motors_with_microcontroller/drv8833.jpeg)

This drv8833 I had to solder the header's to it with the help of my friend Johhny.

### Hardware Background

This isn't my first time working with this kind of stuff. I built a 3D printer ages ago while printing what parts I could.
The rest is ordered. The drv8833 and [nema motors](https://en.wikipedia.org/wiki/National_Electrical_Manufacturers_Association) (National Electrical Manufacturers Association)
are often used in 3D printing so I knew those where a good place to start.

Typically the number designates the faceplate size of the motor
eg the four mounting points around the shaft, you can typically get the same size motor in different lengths for more or less torque. The
NEMA 17 for instance has 1.7" inch faceplates. Below is a bunch of different sized images.

![Diffrent sized NEMA motors](images/2020_06_16_driving_stepper_motors_with_microcontroller/nema-stepper-motors.jpg)

### Power

To power the whole affair we use 2.1mm barrel jack's on the breadboard and 12v wall-wart.
This gives us the power for the drv8825/drv8833. Then we had the buck voltage converter to power
the microcontroller when not plugged into USB.

## Checking in your designs

Another thing I learned is taking pictures, I was able to get the motor working with the drv8833 and came back
to in a few days later and was not able to reproduce so I've learned it's usually a good idea to 'check everything in'
with a few photos.

### Running the stepper motor with PWM Signals

Now driving the motors using the Arduino or the ESP32 and the Arduino IDE is relatively easy.
Using the Pi is a bit more involved, you need to enable kernel support for PWM and you only have two PWM outputs. With
the Uno you'll get 6, the ESP32 has 16!

This [article](http://blog.oddbit.com/post/2017-09-26-some-notes-on-pwm-on-the-raspberry-pi/) getting the Pi
hardware PWM working.

### It works!

`gif:working-motor.gif`
