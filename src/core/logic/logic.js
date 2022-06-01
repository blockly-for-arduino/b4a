'use strict';

Arduino['controls_if'] = function (block) {
    // If/elseif/else condition.
    let n = 0;
    let code = '';
    if (Arduino.STATEMENT_PREFIX) {
        // Automatic prefix insertion is switched off for this block.  Add manually.
        code += Arduino.injectId(Arduino.STATEMENT_PREFIX, block);
    }
    do {
        const conditionCode =
            Arduino.valueToCode(block, 'IF' + n, Arduino.ORDER_NONE) ||
            'false';
        let branchCode = Arduino.statementToCode(block, 'DO' + n);
        if (Arduino.STATEMENT_SUFFIX) {
            branchCode = Arduino.prefixLines(
                Arduino.injectId(Arduino.STATEMENT_SUFFIX, block),
                Arduino.INDENT) +
                branchCode;
        }
        code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' +
            branchCode + '}';
        n++;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE') || Arduino.STATEMENT_SUFFIX) {
        let branchCode = Arduino.statementToCode(block, 'ELSE');
        if (Arduino.STATEMENT_SUFFIX) {
            branchCode = Arduino.prefixLines(
                Arduino.injectId(Arduino.STATEMENT_SUFFIX, block),
                Arduino.INDENT) +
                branchCode;
        }
        code += ' else {\n' + branchCode + '}';
    }
    return code + '\n';
};

Arduino['controls_ifelse'] = Arduino['controls_if'];

Arduino['logic_compare'] = function (block) {
    let a = getValue(block, 'A');
    let operator = getValue(block, 'OP');
    let b = getValue(block, 'B');
    let code = `${a} ${operator} ${b}`
    const order = (operator === '==' || operator === '!=') ? Arduino.ORDER_EQUALITY : Arduino.ORDER_RELATIONAL;
    return [code, order];
};

Arduino['logic_operation'] = function (block) {
    // Operations 'and', 'or'.
    const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
    const order = (operator === '&&') ? Arduino.ORDER_LOGICAL_AND :
        Arduino.ORDER_LOGICAL_OR;
    let argument0 = Arduino.valueToCode(block, 'A', order);
    let argument1 = Arduino.valueToCode(block, 'B', order);
    if (!argument0 && !argument1) {
        // If there are no arguments, then the return value is false.
        argument0 = 'false';
        argument1 = 'false';
    } else {
        // Single missing arguments have no effect on the return value.
        const defaultArgument = (operator === '&&') ? 'true' : 'false';
        if (!argument0) {
            argument0 = defaultArgument;
        }
        if (!argument1) {
            argument1 = defaultArgument;
        }
    }
    const code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};

Arduino['logic_negate'] = function (block) {
    // Negation.
    const order = Arduino.ORDER_LOGICAL_NOT;
    const argument0 = Arduino.valueToCode(block, 'BOOL', order) || 'true';
    const code = '!' + argument0;
    return [code, order];
};

Arduino['logic_boolean'] = function (block) {
    // Boolean values true and false.
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['logic_null'] = function (block) {
    // Null data type.
    return ['null', Arduino.ORDER_ATOMIC];
};

Arduino['logic_ternary'] = function (block) {
    // Ternary operator.
    const value_if =
        Arduino.valueToCode(block, 'IF', Arduino.ORDER_CONDITIONAL) ||
        'false';
    const value_then =
        Arduino.valueToCode(block, 'THEN', Arduino.ORDER_CONDITIONAL) ||
        'null';
    const value_else =
        Arduino.valueToCode(block, 'ELSE', Arduino.ORDER_CONDITIONAL) ||
        'null';
    const code = value_if + ' ? ' + value_then + ' : ' + value_else;
    return [code, Arduino.ORDER_CONDITIONAL];
};
