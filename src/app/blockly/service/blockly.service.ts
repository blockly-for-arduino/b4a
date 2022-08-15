import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../core/services/config.service';
import Blockly from 'blockly';
import { Toolbox } from "blockly";
import * as zhHans from 'blockly/msg/zh-hans';
import { ElectronService } from '../../core/services/electron.service';
import { BehaviorSubject } from 'rxjs';
import { LibInfo } from '../../core/interfaces';
import { compareList } from '../../func/func';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CustomCategory } from '../customCategory';

@Injectable({
  providedIn: 'root'
})
export class BlocklyService {
  libPath = './libraries';

  libList: string[] = []
  libDict = {}
  // 用于存储lib在toolbox中是否可见
  libDict_show = {}
  blockList = []

  toolbox: any = {
    "kind": "categoryToolbox",
    "contents": [
    ]
  }
  // toolbox: Blockly.utils.toolbox.ToolboxDefinition 

  get theme() {
    let theme = localStorage.getItem('theme')
    if (theme == null)
      theme = 'geras'
    return theme
  }

  loaded = new BehaviorSubject(false)

  reinit = new BehaviorSubject(false)

  workspace: Blockly.WorkspaceSvg;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private electronService: ElectronService,
    private message: NzMessageService
  ) {

  }

  async init() {
    this.changeLanguage('zhHans')

    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      Blockly.ToolboxCategory.registrationName,
      CustomCategory, true);

    this.workspace = Blockly.inject('blocklyDiv', {
      // @ts-ignore
      readOnly: false,
      media: 'media/',
      trashcan: true,
      theme: 'zelos',
      renderer: this.theme,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.5,
        scaleSpeed: 1.05,
        pinch: true
      },
      toolbox: {
        "kind": "categoryToolbox",
        "contents": [
        ]
      }
    });

    // 加载库
    this.blockList = []
    this.toolbox = {
      "kind": "categoryToolbox",
      "contents": [
      ]
    }
    let libs = await this.electronService.loadLibraries()
    this.processLibs(libs)
    await this.loadLibs()
    Blockly.defineBlocksWithJsonArray(this.blockList);
    // if (typeof this.workspace != 'undefined') {
    //   if (this.workspace.getToolbox() != null)
    //     this.workspace.updateToolbox(this.toolbox);
    // }
    this.toolbox = {
      "kind": "categoryToolbox",
      "contents": [
        {
          "kind": "category",
          "name": "列表",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "category",
              "name": "逻辑",
              "colour": "#48c2c4",
              "contents": [
                {
                  "kind": "block",
                  "type": "controls_if"
                },
                {
                  "kind": "block",
                  "type": "controls_ifelse"
                },
                {
                  "kind": "block",
                  "type": "logic_compare"
                },
                {
                  "kind": "block",
                  "type": "logic_operation"
                },
                {
                  "kind": "block",
                  "type": "logic_negate"
                },
                {
                  "kind": "block",
                  "type": "logic_boolean"
                },
                {
                  "kind": "block",
                  "type": "logic_ternary"
                }
              ],
              "cssConfig": {
                "icon": "fa-light fa-code-branch"
              }
            },
            {
              "kind": "category",
              "name": "循环",
              "colour": "#48c2c4",
              "contents": [
                {
                  "kind": "block",
                  "type": "arduino_setup"
                },
                {
                  "kind": "block",
                  "type": "arduino_loop"
                },
                {
                  "kind": "block",
                  "type": "controls_repeat_ext",
                  "inputs": {
                    "TIMES": {
                      "block": {
                        "type": "math_number",
                        "fields": {
                          "NUM": 10
                        }
                      }
                    }
                  }
                },
                {
                  "kind": "block",
                  "type": "controls_repeat"
                },
                {
                  "kind": "block",
                  "type": "controls_whileUntil"
                },
                {
                  "kind": "block",
                  "type": "controls_for",
                  "inputs": {
                    "FROM": {
                      "block": {
                        "type": "math_number",
                        "fields": {
                          "NUM": 1
                        }
                      }
                    },
                    "TO": {
                      "block": {
                        "type": "math_number",
                        "fields": {
                          "NUM": 10
                        }
                      }
                    },
                    "BY": {
                      "block": {
                        "type": "math_number",
                        "fields": {
                          "NUM": 1
                        }
                      }
                    }
                  }
                },
                {
                  "kind": "block",
                  "type": "controls_flow_statements"
                }
              ],
              "cssConfig": {
                "icon": "fa-light fa-arrows-repeat"
              }
            },
          ],
          "cssConfig": {
            "icon": "fa-light fa-brackets-square"
          }
        },
        {
          "kind": "category",
          "name": "数学",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "math_number"
            },
            {
              "kind": "block",
              "type": "math_random",
              "inputs": {
                "MIN": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                },
                "MAX": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 100
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "math_map"
            },
            {
              "kind": "block",
              "type": "math_abs"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-calculator-simple"
          }
        },
        {
          "kind": "category",
          "name": "字符串",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "text_multiline"
            },
            {
              "kind": "block",
              "type": "text_length"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-input-text"
          }
        },
        {
          "kind": "category",
          "name": "变量",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "button",
              "text": "创建 变量",
              "callbackKey": "CREATE_VARIABLE"
            },
            {
              "kind": "block",
              "type": "variable_define",
              "inputs": {
                "VALUE": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "variables_set"
            },
            {
              "kind": "block",
              "type": "variables_get"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-value-absolute"
          }
        },
        {
          "kind": "category",
          "name": "74HC595移位寄存器",
          "colour": "#FF0000",
          "contents": [
            {
              "kind": "block",
              "type": "74hc595_begin",
              "inputs": {
                "74hc595_amount": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 1
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "74hc595_out_all"
            },
            {
              "kind": "block",
              "type": "74hc595_out_one"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-diagram-sankey"
          }
        },
        {
          "kind": "category",
          "name": "集合",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "variable_var_type"
            },
            {
              "kind": "block",
              "type": "variable_var_name",
              "inputs": {
                "VALUE": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "assemblage_var_type"
            },
            {
              "kind": "block",
              "type": "assemblage_add"
            },
            {
              "kind": "block",
              "type": "assemblage_add_range"
            },
            {
              "kind": "block",
              "type": "assemblage_insert"
            },
            {
              "kind": "block",
              "type": "assemblage_insert_range"
            },
            {
              "kind": "block",
              "type": "assemblage_replace"
            },
            {
              "kind": "block",
              "type": "assemblage_replace_range"
            },
            {
              "kind": "block",
              "type": "assemblage_remove"
            },
            {
              "kind": "block",
              "type": "assemblage_remove_range"
            },
            {
              "kind": "block",
              "type": "assemblage_indexOf"
            },
            {
              "kind": "block",
              "type": "assemblage_trim"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-list-tree"
          }
        },
        {
          "kind": "category",
          "name": "点灯·blinker",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "blinker_begin_wifi"
            },
            {
              "kind": "block",
              "type": "blinker_begin_ble"
            },
            {
              "kind": "block",
              "type": "blinker_button_callback"
            },
            {
              "kind": "block",
              "type": "blinker_button_callback"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-blinker"
          }
        },
        {
          "kind": "category",
          "name": "蜂鸣器",
          "colour": "#FF0000",
          "contents": [
            {
              "kind": "block",
              "type": "Buzzer_ON"
            },
            {
              "kind": "block",
              "type": "Buzzer_OFF"
            },
            {
              "kind": "block",
              "type": "Buzzer_ON_noTimer"
            },
            {
              "kind": "block",
              "type": "Buzzer_OFF_noTimer"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-buzzer"
          }
        },
        {
          "kind": "category",
          "name": "DHT温湿度传感器",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "dht_init"
            },
            {
              "kind": "block",
              "type": "dht_readtemperature"
            },
            {
              "kind": "block",
              "type": "dht_readhumidity"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-dht22"
          }
        },
        {
          "kind": "category",
          "name": "EEPROM",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "eeprom_read",
              "inputs": {
                "ADDRESS": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 1
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "eeprom_length"
            },
            {
              "kind": "block",
              "type": "eeprom_write"
            }
          ],
          "cssConfig": {
            "icon": "fal fa-database"
          }
        },
        {
          "kind": "category",
          "name": "多功能电机驱动",
          "colour": "#FF0000",
          "contents": [
            {
              "kind": "block",
              "type": "IICMotorDriver_begin"
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_DIR_begin"
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_setMotor",
              "inputs": {
                "MD_speed_value": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2000
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_setAllMotor",
              "inputs": {
                "MD_speed_value_All": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2000
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_setAllMotor_alone",
              "inputs": {
                "MD_speed_value_All_alone1": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2000
                    }
                  }
                },
                "MD_speed_value_All_alone2": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2000
                    }
                  }
                },
                "MD_speed_value_All_alone3": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2000
                    }
                  }
                },
                "MD_speed_value_All_alone4": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2000
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_stopMotor"
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_digitalWrite"
            },
            {
              "kind": "block",
              "type": "IICMotorDriver_setServoPulse",
              "inputs": {
                "IO_SER_OUT": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 200
                    }
                  }
                }
              }
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-motor"
          }
        },
        {
          "kind": "category",
          "name": "I/O",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "io_pinmode",
              "inputs": {
                "PIN": {
                  "block": {
                    "type": "io_pin_digi",
                    "fields": {
                      "PIN": "0"
                    }
                  }
                },
                "MODE": {
                  "block": {
                    "type": "io_mode",
                    "fields": {
                      "MODE": "INPUT"
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "io_digitalwrite",
              "inputs": {
                "PIN": {
                  "block": {
                    "type": "io_pin_digi",
                    "fields": {
                      "PIN": "0"
                    }
                  }
                },
                "STATE": {
                  "block": {
                    "type": "io_state",
                    "fields": {
                      "STATE": "LOW"
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "io_digitalread",
              "inputs": {
                "PIN": {
                  "block": {
                    "type": "io_pin_digi",
                    "fields": {
                      "PIN": "0"
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "io_analogwrite",
              "inputs": {
                "PIN": {
                  "block": {
                    "type": "io_pin_pwm",
                    "fields": {
                      "PIN": "3"
                    }
                  }
                },
                "PWM": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 255
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "io_analogread",
              "inputs": {
                "PIN": {
                  "block": {
                    "type": "io_pin_adc",
                    "fields": {
                      "PIN": "A0"
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "io_pin_digi"
            },
            {
              "kind": "block",
              "type": "io_pin_adc"
            },
            {
              "kind": "block",
              "type": "io_pin_pwm"
            },
            {
              "kind": "block",
              "type": "io_mode"
            },
            {
              "kind": "block",
              "type": "io_state"
            }
          ],
          "cssConfig": {
            "icon": "fal fa-microchip"
          }
        },
        {
          "kind": "category",
          "name": "红外通信",
          "colour": "#FF0000",
          "contents": [
            {
              "kind": "block",
              "type": "IRremote_begin"
            },
            {
              "kind": "block",
              "type": "IRremote_Send"
            },
            {
              "kind": "block",
              "type": "IRremote_receive_EN"
            },
            {
              "kind": "block",
              "type": "IRremote_data_receive_print"
            },
            {
              "kind": "block",
              "type": "IRremote_Send_array"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-ir-temp"
          }
        },
        {
          "kind": "category",
          "name": "IIC液晶显示屏",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "lcd_init"
            },
            {
              "kind": "block",
              "type": "lcd_setcursor",
              "inputs": {
                "NUM0": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                },
                "NUM1": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "lcd_print",
              "inputs": {
                "TEXT0": {
                  "block": {
                    "type": "text_multiline",
                    "fields": {
                      "TEXT": ""
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "lcd_write",
              "inputs": {
                "CHAR": {
                  "block": {
                    "type": "text",
                    "fields": {
                      "TEXT": ""
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "lcd_backlight"
            },
            {
              "kind": "block",
              "type": "lcd_nobacklight"
            },
            {
              "kind": "block",
              "type": "lcd_clear"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-lcd1602"
          }
        },
        {
          "kind": "category",
          "name": "PS2手柄",
          "colour": "#FF0000",
          "contents": [
            {
              "kind": "block",
              "type": "PS2X_begin"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-gamepad"
          }
        },
        {
          "kind": "category",
          "name": "时钟模块",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "rtc_begin"
            },
            {
              "kind": "block",
              "type": "rtc_setdatetime_system"
            },
            {
              "kind": "block",
              "type": "rtc_setdatetime",
              "inputs": {
                "DATE": {
                  "block": {
                    "type": "rtc_date",
                    "inputs": {
                      "YEAR": {
                        "block": {
                          "type": "math_number",
                          "fields": {
                            "NUM": 2020
                          }
                        }
                      },
                      "MONTH": {
                        "block": {
                          "type": "math_number",
                          "fields": {
                            "NUM": 1
                          }
                        }
                      },
                      "DAY": {
                        "block": {
                          "type": "math_number",
                          "fields": {
                            "NUM": 1
                          }
                        }
                      }
                    }
                  }
                },
                "TIME": {
                  "block": {
                    "type": "rtc_time",
                    "inputs": {
                      "HOUR": {
                        "block": {
                          "type": "math_number",
                          "fields": {
                            "NUM": 0
                          }
                        }
                      },
                      "MINUTE": {
                        "block": {
                          "type": "math_number",
                          "fields": {
                            "NUM": 0
                          }
                        }
                      },
                      "SECOND": {
                        "block": {
                          "type": "math_number",
                          "fields": {
                            "NUM": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "rtc_getdatetime_year"
            },
            {
              "kind": "block",
              "type": "rtc_getdatetime_month"
            },
            {
              "kind": "block",
              "type": "rtc_getdatetime_day"
            },
            {
              "kind": "block",
              "type": "rtc_getdatetime_hour"
            },
            {
              "kind": "block",
              "type": "rtc_getdatetime_minute"
            },
            {
              "kind": "block",
              "type": "rtc_getdatetime_second"
            },
            {
              "kind": "block",
              "type": "rtc_date",
              "inputs": {
                "YEAR": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 2020
                    }
                  }
                },
                "MONTH": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 1
                    }
                  }
                },
                "DAY": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 1
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "rtc_time",
              "inputs": {
                "HOUR": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                },
                "MINUTE": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                },
                "SECOND": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 0
                    }
                  }
                }
              }
            }
          ],
          "cssConfig": {
            "icon": "fal fa-clock"
          }
        },
        {
          "kind": "category",
          "name": "串口",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "serial_begin"
            },
            {
              "kind": "block",
              "type": "serial_available"
            },
            {
              "kind": "block",
              "type": "serial_read"
            },
            {
              "kind": "block",
              "type": "serial_print"
            },
            {
              "kind": "block",
              "type": "serial_println"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-arrow-right-arrow-left"
          }
        },
        {
          "kind": "category",
          "name": "舵机",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "servo1_write"
            },
            {
              "kind": "block",
              "type": "servo1_attach"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-servo"
          }
        },
        {
          "kind": "category",
          "name": "SSD1306显示屏",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "u8g2_begin"
            },
            {
              "kind": "block",
              "type": "u8g2_drawStr"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-oled12864"
          }
        },
        {
          "kind": "category",
          "name": "时间控制",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "time_delay",
              "inputs": {
                "TIME": {
                  "block": {
                    "type": "math_number",
                    "fields": {
                      "NUM": 1000
                    }
                  }
                }
              }
            },
            {
              "kind": "block",
              "type": "time_millis"
            },
            {
              "kind": "block",
              "type": "system_time"
            },
            {
              "kind": "block",
              "type": "system_date"
            }
          ],
          "cssConfig": {
            "icon": "fa-light fa-clock"
          }
        },
        {
          "kind": "category",
          "name": "超声波",
          "colour": "#48c2c4",
          "contents": [
            {
              "kind": "block",
              "type": "ultrasonic"
            },
            {
              "kind": "block",
              "type": "ultrasonic_read"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-sr04"
          }
        },
        {
          "kind": "category",
          "name": "WS2812彩灯",
          "colour": "#FF0000",
          "contents": [
            {
              "kind": "block",
              "type": "RGB_begin"
            },
            {
              "kind": "block",
              "type": "RGB_lightintensity_CTRL"
            },
            {
              "kind": "block",
              "type": "RGB_colour_ctrl"
            },
            {
              "kind": "block",
              "type": "RGB_parameter"
            },
            {
              "kind": "block",
              "type": "RGB_update"
            },
            {
              "kind": "block",
              "type": "RGB_demo"
            },
            {
              "kind": "block",
              "type": "RGB_demo2"
            }
          ],
          "cssConfig": {
            "icon": "iconfont icon-ws2812"
          }
        }
      ]
    }
    if (typeof this.workspace != 'undefined') {
      if (this.workspace.getToolbox() != null)
        this.workspace.updateToolbox(this.toolbox);
    }

    this.loaded.next(true)
  }

  // 预处理库
  processLibs(libraries: any[]) {
    let libList = localStorage.getItem('libList')
    if (libList == null) {
      this.libList = libraries.map(lib => lib.name)
      localStorage.setItem('libList', JSON.stringify(this.libList))
    } else {
      let libList_new: any[] = libraries.map(lib => lib.name)
      let libList_old: any[] = JSON.parse(libList)
      let result = compareList(libList_old, libList_new)
      // 移除已删除的库
      result.del.forEach(libName => {
        libList_old.splice(libList_old.indexOf(libName), 1)
      });
      // 添加新增的库
      this.libList = libList_old.concat(result.add)
    }
    let libDict_show = localStorage.getItem('libDict_show')
    if (libDict_show != null) {
      this.libDict_show = JSON.parse(libDict_show)
    }

    libraries.forEach(lib => {
      this.libDict[lib.name] = Object.assign(lib, this.libDict_show[lib.name])
      if (typeof this.libDict[lib.name].show == 'undefined')
        this.libDict[lib.name]['show'] = true
    })

    console.log('libList:', this.libList);
    console.log('libDict:', this.libDict);
  }
  // 加载库
  async loadLibs() {
    for (let index = 0; index < this.libList.length; index++) {
      let libInfo = this.libDict[this.libList[index]];
      await this.loadLib(libInfo);
    }
  }

  loadLib(libInfo: LibInfo) {
    return new Promise(async (resolve, reject) => {
      // 避免重复加载
      if (libInfo) {
        if (libInfo.block) await this.loadLibJson(libInfo.block, libInfo.name)
        if (libInfo.generator) await this.loadLibScript(libInfo.generator)
        if (libInfo.toolbox && libInfo.show) await this.loadToolboxJson(libInfo.toolbox)
      }

      resolve(true)
    })
  }

  async loadLibJson(path, name) {
    return new Promise(async (resolve, reject) => {
      try {
        this.loadUrl(path).subscribe(config => {
          let libJson = this.processJsonVariable(config)
          this.libDict[name]['json'] = libJson
          // b4a 代码创建器
          this.b4a2js(libJson, name)
          this.blockList = this.blockList.concat(libJson.blocks)
          resolve(true)
        })
      } catch (error) {
        this.message.error(`加载库 ${name} 失败`)
        this.message.error(error)
        console.log(error);

        resolve(false)
      }
    })
  }

  loadUrl(url) {
    return this.http.get(url, {
      responseType: 'json',
      headers: { 'Cache-Control': 'public,max-age=600' }
    })
  }

  b4a2js(libJson, libName) {
    try {
      libJson.blocks.forEach(blockJson => {
        if (blockJson.b4a) {
          // console.log('b4a代码创建器 >>> ' + blockJson.type);
          let Arduino: any = window['Arduino']
          let getValue: any = window['getValue']
          Arduino[blockJson.type] = (block) => {
            // 前置钩子函数 downey 2022-6-17
            // if (typeof Arduino[blockJson.type].prototype.processB4ACodeBefore === 'function') Arduino[blockJson.type].prototype.processB4ACodeBefore(block, blockJson);
            // 添加宏
            if (blockJson.b4a.macro) {
              Arduino.addMacro(blockJson.b4a.macro, blockJson.b4a.macro)
            }
            // 添加库
            if (blockJson.b4a.library) {
              Arduino.addLibrary(blockJson.b4a.library, blockJson.b4a.library)
            }
            // b4a变量表，用于最后替换变量
            let b4aVars = {}

            if (blockJson.args0) {
              blockJson.args0.forEach(arg => {
                if (arg.name)
                  b4aVars['${' + arg.name + '}'] = getValue(block, arg.name, arg.type)
              });
            }
            if (blockJson.args1) {
              blockJson.args1.forEach(arg => {
                if (arg.name)
                  b4aVars['${' + arg.name + '}'] = getValue(block, arg.name, arg.type)
              });
            }

            if (blockJson.b4a.object) {
              let primary
              if (blockJson.b4a.primary) primary = processB4ACode(blockJson.b4a.primary, b4aVars);
              let className: string = blockJson.b4a.object.split(' ')[0]
              b4aVars['${OBJECT_NAME}'] = className.toLowerCase() + '_' + primary;
              let object_code = processB4ACode(blockJson.b4a.object, b4aVars)
              Arduino.addObject(b4aVars['${OBJECT_NAME}'], object_code)
            }
            if (blockJson.b4a.function) {
              let functionBody = processB4ACode(blockJson.b4a.function, b4aVars)
              Arduino.addFunction(blockJson.b4a.function, functionBody)
            }
            if (blockJson.b4a.setup) {
              let setup_code = processB4ACode(blockJson.b4a.setup, b4aVars)
              Arduino.addSetup(b4aVars['${OBJECT_NAME}'], setup_code)
            }
            if (blockJson.b4a.code) {
              let code = processB4ACode(blockJson.b4a.code, b4aVars)
              return blockJson.output ? code : code + '\n'
            } else return '';

          }
        }
        // 判断库是否被用户隐藏
        if (this.libDict_show[libName])
          if (!this.libDict_show[libName].show) {
            return
          }
        // 如果是按键，直接添加到toolbox
        if (blockJson.kind == 'button') {
          let buttonJson = blockJson
          this.addButtonToCategory(libJson, buttonJson)
          return
        }
        // 添加到toolbox
        if (blockJson.toolbox) {
          if (!blockJson.toolbox.show) return
          this.addBlockToCategory(libJson, blockJson)
        }
      });
    } catch (error) {
      this.message.error(`加载库 ${libName} 失败`)
      this.message.error(error)
      console.log(error);

    }
  }

  addButtonToCategory(libJson, buttonJson) {
    let categoryIsExist = false;
    for (let index = 0; index < this.toolbox['contents'].length; index++) {
      const category = this.toolbox['contents'][index];
      if (category.name == libJson.category) {
        categoryIsExist = true
        category.contents.push(buttonJson)
        return
      }
    }
    if (!categoryIsExist) {
      let category = {
        "kind": "category",
        "name": libJson.category,
        "colour": libJson.colour,
        "contents": [],
        "custom": libJson.custom
      }
      if (libJson.icon) {
        category["cssConfig"] = {
          "icon": libJson.icon
        }
      }
      category.contents.push(buttonJson)
      this.toolbox['contents'].push(category)
    }
  }

  addBlockToCategory(libJson, blockJson) {
    let categoryIsExist = false;
    this.toolbox['contents'].forEach(category => {
      if (category.name == libJson.category) {
        categoryIsExist = true
        let block = {
          kind: 'block',
          type: blockJson.type
        }
        if (blockJson.toolbox.inputs) {
          block['inputs'] = blockJson.toolbox.inputs
        }
        category.contents.push(block)
        return
      }
    });
    if (!categoryIsExist) {
      let category = {
        "kind": "category",
        "name": libJson.category,
        "colour": libJson.colour,
        "contents": []
      }
      let block = {
        kind: 'block',
        type: blockJson.type
      }
      if (blockJson.toolbox)
        if (blockJson.toolbox.inputs) {
          block['inputs'] = blockJson.toolbox.inputs
        }
      category.contents.push(block)
      if (libJson.icon) {
        category["cssConfig"] = {
          "icon": libJson.icon
        }
      }
      this.toolbox['contents'].push(category)
    }
  }

  async loadToolboxJson(path) {
    return new Promise(async (resolve, reject) => {
      this.loadUrl(path).subscribe(
        (config: any) => {
          // console.log(config);
          this.toolbox['contents'].push(config)
          resolve(true)
        },
        error => {
          resolve(false)
        })
    })
  }

  loadLibScript(path) {
    return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = path;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = (error: any) => resolve(false);
      document.getElementsByTagName('head')[0].appendChild(script);
    })
  }

  // 替换json配置中的board相关变量
  processJsonVariable(sourceJson) {
    let jsonString = JSON.stringify(sourceJson)
    let result = jsonString.match(/"\$\{board\.(\S*?)\}"/g)
    if (result != null) {
      // console.log(result);
      result.forEach(item => {
        let itemName = item.replace('"${', '').replace('}"', '')
        // console.log(itemName);
        let data = JSON.parse(JSON.stringify(this.configService.config))
        // console.log(data);
        itemName.split('.').forEach(el => {
          data = data[el]
        })
        jsonString = jsonString.replace(item, JSON.stringify(data))
      });
    }
    return JSON.parse(jsonString)
  }

  async updateToolbox() {
    this.toolbox = {
      "kind": "categoryToolbox",
      "contents": [
      ]
    }
    let libs = await this.electronService.loadLibraries()
    this.processLibs(libs)
    await this.loadLibs()
    this.workspace.updateToolbox(this.toolbox);
  }

  changeTheme(theme) {
    localStorage.setItem('theme', theme)
    this.reinit.next(true)
  }

  changeLanguage(language) {
    // @ts-ignore
    Blockly.setLocale(zhHans);
    Blockly.Msg["VARIABLES_DEFAULT_NAME"] = "var1"; // 这句为啥没生效
  }

}

// 替换json中的变量
function processB4ACode(code: string, vars: object): string {
  // console.log(code, vars)
  for (const varName in vars) {
    let reg = new RegExp('\\' + varName, 'g')
    code = code.replace(reg, vars[varName])
  }
  try {
    code = code.replace(/{{([\s\S]*?)}}/g, function () {
      let str = arguments[1].replace(/\${([\s\S]*?)}(?=|[\s;])/g, function () {
        if (arguments[1] === '') return JSON.stringify(arguments[1]);
        return JSON.stringify(arguments[0]);
      });
      if (str.indexOf('return ') === -1) str = 'return ' + str;
      str = (new Function(str))();
      str = str.replace(/"\${([\s\S]*?)}"(?=|[\s;])/g, function () {
        return arguments[1];
      })
      return str;
    })
  } catch (e) {

  }
  return code
}




