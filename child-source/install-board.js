const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const child_process = require('child_process')
const superagent = require('superagent');
// const rmdir = require('rimraf');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// install -boardName -boardUrl -boardPath -coreUrl -corePath -coreName -coreVersion

var boardPath = getArgv('-boardPath')
var boardName = getArgv('-boardName')
var coreUrl = getArgv('-coreUrl')
var corePath = getArgv('-corePath')
var coreName = getArgv('-coreName')
var coreVersion = getArgv('-coreVersion')
var gitPath = '.\\temp\\' + coreName + '@' + coreVersion

hasChild = fs.existsSync('.\\child')
hasResources = fs.existsSync('.\\resources')
var _7zaPath = hasChild ? '.\\child\\7za.exe' : hasResources ? '.\\resources\\child\\7za.exe' : '.\\7za.exe'
var arduinoCliPath = hasChild ? '.\\child\\arduino-cli.exe' : hasResources ? '.\\resources\\child\\arduino-cli.exe' : '.\\arduino-cli.exe'
var boardJsonStr;
var boardJson;
var _7zFilePath;
console.log(_7zaPath);
console.log(arduinoCliPath);


run();

async function run() {
    console.log('DOWNLOAD_BOARD_JSON');
    if (!await downloadBoardJson()) {
        console.log('DOWNLOAD_BOARD_FAIL');
        return;
    }
    console.log('CHECK_BOARD_CORE');
    if (!await checkBoardCore()) {
        console.log('DOWNLOAD_BOARD_CORE');
        await downloadBoardCore()
    }
    console.log('INSTALL_BOARD_ING');
    if (await installBoard()) {
        console.log('INSTALL_BOARD_DONE');
        return
    }
    console.log('INSTALL_BOARD_FAIL');

}

function downloadBoardJson() {
    return new Promise((resolve, reject) => {
        superagent.get(getArgv('-boardUrl'))
            .then(resp => {
                boardJsonStr = resp.text;
                boardJson = JSON.parse(boardJsonStr);
                resolve(true)
            })
            .catch(error => {
                console.log(error);
                resolve(false)
            });
    })
}

function checkBoardCore() {
    let arduinoCoreList = []
    return new Promise((resolve, reject) => {
        let child_arduinoCoreList = child_process.exec(arduinoCliPath + ' core list')
        child_arduinoCoreList.stdout.on('data', data => {
            if (data.includes('正在')) return;
            let list = data.split('\n')
            list.forEach((line, index) => {
                if (index != 0) {
                    let dataList = line.split(/\s+/)
                    let libName = dataList[0]
                    let version = dataList[1]
                    if (libName != '')
                        arduinoCoreList.push(libName + '@' + version)
                }
            })
        })
        child_arduinoCoreList.on('close', code => {
            console.log('已安装核心列表:', arduinoCoreList);
            if (arduinoCoreList.includes(boardJson.core)) {
                resolve(true)
            } else {
                arduinoCoreList.forEach(core => {
                    let coreName = core.split('@')[0]
                    if (coreName == boardJson.core.split('@')[0]) {
                        console.log('UNINSTALL_OLD_BOARD_CORE');
                        uninstalBoardCore(boardJson.core.split('@')[0])
                    }
                })
                resolve(false)
            }
        })
    })
}

function uninstalBoardCore(coreName) {
    return new Promise((resolve, reject) => {
        let child_arduinoCoreUninstall = child_process.exec(arduinoCliPath + ' core uninstall' + coreName)
        child_arduinoCoreUninstall.stdout.on('data', data => {
            if (data.includes('已卸载')) resolve(true)
        })
    })
}

