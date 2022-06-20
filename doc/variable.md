## 全局变量判断
`window.isGlobal(block)`用于判断是否为全局变量。  
如果变量定义在setup中，则该变量为全局变量，否则为局部变量。  

```js
Arduino['variable_define'] = function (block) {
  let varType = getValue(block, 'TYPE', 'field_dropdown')
  let varName = getValue(block, 'VAR', 'field_variable')
  let value = getValue(block, 'VALUE', 'input_value')
  if (varType == 'char') {
    value = value.replace(/^\"/, "'").replace(/\"$/, "'")
  }
  let code = `${varType} ${varName} = ${value};`
  if (isGlobal(block)) {
    Arduino.addVariable(varName, code)
    return ''
  } else
    return code + '\n'
}
```