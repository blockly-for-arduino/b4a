'use strict';

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

Arduino['variables_get'] = function (block) {
  // Variable getter.
  let varName = Arduino.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE')
  let varType = getVarType(varName)
  return [varName, Arduino.ORDER_ATOMIC];
};

Arduino['variables_set'] = function (block) {
  // Variable setter.
  let argument0 = getValue(block, 'VALUE', 'input_value') || '0'
  let varName = Arduino.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE')
  return `${varName} = ${argument0};\n`
};
