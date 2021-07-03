const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .option('projects', {
        type: 'array',
        description: 'One or more projects',
        alias: 'p',
    })
    .help()
    .alias('help', 'h')
    .argv;

const fs = require('fs');
const { exec } = require('child_process');
const assert = require('assert');
const process = require('process');

const PATH = 'test_projects';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BLACK = '\x1b[30m';
const TIMEOUT = 3; // seconds

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

function getFiles(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isFile();
    });
}

function fileName(file) {
    return file.substring(0, file.lastIndexOf("."));
}

function cleanOutput(str) {
    str = str.match(/\b(\w+)\b/g);
    res = '';
    for (i of str) {
        res += i + '\n';
    }
    return res;
}

const runTest = async function(project, test, projectFile, testPath, inPath) {
    var command = 'node scratch.js ' 
        + projectFile
        + ' < ' + testPath + '/' + inPath;
    
    const execute = async function() {
        return new Promise(function(resolve, reject) {
            exec(command, 
                {
                    timeout: TIMEOUT * 1000
                },
                (error, stdout, stderr) => {
                    if (error) {
                        if (error.code === 1) {
                            reject('Compiled or Runtime Errors');
                        }
                        else if (error.signal === 'SIGTERM') {
                            reject(`Timeout (> ${TIMEOUT}s)`)
                        }
                        else {
                            reject(error);
                        }
                    }
                    resolve(stdout);
                }
            );
        }).catch(function(err) {
            console.log(RED, "  Failed when executing " + test + ": " + err);
            process.exit(1);
        });
    };

    var startTime = new Date();
    var res = await execute(); 
    var time = new Date() - startTime;
    
    return {
        'output': res,
        'time': time
    };
}

const readAns = async function(project, test, filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return data;
    }
    catch(err) {
        console.log(err)
    }
}

const listProjects = async function() {
    var projects = getDirectories(PATH);

    const chosenProjects = async function() {
        var res = [];
        for (p of argv.projects) {
            if (projects.includes(p)) {
                res.push(p);
            }
        }
        return res;
    };

    if (argv.projects) {
        projects = await chosenProjects();
    }

    return projects;
}

const runAll = async function() {
    var projects = await listProjects();
    console.log("Valid projects: " + projects);

    if (projects.length == 0) {
        console.log('Cannot find projects');
        process.exit(0);
    }

    for (project of projects) {
        console.log(BLACK, 'Testing ' + project);

        var projectFile = PATH + '/' + project + '/' + project + '.sb3';
        var testPath = PATH + '/' + project + '/tests';
        var tests = getFiles(testPath);

        for (test of tests) {
            if (!test.endsWith('inp')) continue;

            var inPath = test;
            var testName = fileName(test);
            var outPath = testPath + '/' + testName + '.out';

            // readAns(project, testName, outPath);
            var outData = await runTest(project, testName, projectFile, testPath, inPath);
            var ans = await readAns(project, testName, outPath);

            var out = cleanOutput(outData.output);
            ans = cleanOutput(ans);

            if (out == ans) {
                console.log(GREEN, "  Passed " + test + ` (${outData.time}ms)`);
            }
            else {
                console.log(RED, "  Failed " + test + ` (${outData.time}ms)` + "\n");
                console.log("Expected");
                console.log(ans);
                console.log("Received");
                console.log(out);
                process.exit(1);
            }
        }

        console.log(BLACK, '-------------------------------\n');
    }
}

runAll();