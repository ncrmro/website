---
slug: writing-a-gear-torque-calculator
title: Writing a gear torque calculator
date: "2020-07-02"
description:
  While utilizing a stepper motor and gears. I needed more torque and different
  sized gears. So I wrote a small gear torque calculator.
tags: ["tech", "python", "opensource"]
---

Recently I ran into the problem of my stepper motor not able to produce enough
torque. This is even after adding some
[gears](https://www.thingiverse.com/thing:4305) I found on Thingverse based on
[Wades Extruder](https://reprap.org/wiki/Wade%27s_Geared_Extruder) used in 3D
printing.

In a
[previous post](/posts/2020_06_16_driving_stepper_motors_with_microcontroller.md)
previous post I talk about driving a stepper motor with a microcontroller.

The main components are.

- [NEMA Motors](https://en.wikipedia.org/wiki/NEMA_stepper_motor)
- [ESP32](https://en.wikipedia.org/wiki/ESP32)
- [DRV8825](https://www.pololu.com/product/2133)

After field-testing the motor I found it does not have enough torque for my
application.

The cool thing about the previously mentioned gear models is they come with
`.scad` files so they can be opened in OpenCAD to make larger/smaller or adjust
tooth count.

![Viewing the CAD files in OpenCAD](/images/post/2020_07_02_writing_a_gear_torque_calculator/gear_in_opencad.png)

The code for the large gear for example looks like this.

```bash
module WadesL(){
   difference(){
      gear (number_of_teeth=39,
         circular_pitch=400,
         gear_thickness = 5,
         rim_thickness = 7,
         rim_width = 3,
         hub_thickness = 13,
         hub_diameter = 25,
         bore_diameter = 8,
         circles=4);
      translate([0,0,6])rotate([180,0,0])m8_hole_vert_with_hex(100);
   }
}
```

This is the moment I started to realize I need to brush up the relationship
between torque and gearing. Rather than guessing if a bigger motor or gear would
be sufficient I decided to write a small python library to pass different sized
gears and figure out the final torque.

The source can be found on Github
[here](https://github.com/ncrmro/gear-torque-calc), the Python package can be
found [here](https://pypi.org/project/gear-torque-calc/1.0.0/)

Usage is as follows.

```python
from gear_torque_calc import get_torque
import pprint
pp = pprint.PrettyPrinter()
res = get_torque(drive_shaft_diameter=5, drive_shaft_torque=.2, gear_small_diameter=15, gear_large_diameter=55)
pp.pprint(res)
res = get_torque(drive_shaft_diameter=5, drive_shaft_torque=.2, gear_small_diameter=15, gear_large_diameter=55*2)
pp.pprint(res)
```

This should give you the following output

```python
{'gear_ratio': 7.333333333333333,
 'large_gear': {'force': 26.666666666666668,
                'radius': 55.0,
                'torque': 1.4666666666666668},
 'motor': {'force': 80.0, 'torque': 0.2},
 'small_gear': {'force': 26.666666666666668, 'radius': 7.5, 'torque': 0.2}}
{'gear_ratio': 3.6666666666666665,
 'large_gear': {'force': 26.666666666666668,
                'radius': 27.5,
                'torque': 0.7333333333333334},
 'motor': {'force': 80.0, 'torque': 0.2},
 'small_gear': {'force': 26.666666666666668, 'radius': 7.5, 'torque': 0.2}}
```

We can now see doubling the large gear doubles our torque.
