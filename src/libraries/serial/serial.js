'use strict';

Arduino['serial_begin'] = function (block) {
    let serialPort = getValue(block, 'SERIAL');
    let speed = getValue(block, 'SPEED')
    let code = `${serialPort}.begin(${speed});\n`
    return code;
};

Arduino['serial_available'] = function (block) {
    let code = `Serial.available() > 0`
    return [code, Arduino.ORDER_RELATIONAL];
};

Arduino['serial_read'] = function (block) {
    let code = `Serial.read()`
    return [code, Arduino.ORDER_FUNCTION_CALL];
};

Arduino['serial_print'] = function (block) {
    let code = `Serial.print(${getValue(block, 'TEXT')});\n`
    return code;
};

Arduino['serial_println'] = function (block) {
    let code = `Serial.println(${getValue(block, 'TEXT')});\n`
    return code;
};
