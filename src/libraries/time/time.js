'use strict';

Arduino['time_delay'] = function (block) {
    let time = getValue(block,'TIME');
    let code = `delay(${time});\n`
    return code;
};

Arduino['time_millis'] = function (block) {
    let code = `millis()`
    return [code, Arduino.ORDER_FUNCTION_CALL];
};