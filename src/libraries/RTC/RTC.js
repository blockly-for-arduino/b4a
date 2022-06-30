Arduino['rtc_begin'] = function (block) {
    let RTC_TYPE = getValue(block, 'RTC_TYPE', 'field_dropdown');
    Arduino.addMacro('#include <Wire.h>', '#include <Wire.h>')
    switch (RTC_TYPE) {
        case 'DS1307':
            Arduino.addMacro('#include <RtcDS1307.h>', '#include <RtcDS1307.h>')
            Arduino.addObject('Rtc', 'RtcDS1307<TwoWire> Rtc(Wire);')
            break;
        case 'DS3231':
            Arduino.addMacro('#include <RtcDS3231.h>', '#include <RtcDS3231.h>')
            Arduino.addObject('Rtc', 'RtcDS3231<TwoWire> Rtc(Wire);')
            break;
        default:
            break;
    }
    let code = 'Rtc.Begin();\n';
    return code;
}

Arduino['rtc_date'] = function (block) {
    let monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let year = getValue(block, 'YEAR', 'input_value')
    if (year == '') year = new Date().getFullYear()
    let month = getValue(block, 'MONTH', 'input_value')
    if (month == '') month = new Date().getMonth() + 1
    let day = getValue(block, 'DAY', 'input_value')
    if (day == '') day = new Date().getDate()
    let code = `"${monthList[month - 1]} ${day > 9 ? day : '0' + day.toString()} ${year}"`;
    return code;
}

Arduino['rtc_time'] = function (block) {
    let hour = getValue(block, 'HOUR', 'input_value')
    if (hour == '') hour = new Date().getHours()
    let minute = getValue(block, 'MINUTE', 'input_value')
    if (minute == '') minute = new Date().getMinutes()
    let second = getValue(block, 'SECOND', 'input_value')
    if (second == '') second = new Date().getSeconds()
    console.log(hour, minute, second);
    let code = `"${hour > 9 ? hour : '0' + hour.toString()}:${minute > 9 ? minute : '0' + minute.toString()}:${second > 9 ? second : '0' + second.toString()}"`;
    return code;
}