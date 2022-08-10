---
title: Compiling and Testing on a remote microcontroller
description: We learn how we can develop microcontroller code using the Arduino CLI, compile it and the upload our code to the micrcontroller.
tags: tech,embedded,esp32,microcontroller,arduino
state: published
---

Recently I've been doing a lot of microcontroller work. And I've wanted to
offload compiling code as well as having the microcontroller hosted without
carrying it around. These microcontrollers could be Arduino/esp32 etc.

I've got an Intel NUC that I've set up to automatically connect to my Wireguard
server. This means I always have the same IP to connect to as well as remote
access if I'm not on the same LAN.

Finally, I'd like to avoid using the Arduino IDE as I find it very limited in
capability.

I believe most of this could be dockerized but let's keep it simple for now.

On Ubuntu 20.

Installing the Arduino CLI instructions can be found
[here](https://arduino.github.io/arduino-cli/installation/). Brew installs are
available if you'd prefer to use a mac.

```bash
mkdir ~/.local/bin &&
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
```

Let us also add some additional boards, open the CLI config.

`nano ~/.arduino15/arduino-cli.yaml`

Add the esp boards.

```
board_manager:
  additional_urls:
    - http://arduino.esp8266.com/stable/package_esp8266com_index.json
    - https://dl.espressif.com/dl/package_esp32_index.json
```

Update and install the boards you need.

`arduino-cli core update-index && core install esp32:esp32`

Now if you plug in an ESP32 and run list `arduino-cli board list`

You should see the board.

```
Port         Type              Board Name FQBN Core
/dev/ttyUSB0 Serial Port (USB) Unknown
```

Let us create a new Arduino sketch. `arduino-cli sketch my_sketch`

At this point, I've set up my Pycharm IDE to auto-deploy and sync the project
folder over SSH.

Lets make our ESP32 blink

#include "wifi_info.h"

```
int led = 2;

void setup() {
  Serial.begin(9600);
  Serial.println("Stepper test!");
  // initialize the digital pin as an output.
  pinMode(led, OUTPUT);
}

void loop() {
    Serial.println("Stepper high!");
    digitalWrite(led, HIGH);
    delay(1000);               // wait for a second
    Serial.println("Stepper low!");
    digitalWrite(led, LOW);
    delay(1000);               // wait for a second
}
```

Now we have a bash script that checksums our sketch folder and compiles and
uploads our code if anything changes. After which it starts a miniterm session
to listen to the serial console.

```bash
# sh deploy.sh
arduino_cli=~/.local/bin/arduino-cli
SRC="my_sketch"
PORT="/dev/ttyUSB0"
BOARD="esp32:esp32:esp32"
INPUT=""

CHECKSUM_FILE=.checksum

touch $CHECKSUM_FILE
CHECKSUM_SRC=$(grep -ar -e . --include="*.ino" --include="*.h" --include="*.c" $SRC | cksum | cut -c-32)

PREVIOUS_CHECKSUM=`cat $CHECKSUM_FILE`
CHECKSUM="$CHECKSUM_SRC"

if [ ! "$CHECKSUM" = "$PREVIOUS_CHECKSUM" ]; then
    echo "Different checksums building and deploying"
    $arduino_cli compile \
    --fqbn $BOARD \
    $SRC

    $arduino_cli upload \
    --port $PORT \
    --fqbn $BOARD \
    $SRC

    echo $CHECKSUM > $CHECKSUM_FILE
else
    echo "No differences detected running existing binary."
fi

echo "Listening on Port"

miniterm $PORT 9600
```

To call this script over ssh (we could make this into another script if ya catch
my drift) we can run.

`ssh -t -t username@hostname.local "cd ~/code/my_sketch && bash deploy.sh"`

Thats it now we should be seeing the output from the serial port.

```bash
--- Miniterm on /dev/ttyUSB0  9600,8,N,1 ---
--- Quit: Ctrl+] | Menu: Ctrl+T | Help: Ctrl+T followed by Ctrl+H ---
Stepper test!
Stepper low!
Stepper high!
Stepper low!
Stepper high!
...
```
