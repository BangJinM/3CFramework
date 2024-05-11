var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var manifest = {
    packageUrl: 'http://localhost/3CFramework/remote-assets/',
    remoteManifestUrl: 'http://localhost/3CFramework/remote-assets/project.manifest',
    remoteVersionUrl: 'http://localhost/3CFramework/remote-assets/version.manifest',
    version: '1.0.0',
    assets: {},
    searchPaths: []
};

var dest = './';
var src = './';
var output = './';

// Parse arguments
var i = 2;
while (i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
        case '--url':
        case '-u':
            var url = process.argv[i + 1];
            manifest.packageUrl = url;
            manifest.remoteManifestUrl = url + 'project.manifest';
            manifest.remoteVersionUrl = url + 'version.manifest';
            i += 2;
            break;
        case '--version':
        case '-v':
            manifest.version = process.argv[i + 1];
            i += 2;
            break;
        case '--src':
        case '-s':
            src = process.argv[i + 1];
            i += 2;
            break;
        case '--dest':
        case '-d':
            dest = process.argv[i + 1];
            i += 2;
            break;
        case '--output':
        case '-o':
            output = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}

function readDir(dir, obj) {
    try {
        var stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            return;
        }
        var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
        for (var i = 0; i < subpaths.length; ++i) {
            if (subpaths[i][0] === '.') {
                continue;
            }
            subpath = path.join(dir, subpaths[i]);
            stat = fs.statSync(subpath);
            if (stat.isDirectory()) {
                readDir(subpath, obj);
            }
            else if (stat.isFile()) {
                // Size in Bytes
                size = stat['size'];
                md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
                compressed = path.extname(subpath).toLowerCase() === '.zip';

                relative = path.relative(src, subpath);
                relative = relative.replace(/\\/g, '/');
                relative = encodeURI(relative);
                obj[relative] = {
                    'size': size,
                    'md5': md5
                };
                if (compressed) {
                    obj[relative].compressed = true;
                }
            }
        }
    } catch (err) {
        console.error(err)
    }
}

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path, { recursive: true });
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

// Iterate assets and src folder
readDir(path.join(src, 'src'), manifest.assets);
readDir(path.join(src, 'assets'), manifest.assets);
readDir(path.join(src, 'jsb-adapter'), manifest.assets);

mkdirSync(dest);
if (output)
    mkdirSync(output);

var pDestManifest = path.join(dest, 'project.manifest');
var pDestVersion = path.join(dest, 'version.manifest');

var oDestManifest = path.join(output, 'project.manifest');
var oDestVersion = path.join(output, 'version.manifest');

fs.writeFile(pDestManifest, JSON.stringify(manifest), () => { });
if (output) fs.writeFile(oDestManifest, JSON.stringify(manifest), () => { });
delete manifest.assets;
delete manifest.searchPaths;
fs.writeFile(pDestVersion, JSON.stringify(manifest), () => { });
if (output) fs.writeFile(oDestVersion, JSON.stringify(manifest), () => { });

async function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    fs.mkdirSync(dest, { recursive: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.writeFileSync(destPath, fs.readFileSync(srcPath), () => { });
        }
    }
}

if (output) copyDir(src, output)