export let uselessInfo = [
    'System wide configuration file',
    'esptool.exe" --chip ',
    `avrdude" "-C`,
    'Serial port ',
    'Features: Wi-Fi',
    'Crystal is 40MHz',
    'MAC:',
    'Uploading stub',
    'Running stub',
    'Stub running',
    'Changed',
    'Flash will be erased from',
    'Configuring flash size',
    'Hash of data verified',
    'Flash params set to',
    'Compressed',
    'Wrote ',
    'File "',
    'Traceback (most recent call last):',
    '###',
    '---',

]

let usefulInfo_Build = [
    '正在检测使用的库',
    '生成函数原型',
    '正在编译项目',
    '正在编译库',
    '正在编译内核',
    '将所有内容链接在一起',
    '项目使用',
    '全局变量使用',
]

export let usefulInfo_Upload = [
    // avrdude
    'avrdude: Version',
    'Using Port',
    'Using Programmer',
    'Overriding Baud Rate',
    'AVR Part',
    'Reading |',
    '###',
    'Writing |',
    'bytes of flash written',
    'avrdude done',
    // esptool
    'esptool.py v3.1',
    'Serial port ',
    'Chip is ',
    'Changing baud rate to',
    'Writing at ',
    'Leaving...',
    'Hard resetting via RTS pin...',
]

let errorInfo_Build = [
    'error:'
]

export let errorInfo_Upload = [
    'could not open port',
    `can't open device`,
    'serial.serialutil.SerialTimeoutException: Write timeout',
    'Failed to execute script esptool',
    '上传时出错',
    '上传失败',
    '上传错误',
    'A fatal error occurred'
]

export let systemInfo = [
    '创建编译任务',
    '编译完成',
    '创建上传任务',
    '上传完成',
    '检查已安装核心...',
    '安装核心',
    '安装完成',
    '加载配置',
    '核心 '
]

export function isUselessInfo(data: string) {
    return isIncludes(data, uselessInfo)
}

export function isUsefulInfo_Build(data: string) {
    return isIncludes(data, usefulInfo_Build)
}

export function isErrorInfo_Build(data: string) {
    return isIncludes(data, errorInfo_Build)
}

export function isUsefulInfo_Upload(data: string) {
    return isIncludes(data, usefulInfo_Upload)
}

export function isErrorInfo_Upload(data: string) {
    return isIncludes(data, errorInfo_Upload)
}

export function isSystemInfo(data: string) {
    return isIncludes(data, systemInfo)
}

export function isIncludes(data, strArray) {
    for (let index = 0; index < strArray.length; index++) {
        const info = strArray[index];
        if (data.includes(info)) {
            return true
        }
    }
    return false
}