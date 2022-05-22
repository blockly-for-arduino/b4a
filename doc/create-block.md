# 代码生成块（Code To Block）  

## blockly原本添加库的方式，真的太难用了！我要提供一个新方法！  
blockly添加一个库，需要创建3个文件：block、generator、toolbox。
即使使用了[Block Factory](https://blockly-demo.appspot.com/static/demos/blockfactory/index.html)开发者还是要再编写诸多配置，才能正确的创建出一个block，这无疑是痛苦的。有次看到有开发者为了写一个库，编写了上万行的配置后，我萌生了写一个自动生成block的工具的想法。  

## 如何使用
1. 将最小化代码贴入，点击自动生成  
2. 根据需求修改配置  
3. 导入到B4A环境测试  

## 原理  
b4a block json是对原blockly block json的扩展，以舵机库为例子;
```json
[
    {
        "message0": "引脚 %1 连接的舵机 移动到 %2",
        "inputsInline": true,
        "colour": 230,
        "type": "servo_write",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": "${board.digitalPins}"
            },
            {
                "type": "input_value",
                "name": "NUM0"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "b4a": {
            "primary": "${PIN}",
            "library": "#include <Servo.h>",
            "object": "Servo ${OBJECT_NAME};",
            "setup": "${OBJECT_NAME}.attach(${PIN});",
            "code": "${OBJECT_NAME}.write(${NUM0});"
        },
        "toolbox": {
            "kind": "category",
            "name": "Servo",
            "colour": 60,
            "contents": [
                {
                    "kind": "block",
                    "type": "servo_write",
                    "inputs": {
                        "NUM0": {
                            "block": {
                                "type": "math_number"
                            }
                        }
                    }
                }
            ]
        }
    }
]
```