const path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const _7z = require('7zip-min')
const os = require('os')

process.on('message', async (msg, setHandle) => {
    // console.log(msg.data);
    process.send({ state: 'INSTALL_CORE_DOWNLOAD' })
    let _7zFilePath = await clone(msg.data)
    process.send({ state: 'INSTALL_CORE_ING' })
    let result = await unpack(_7zFilePath)
    if (result) {
        process.send({ state: 'INSTALL_CORE_DONE' })
    } else {
        process.send({ state: 'INSTALL_CORE_FAIL' })
    }
})

function clone(boardJsonCloud) {
    return new Promise(async (resolve, reject) => {
        // console.log(`git clone ${boardJsonCloud.core}...`);
        let path = '.\\temp\\' + boardJsonCloud.core
        path = path.replace(':', '-')
        await git.clone({
            fs: fs,
            http: http,
            dir: path,
            url: boardJsonCloud.core_setup[0].url,
            ref: boardJsonCloud.core.split('@')[1],
            singleBranch: true,
            onProgress: event => {
                if (event.total) {
                    console.log(event.loaded / event.total)
                } else {
                    console.log(event.loaded)
                }
            },
        })
        // console.log('git clone done');
        fs.rmdirSync(path + '\\.git', { recursive: true })
        let _7zFile = path + '\\' + fs.readdirSync(path)[0]
        resolve(_7zFile)
    })
}


function unpack(_7zFilePath) {
    return new Promise((resolve, reject) => {
        // windows
        // console.log(`unpack ${_7zFilePath} to ${os.homedir() + '\\AppData\\Local\\Arduino15\\packages'}`);
        _7z.unpack(_7zFilePath, os.homedir() + '\\AppData\\Local\\Arduino15\\packages', err => {
            if (err == null) {
                console.log('unpack done');
                resolve(true)
            } else {
                console.log('unpack error');
                resolve(false)
            }
        });
    })
}