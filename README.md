# Blockly For Arduino
开发中...

为Arduino开发的Blockly编程工具

[官网](https://b4a.clz.me)  
[B4A 库创建器](https://github.com/coloz/b4a-creator)  
[开发板/类库/示例资源](https://github.com/coloz/b4a-cloud)  

## 开发  
### 关键技术  
Blockly 8  
Angular 13  
Electron 18  

### 安装依赖
```sh
npm i
cd app  
npm i
```
### 运行
```sh
npm start
```

### 编译
```sh
npm run electron:build
```

## 资源路径  
核心库路径 /src/core/  
库路径 /src/libraries/  
开发板 /src/boards/  
Arduino-Cli /arduino/  

## 特别鸣谢  
[angular-electron](https://github.com/maximegris/angular-electron)  
本项目使用angular-electron作为模板构建  
[ardublockly](https://github.com/carlosperate/ardublockly)  
本人通过ardublockly源码学习了blockly如何进行Arduino适配  


## TODO LIST  
1. monaco-editor替换为mirrorcode（等mirrorcode next release）  
2. 使用[Arduino-List](https://github.com/luisllamasbinaburo/Arduino-List)做动态数组  
3. 通过arduino cli安装b4a库所需的arduino依赖库  
4. 主题切换功能，允许切换到blockly默认主题  
5. 多语言支持  