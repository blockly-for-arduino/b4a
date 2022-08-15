# arduino core安装脚本  

## 测试命令
node .\app.js -boardUrl https://b4a.clz.me/boards/wifiduino32.json -boardPath ./temp/esp32 -boardName wifiduino32 -coreUrl https://e.coding.net/coloz/arduino-packages/esp32.git -coreName esp32:esp32 -coreVersion 2.0.4 -corePath C:/Users/coloz/AppData/Local/Arduino15/packages

## 打包命令
pkg -t node8-win .\install-board.js