function downloadBoardCore() {
    console.log('ref: ', coreVersion ? coreVersion : boardJson.core.split('@')[1]);
    return new Promise(async (resolve, reject) => {
        gitPath = ('.\\temp\\' + coreName + '@' + coreVersion).replace(':', '-')
        var result = await git.clone({
            fs: fs,
            http: http,
            dir: gitPath,
            url: coreUrl,
            singleBranch: true,
            depth: 1,
            ref: coreVersion ? coreVersion : boardJson.core.split('@')[1],
            noCheckout: false,
            noTags: true,
            onProgress: event => {
                console.log('Progress', event);
            }
        })
        console.log('git clone done');
        var files = fs.readdirSync(gitPath)
        var filetype;
        if (files.length > 2) {
            filetype = '.7z.001'
        } else {
            filetype = '.7z'
        }
        for (let index = 0; index < files.length; index++) {
            const filename = files[index];
            if (filename.includes(filetype)) {
                _7zFilePath = gitPath + '/' + filename;
                resolve(true)
                return
            }
        }
    })
}

async function installBoard() {
    return new Promise(async (resolve, reject) => {
        // 解压到Arduino15目录
        console.log('_7zFilePath', _7zFilePath);
        if (typeof _7zFilePath != 'undefined') {
            await unpack()
        }
        // 写入配置文件到开发板目录
        if (!fs.existsSync(boardPath))
            fs.mkdirSync(boardPath)
        fs.writeFileSync(`${boardPath}/${boardName}.json`, boardJsonStr, { recursive: true })
        resolve(true)
    })
}

function unpack() {
    return new Promise((resolve, reject) => {
        // windows
        console.log(_7zFilePath, 'to', corePath);
        _7zUnpack(_7zFilePath, corePath, err => {
            if (err == null) {
                console.log('unpack done');
                resolve(true)
            } else {
                console.log('unpack error');
                console.log(err);
                resolve(false)
            }
        });
    })
}

function getArgv(name) {
    return process.argv[process.argv.indexOf(name) + 1]
}

function _7zUnpack(pathToPack, destPathOrCb, cb) {
    if (typeof destPathOrCb === 'function' && cb === undefined) {
        cb = destPathOrCb;
        _7zRun(_7zaPath, ['x', pathToPack, '-y'], cb);
    } else {
        _7zRun(_7zaPath, ['x', pathToPack, '-y', '-o' + destPathOrCb], cb);
    }
}

function _7zRun(bin, args, cb) {
    cb = onceify(cb);
    const runError = new Error(); // get full stack trace
    const proc = child_process.spawn(bin, args, { windowsHide: true });
    let output = '';
    proc.on('error', function (err) {
        cb(err);
    });
    proc.on('exit', function (code) {
        let result = null;
        if (args[0] === 'l') {
            result = parseListOutput(output);
        }
        if (code) {
            runError.message = `7-zip exited with code ${code}\n${output}`;
        }
        cb(code ? runError : null, result);
    });
    proc.stdout.on('data', (chunk) => {
        output += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
        output += chunk.toString();
    });
}

function onceify(fn) {
    let called = false;
    return function () {
        if (called) return;
        called = true;
        fn.apply(this, Array.prototype.slice.call(arguments)); // slice arguments
    };
}

function parseListOutput(str) {
    if (!str.length) return [];
    str = str.replace(/(\r\n|\n|\r)/gm, '\n');
    const items = str.split(/^\s*$/m);
    const res = [];
    const LIST_MAP = {
        'Path': 'name',
        'Size': 'size',
        'Packed Size': 'compressed',
        'Attributes': 'attr',
        'Modified': 'dateTime',
        'CRC': 'crc',
        'Method': 'method',
        'Block': 'block',
        'Encrypted': 'encrypted',
    };

    if (!items.length) return [];

    for (let item of items) {
        if (!item.length) continue;
        const obj = {};
        const lines = item.split('\n');
        if (!lines.length) continue;
        for (let line of lines) {
            const data = line.split(' = ');
            if (data.length !== 2) continue;
            const name = data[0].trim();
            const val = data[1].trim();
            if (LIST_MAP[name]) {
                if (LIST_MAP[name] === 'dateTime') {
                    const dtArr = val.split(' ');
                    if (dtArr.length !== 2) continue;
                    obj['date'] = dtArr[0];
                    obj['time'] = dtArr[1];
                } else {
                    obj[LIST_MAP[name]] = val;
                }
            }
        }
        if (Object.keys(obj).length) res.push(obj);
    }
    return res;
}