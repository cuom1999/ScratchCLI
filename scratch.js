#!/usr/bin/node 

const process = require('process');
const readLine = require('readline');
const fileSystem = require('fs');
const fetch = require('node-fetch');
const scratchVM = require('scratch-vm');
const scratchStorage = require('scratch-storage');

const argv = require('yargs')
    .usage('Usage: $0 <file> [options]')
    .command('$0 <file>', 'Compile Scratch file')
    .option('logger', {
        description: 'Path to error log',
        alias: 'l',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

const _vm = new scratchVM();
const _storage = new scratchStorage();
const _rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var lines = [];
var waiting = false;
var out = process.stdout.write;


// Create logger
if (argv.logger) {
    var err = fileSystem.createWriteStream(argv.logger)
    process.stdout.write = process.stderr.write = err.write.bind(err);
}
else {
    process.stdout.write = process.stderr.write = null;
}


// Helper functions
_rl.on('line', (text) => {
    lines.push(text);
    if (waiting) {
        answer(lines.shift());
        waiting = false;
    }
});

function answer(text) {
    _vm.runtime.emit('ANSWER', text);
}

function hideAllSprites() {
    for (const target of _vm.runtime.targets) {
        if (!target.isStage && target.sprite) target.setVisible(false);
    }
}

function getProjectUrl(asset) {
    return ['https://projects.scratch.mit.edu/', asset.assetId].join('');
}

function getAssetUrl(asset) {
    const ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/';
    const assetUrlParts = [
        ASSET_SERVER,
        'internalapi/asset/',
        asset.assetId,
        '.',
        asset.dataFormat,
        '/get/'
    ];
    return assetUrlParts.join('');
};

function startVM() {
    global.fetch = fetch;
    _vm.setTurboMode(true);
    _storage.addWebStore([_storage.AssetType.Project], getProjectUrl);
    _storage.addWebSource([_storage.AssetType.ImageVector, _storage.AssetType.ImageBitmap, _storage.AssetType.Sound], getAssetUrl);
    _vm.attachStorage(_storage);
    _vm.start();
    _vm.runtime.on('SAY', function(p1, p2, message) {
        process.stdout.write(message + '\n');
    });

    _vm.runtime.on('QUESTION', function(message) {
        if (message != null) {
            if (lines.length > 0) answer(lines.shift());
            else waiting = true;
        }
    });
}

function loadVMProject(source) {
    _vm.loadProject(source)
    .then(input => {
        hideAllSprites();
        process.stdout.write = out;
        _vm.greenFlag();

        _vm.runtime.on('PROJECT_RUN_STOP', function() {
            process.exit();
        });
    })
    .catch(err => {
        process.stdout.write = out;
        process.stdout.write('Compiled Errors\n');
        process.stdout.write(err);
        process.exit(1);
    })
}

// Define the error log
process.stdout.write = process.stderr.write 

startVM();

const urlRegex = new RegExp('scratch.mit.edu\/projects\/([0-9]+)');

if (argv.file.toString().endsWith('sb') 
    || argv.file.toString().endsWith('sb2') 
    || argv.file.toString().endsWith('sb3')) {
    fileSystem.readFile(argv.file, function(err, data) {
        loadVMProject(data);
    });
}
else {
    var matchRegex = urlRegex.exec(argv.file);
    if (matchRegex) {
        var projectID = matchRegex[1];
         _storage.load(_storage.AssetType.Project, projectID)
        .then(projectAsset => {
            loadVMProject(projectAsset.data);
        })
        .catch(error => {
            process.stdout.write = out;
            process.stdout.write('Failed to fetch file\n');

            process.exit(1);
        });
    }
    else {
        process.stdout.write = out;
        process.stdout.write('Invalid input. Must be a sb/sb2/sb3 file or an MIT url.\n');
        process.exit(1);
    }
}
