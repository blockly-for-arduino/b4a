/**
 * @fileoverview Generating Arduino for math blocks.
 * @suppress {missingRequire}
 */
'use strict';

Arduino['io_pin_digi'] = function (block) {
    let pin = getValue(block, 'PIN');
    return pin;
};

Arduino['io_pin_adc'] = Arduino['io_pin_digi']

Arduino['io_pin_pwm'] = Arduino['io_pin_digi']

Arduino['io_mode'] = function (block) {
    let mode = getValue(block, 'MODE')
    return mode;
};

Arduino['io_pinMode'] = function (block) {
    // console.log(block);
    let pin = getValue(block, 'PIN');
    let mode = getValue(block, 'MODE')
    let code = `pinMode(${pin},${mode});\n`
    return code;
};

Arduino['io_digitalWrite'] = function (block) {
    // console.log(block);
    let pin = getValue(block, 'PIN');
    let state = getValue(block, 'STATE');
    let code = `digitalWrite(${pin},${state});\n`;
    return code;
};

Arduino['io_state'] = function (block) {
    let state = getValue(block, 'STATE');
    return state;
};

Arduino['io_digitalRead'] = function (block) {
    let pin = getValue(block, 'PIN');
    let code = `digitalRead(${pin})`;
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['io_analogWrite'] = function (block) {
    // console.log(block);
    let pin = getValue(block, 'PIN');
    // console.log(JSON.stringify(pin));
    let pwm = getValue(block, 'PWM')
    let code = `analogWrite(${pin},${pwm});\n`;
    return code;
};

Arduino['io_analogRead'] = function (block) {
    let pin = getValue(block, 'PIN');
    let code = `analogRead(${pin})`;
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['io_pulsein'] = function (block) {
    let pin = block.getFieldValue("PULSEPIN");
    let type = Arduino.valueToCode(block, "PULSETYPE", Arduino.ORDER_ATOMIC);

    Arduino.reservePin(
        block, pin, Arduino.PinTypes.INPUT, 'Pulse Pin');

    let pinSetupCode = 'pinMode(' + pin + ', INPUT);\n';
    Arduino.addSetup('io_' + pin, pinSetupCode, false);

    let code = 'pulseIn(' + pin + ', ' + type + ')';

    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['io_pulsetimeout'] = function (block) {
    let pin = block.getFieldValue("PULSEPIN");
    let type = Arduino.valueToCode(block, "PULSETYPE", Arduino.ORDER_ATOMIC);
    let timeout = Arduino.valueToCode(block, "TIMEOUT", Arduino.ORDER_ATOMIC);

    Arduino.reservePin(
        block, pin, Arduino.PinTypes.INPUT, 'Pulse Pin');

    let pinSetupCode = 'pinMode(' + pin + ', INPUT);\n';
    Arduino.addSetup('io_' + pin, pinSetupCode, false);

    let code = 'pulseIn(' + pin + ', ' + type + ', ' + timeout + ')';

    return [code, Arduino.ORDER_ATOMIC];
}; 