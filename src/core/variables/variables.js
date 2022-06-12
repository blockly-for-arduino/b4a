'use strict';


Arduino['variables_get'] = function (block) {
  // Variable getter.
  let varName = Arduino.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE')
  let varType = getVarType(varName)
  Arduino.addVariable(varName, `${varType} ${varName};\n`)
  return [varName, Arduino.ORDER_ATOMIC];
};

Arduino['variables_set'] = function (block) {
  // Variable setter.
  let argument0 = getValue(block, 'VALUE','input_value') || '0'
  let varName = Arduino.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE')
  let varType = getVarType(varName)
  Arduino.addVariable(varName, `${varType} ${varName};\n`)
  return `${varName} = ${argument0};\n`
};

Arduino['variables_get_dynamic'] = Arduino['variables_get']
Arduino['variables_set_dynamic'] = Arduino['variables_set']
