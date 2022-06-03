export let ToolBox = {
    "kind": "categoryToolbox",
    "contents": [
        {
            "kind": "category",
            "name": "逻辑",
            "categorystyle": "logic_category",
            "cssConfig": {
                "icon": "fal fa-code-branch"
            },
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
                },
            ]
        },
        {
            "kind": "category",
            "name": "循环",
            "categorystyle": "loop_category",
            "cssConfig": {
                "icon": "fal fa-repeat-alt"
            },
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
                                "type": "math_number", "fields": {
                                    "NUM": 10
                                }
                            }
                        },
                        "BY": {
                            "block": {
                                "type": "math_number", "fields": {
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
            ]
        },
        {
            "kind": "category",
            "name": "字符串",
            "categorystyle": "text_category",
            "cssConfig": {
                "icon": "fal fa-text"
            },
            "contents": [
                {
                    "kind": "block",
                    "type": "text"
                },
                {
                    "kind": "block",
                    "type": "text_append"
                },
                {
                    "kind": "block",
                    "type": "text_length"
                }
                ,
                {
                    "kind": "block",
                    "type": "text_isEmpty"
                },
                {
                    "kind": "block",
                    "type": "text_indexOf"
                },
                {
                    "kind": "block",
                    "type": "text_charAt"
                },
                {
                    "kind": "block",
                    "type": "text_getSubstring"
                },
                {
                    "kind": "block",
                    "type": "text_changeCase"
                },
                {
                    "kind": "block",
                    "type": "text_trim"
                },
                {
                    "kind": "block",
                    "type": "text_print"
                },
                {
                    "kind": "block",
                    "type": "text_prompt_ext"
                },
                {
                    "kind": "block",
                    "type": "text_prompt"
                },
                {
                    "kind": "block",
                    "type": "text_replace"
                }
            ]
        },
        {
            "kind": "category",
            "name": "数组",
            "categorystyle": "list_category",
            "cssConfig": {
                "icon": "fal fa-brackets"
            },
            "contents": [
                {
                    "kind": "block",
                    "type": "lists_create_empty"
                },
                {
                    "kind": "block",
                    "type": "lists_create_with"
                },
                {
                    "kind": "block",
                    "type": "lists_repeat"
                },
                {
                    "kind": "block",
                    "type": "lists_length"
                },
                {
                    "kind": "block",
                    "type": "lists_isEmpty"
                },
                {
                    "kind": "block",
                    "type": "lists_indexOf"
                },
                {
                    "kind": "block",
                    "type": "lists_getIndex"
                },
                {
                    "kind": "block",
                    "type": "lists_setIndex"
                },
                {
                    "kind": "block",
                    "type": "lists_getSublist"
                },
                {
                    "kind": "block",
                    "type": "lists_sort"
                },
                {
                    "kind": "block",
                    "type": "lists_split"
                },
                {
                    "kind": "block",
                    "type": "lists_reverse"
                }
            ]
        },
        {
            "kind": "category",
            "name": "数学",
            "categorystyle": "math_category",
            "cssConfig": {
                "icon": "fal fa-calculator"
            },
            "contents": [
                {
                    "kind": "block",
                    "type": "math_number"
                },
                {
                    "kind": "block",
                    "type": "math_arithmetic"
                },
                {
                    "kind": "block",
                    "type": "math_single"
                },
                {
                    "kind": "block",
                    "type": "math_trig"
                },
                {
                    "kind": "block",
                    "type": "math_constant"
                },
                {
                    "kind": "block",
                    "type": "math_number_property"
                },
                {
                    "kind": "block",
                    "type": "math_change"
                },
                {
                    "kind": "block",
                    "type": "math_round"
                },
                {
                    "kind": "block",
                    "type": "math_on_list"
                },
                {
                    "kind": "block",
                    "type": "math_modulo"
                },
                {
                    "kind": "block",
                    "type": "math_constrain"
                },
                {
                    "kind": "block",
                    "type": "math_random_int"
                },
                {
                    "kind": "block",
                    "type": "math_random_float"
                },
                {
                    "kind": "block",
                    "type": "math_atan2"
                }
            ]
        },
        {
            "kind": "category",
            "name": "变量",
            "custom": "VARIABLE",
            "categorystyle": "variable_category",
            "cssConfig": {
                "icon": "fal fa-calculatorfal fa-subscript"
            },
            "contents": [
                {
                    "kind": "button",
                    "text": "A button",
                    "callbackKey": "CREATE_VARIABLE"
                },
                {
                    "kind": "block",
                    "type": "variables_get"
                },
                {
                    "kind": "block",
                    "type": "variables_set"
                }
            ]
        },
        {
            "kind": "sep",
            "cssConfig": {
                "container": "toolbox-sep"
            }
        },
    ]
};