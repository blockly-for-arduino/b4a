# B4A Json库的生成  
## 代码生成块（Code To Block）  
blockly原本添加库的方式，真的太难用了！我要提供一个新方法！  
blockly添加一个库，需要创建3个文件：block、generator、toolbox。
即使使用了[Block Factory](https://blockly-demo.appspot.com/static/demos/blockfactory/index.html)开发者还是要再编写诸多配置，才能正确的创建出一个block，这无疑是痛苦的。有次看到有开发者为了写一个库，编写了上万行的配置后，我萌生了写一个自动生成block的工具的想法。  

### 如何使用  
1. 将最小化代码贴入，点击自动生成  
2. 根据需求修改配置  
3. 导入到B4A环境测试  

## 关于B4A Json库的说明  
b4a block json是对原blockly block json的扩展，以舵机库为例子;
```json
{
    "category": "舵机",
    "icon": "fal fa-undo",
    "colour": "#48c2c4",
    "version": "0.0.1",
    "blocks": [
        {
            "inputsInline": true,
            "message0": "舵机%1移动到%2",
            "type": "servo1_write",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "OBJECT",
                    "variable": "servo1",
                    "variableTypes": [
                        "Servo"
                    ],
                    "defaultType": "Servo"
                },
                {
                    "type": "field_number",
                    "name": "ANGLE",
                    "value": 0
                }
            ],
            "b4a": {
                "code": "${OBJECT}.write(${ANGLE});",
                "library": "#include <Servo.h>",
                "object": "Servo ${OBJECT};"
            },
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#03a9f4",
            "toolbox": {
                "show": true
            }
        },
        {
            "inputsInline": true,
            "message0": "舵机%1连接到引脚%2",
            "type": "servo1_attach",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "OBJECT",
                    "variable": "servo1",
                    "variableTypes": [
                        "Servo"
                    ],
                    "defaultType": "Servo"
                },
                {
                    "type": "field_dropdown",
                    "name": "PIN1",
                    "options": "${board.digitalPins}"
                }
            ],
            "b4a": {
                "code": "${OBJECT}.attach(${PIN1});",
                "library": "#include <Servo.h>",
                "object": "Servo ${OBJECT};"
            },
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#03a9f4",
            "toolbox": {
                "show": true
            }
        }
    ]
}
]
```

其中`blocks`为库中包含的模块，单一模块中，我扩展了`b4a`和`toolbox`两个key:  
### b4a  
`b4a`为代码生成用，其中的内容，会插入到代码对应的部分。  

> 变量：使用`${XXX}`字样添加变量，添加到程序中后，变量会替换成`args0`中对应的输入项的实际内容。  

### toolbox  
`toolbox`是对blockly toolbox的继承，用于控制block在左侧边栏中的显示。  
参数`show`决定了block是否显示；  
参数`inputs`可为block添加默认输入block；  

