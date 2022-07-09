const path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')

const dir = path.join(process.cwd(), 'test-clone')

console.log('git.js!!!');
git.clone({ fs, http, dir, url: 'https://github.com/isomorphic-git/lightning-fs' }).then(console.log)