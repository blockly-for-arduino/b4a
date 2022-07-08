export interface BoardConfig {
    "name": string,
    "description": string,
    "compilerTool": string,
    "compilerParam": string,
    "analogPins": any[],
    "digitalPins": any[],
    "pwmPins": any[],
    "serial": string[],
    "serialSpeed": string[],
    "spi": any[],
    "spiPins": any[],
    "spiClockDivide": any[],
    "i2c": any[],
    "i2cPins": any[],
    "i2cSpeed": any[],
    "builtinLed": any[],
    "interrupt": any[],
}

export interface LibInfo {
    name: string,
    block?: string
    generator?: string
    toolbox?: string,
    json?: any,
    show?: boolean
}

export interface SourceLib {
    name: string,
    type: string,
    url: string
}

export interface BoardJsonCloud {
    "name": string,
    "description": string,
    "verison": string,
    "author": string,
    "vender": string,
    "core": string,
    "img": string,
    "file": string,
    "help": string,
    "core_setup": any[],
    "loading"?: boolean
}