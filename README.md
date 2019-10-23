# The Hexgears Configurator

Client Side Configuration & Flashing Software for Kiibohd compatible keyboards.

[![Github Actions Status](https://github.com/hexgears/configurator/workflows/Electron%20Release/badge.svg)](https://github.com/hexgears/configurator/actions)

[![Visit our IRC channel](https://kiwiirc.com/buttons/irc.freenode.net/input.club.png)](https://kiwiirc.com/client/irc.freenode.net/#input.club)

[Visit our Discord Channel](https://discord.gg/GACJa4f)

# --> [Wiki](https://kiibohd.github.io/wiki/#/Quickstart) <-- If you have questions start here



## Supported Keyboards

* Infinity 60%
* Infinity 60% LED
* Infinity Ergodox
* WhiteFox/NightFox
* K-Type
* Kira

## Dependencies

### Windows

You will need to install Zadig drivers (automated through the `Settings > Drivers` tab )

### Linux

* Install dfu-util from your disto's package manager.
* Add the following to /etc/udev/rules.d/60-input-club.rules (You will need to create the new file)
  ```bash
  # UDEV Rules for Input Club keyboards
  #
  # This will allow reflashing via dfu-util without using sudo
  #
  # This file must be placed /at /etc/udev/rules.d/60-input-club.rules  (preferred location)

  # Board
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1c11", ATTRS{idProduct}=="b04d", MODE="664", GROUP="plugdev"
  # Boot
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1c11", ATTRS{idProduct}=="b007", MODE="664", GROUP="plugdev"
  # Registered Board
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1209", ATTRS{idProduct}=="01c0", MODE="664", GROUP="plugdev"
  # Registered Boot
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1209", ATTRS{idProduct}=="01cb", MODE="664", GROUP="plugdev"
  ```


## Installation

Download the installer/binary for your platform from the [latest release](https://github.com/Hexgears/configurator/releases/latest)

## Compilation

Only required if there is no release for your distribution.

NOTE: If you run `yarn dev` you will also need to run [KiiSrv](https://github.com/kiibohd/KiiSrv) locally.


### Requirements

* node 10.x
* yarn 1.x

### Linux

* libudev-dev
* build-essential

```bash
yarn
yarn dist:dir
cd output/linux-unpacked
./hexgears-configurator
```

### macOS
* libusb

```bash
yarn
yarn dist:dir
cd output/mac
open -a Hexgears\ Configurator.app
```


### Windows
* [chocolatey](https://chocolatey.org/)

__Setup__
```bash
# In Administrator shell
choco feature enable -n allowGlobalConfirmation
choco install python python2 nodejs yarn
```

```bash
yarn
yarn dist:dir
cd output/win-unpacked
"Hexgears Configurator.exe"
```
