/**
 * @fileoverview Generating Arduino for setup/loop blocks.
 * @suppress {missingRequire}
 */
'use strict';

Arduino['arduino_setup'] = function (block) {
  const code = Arduino.statementToCode(block, 'ARDUINO_SETUP');
  Arduino.addUserSetup('setup', code)
  return null;
};

Arduino['arduino_loop'] = function (block) {
  const code = Arduino.statementToCode(block, 'ARDUINO_LOOP');
  Arduino.addLoop('loop', code)
  return null;
};

Arduino['controls_repeat_ext'] = function (block) {
  // Repeat n times.
  let repeats;
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats =
      Arduino.valueToCode(block, 'TIMES', Arduino.ORDER_ASSIGNMENT) ||
      '0';
  }
  let branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block);
  let code = '';
  const loopVar =
    Arduino.nameDB_.getDistinctName('count', 'VARIABLE');
  let endVar = repeats;
  if (!repeats.match(/^\w+$/) && !stringUtils.isNumber(repeats)) {
    endVar =
      Arduino.nameDB_.getDistinctName('repeat_end', 'VARIABLE');
    code += 'int ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (int ' + loopVar + ' = 0; ' + loopVar + ' < ' + endVar + '; ' +
    loopVar + '++) {\n' + branch + '}\n';
  return code;
};

Arduino['controls_repeat'] = Arduino['controls_repeat_ext'];

Arduino['controls_whileUntil'] = function (block) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 =
    Arduino.valueToCode(
      block, 'BOOL',
      until ? Arduino.ORDER_LOGICAL_NOT : Arduino.ORDER_NONE) ||
    'false';
  let branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Arduino['controls_for'] = function (block) {
  // For loop.
  const variable0 = Arduino.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
  // getValue(block,'VAR')

  const argument0 = Arduino.valueToCode(block, 'FROM', Arduino.ORDER_ASSIGNMENT) || '0';
  const argument1 = Arduino.valueToCode(block, 'TO', Arduino.ORDER_ASSIGNMENT) || '0';
  const increment = Arduino.valueToCode(block, 'BY', Arduino.ORDER_ASSIGNMENT) || '1';
  let branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block);
  let code;
  let up = true;
  if (stringUtils.isNumber(argument0) && stringUtils.isNumber(argument1) && stringUtils.isNumber(increment))
    up = Number(argument0) <= Number(argument1);
  else
    if (Number(increment) < 0) up = false;
  code = 'for (' + variable0 + ' = ' + argument0 + '; ' + variable0 +
    (up ? ' <= ' : ' >= ') + argument1 + '; ' + variable0;
  const step = Math.abs(Number(increment));
  if (step === 1) {
    code += up ? '++' : '--';
  } else {
    code += (up ? ' += ' : ' -= ') + step;
  }
  code += ') {\n' + branch + '}\n';
  Arduino.addVariable(variable0, 'int ' + variable0 + ';')
  return code;
};

Arduino['controls_flow_statements'] = function (block) {
  // Flow statements: continue, break.
  let xfix = '';
  if (Arduino.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Arduino.injectId(Arduino.STATEMENT_PREFIX, block);
  }
  if (Arduino.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Arduino.injectId(Arduino.STATEMENT_SUFFIX, block);
  }
  if (Arduino.STATEMENT_PREFIX) {
    const loop = block.getSurroundLoop();
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Arduino.injectId(Arduino.STATEMENT_PREFIX, loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break;\n';
    case 'CONTINUE':
      return xfix + 'continue;\n';
  }
  throw Error('Unknown flow statement.');
};
