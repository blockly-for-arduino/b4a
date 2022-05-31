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
    name:string,
    block?: string
    generator?: string
    toolbox?: string
}