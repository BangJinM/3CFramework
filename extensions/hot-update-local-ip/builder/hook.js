
'use strict';

const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec } = require('child_process');

const remote_port = 8090;

function getIPAdress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

let tempConfig = '{\n"localDebug": true,\n"version": "1.0.0.10",\n"port": 8090,\n"relative": "3CFramework/remote-assets",\n"packageUrl": "http://localhost", \n"output": "D:/Desktop/chfs/share"\n}'

exports.onBeforeBuild = function (options, result) {
    var dir = path.join(Editor.Project.path, "assets/hot_update");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'Config.json'), tempConfig, function () { })
    }
}

exports.onAfterBuild = function (options, result) {
    let resdir = 'assets';

    if (fs.existsSync(path.join(result.dest, 'data'))) {
        resdir = 'data';
    }

    fs.readFile(path.join(Editor.Project.path, "assets/hot_update", 'Config.json'), "utf8", function (err, data) {
        if (err) {
            throw err;
        }
        let jsonData = JSON.parse(data)
        console.warn(jsonData);

        let cmd = "node version_generator.js"

        if (jsonData.version && jsonData.version.length > 0) {
            cmd += ` -v ${jsonData.version}`
        }

        if (jsonData.localDebug) {
            cmd += ` -u http://${getIPAdress()}:${jsonData.port}/${jsonData.relative}/`
        }
        else {
            cmd += ` -u ${jsonData.packageUrl}:${jsonData.port}/${jsonData.relative}/`
        }

        cmd += ` -s ${path.join(result.dest, resdir)}`
        cmd += ` -d ${path.join(Editor.Project.path, "assets")}`

        if (!jsonData.output) jsonData.output = "./build/output"
        cmd += ` -o ${path.join(jsonData.output, jsonData.relative)}`
        console.error(cmd);

        exec(cmd, { cwd: Editor.Project.path }, (err, stdout, stderr) => {
            if (!err) return;
            console.error(err);
        });
    });
}
