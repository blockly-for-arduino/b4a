# Blockly For Arduino  
![](https://github.com/coloz/b4a/blob/master/doc/img/icon.png?raw=true)

开发中...

为Arduino开发的Blockly编程工具

[官网](https://b4a.clz.me)  
[B4A 库创建器](https://github.com/coloz/b4a-creator)  
[开发板/类库/示例资源](https://github.com/coloz/b4a-cloud)  

![](https://github.com/coloz/b4a/blob/master/doc/img/pic1.jpg?raw=true)

## 开发  
### 关键技术  
[Blockly 8](https://developers.google.com/blockly)  
[Angular 13](https://angular.io/)  
[Electron 18](https://www.electronjs.org/)  

### 安装依赖  
angular和electron node两部分都需要安装依赖  
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
 
## 资源路径设计  
### 库资源  
库我分成了两部分，core里存放一些最基础的公共库，libraries里存放涉及硬件差异的。对最终用户来说，只建议他们操作libraries里的。  

**核心库路径 /src/core/**  
**库路径 /src/libraries/**  

### 开发板资源  
**开发板路径 /src/boards/**  

### 编译上传工具  
目前软件只是针对arduino，仅使用到arduino cli  
**Arduino-Cli路径 /arduino/**  

## 特别鸣谢  
[angular-electron](https://github.com/maximegris/angular-electron)  
本项目使用angular-electron作为模板构建  
[ardublockly](https://github.com/carlosperate/ardublockly)  
本人通过ardublockly源码学习了blockly如何进行Arduino适配  

## 联合发布  
本软件由 奈何col 和 以下组织联合发布  
![](https://github.com/coloz/b4a/blob/master/doc/img/openjumper.png?raw=true)

## 深度合作  
本软件正在和以下组织开展深度合作：  
![](https://github.com/coloz/b4a/blob/master/doc/img/idealab.png?raw=true)

## TODO LIST  
1. monaco-editor替换为mirrorcode（等mirrorcode next release）  
2. 使用[Arduino-List](https://github.com/luisllamasbinaburo/Arduino-List)做动态数组（设计变量添加方式）  
3. 通过arduino cli安装开发板支持  
4. 多语言支持  
5. 移除lib时，检查当前程序中是否已经使用该lib，如果正在使用，不允许移除该lib。
6. 移除board时，检查当前程序中是否已经使用该board，如果正在使用，不允许移除该board。
7. 添加自动更新功能
8. 安装开发板前比对当前已安装版本