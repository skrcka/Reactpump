# Frontend for rust syringe pump controller
Software designed for RPi 3B meant for controlling stepper driver via GPIO pins

## Links
Backend - [https://github.com/skrcka/ZP_server](https://github.com/skrcka/ZP_server)
Frontend - [https://github.com/skrcka/ZP_client](https://github.com/skrcka/ZP_client)

## Requirements
- Linux/WSL
- RPi booted up and connected to internet
- rsync installed

## How to use
1. Install modules - yarn install
2. Build - yarn build
3. Change IP and username in copy-to-rpi.sh or copy-to-rpi-release.sh
4. If sending to the device for the first time
    - Rsync service file - rsync -vP ./controller.service username@IP:/etc/systemd/system/
5. Copy to RPi - ./copy-to-rpi.sh
6. ssh to RPi
7. Enable it on RPi - sudo systemctl enable --now controller-frontend.service
