#!/usr/bin/node 

const process = require('process');
const readLine = require('readline');
const fileSystem = require('fs');
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


// Define the error log
process.stdout.write = process.stderr.write 


// Start VM
_vm.attachStorage(_storage);
_vm.start();
_vm.setTurboMode(true);

_vm.runtime.on('SAY', function(p1, p2, message) {
    process.stdout.write(message + '\n');
});

_vm.runtime.on('QUESTION', function(message) {
    if (message != null) {
        if (lines.length > 0) answer(lines.shift());
        else waiting = true;
    }
});


fileSystem.readFile(argv.file, function(err, data) {
    _vm.loadProject(data)
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

        process.exit(1);
    })
});
