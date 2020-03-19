// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.$ = window.jQuery = require('jquery');
const { dialog } = require('electron').remote;
const path = require('path');
const fs = require('fs');
const process = require('child_process');
const isImage = require('is-image');

var directory = localStorage.getItem('directory') ? localStorage.getItem('directory') : undefined;
var switchTime = parseInt(localStorage.getItem('switchTime')) ? localStorage.getItem('switchTime') : undefined;
var scriptProcess;
var watcher; 

if (directory == undefined || switchTime == undefined) {
    $('#start').attr('disabled', true);
}

if (switchTime != undefined) {
    $('#quantity').val(switchTime);
}

if (directory == undefined) {
    $('#directoryLabel').html('Directory: Not Selected');
} else {
    $('#directoryLabel').html($('#directoryLabel').html() + directory);
    readFiles(directory);
    watchFolder();
}

$('#quantity').change(function () {
    console.log('Switch Time Changed ' + $('#quantity').val());
    switchTime = $('#quantity').val();
    localStorage.setItem('switchTime', $('#quantity').val());
    if (directory != undefined) {
        $('#start').attr('disabled', false);
    }
});

$('#directory').click(function () {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);

        if (!result.canceled) {
            directory = result.filePaths[0];
            localStorage.setItem('directory', directory);
            $('#directoryLabel').html('Directory: ' + directory);

            readFiles(directory);

            if (switchTime != undefined) {
                $('#start').attr('disabled', false);
            }
        }
    }).catch(err => {
        console.log(err);
    });
});

$('#start').on('click', runScript);
$('#stop').on('click', function () {
    if (scriptProcess != undefined) {
        scriptProcess.kill();
    }
});

function readFiles(directory) {
    fs.readdir(directory, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        $('#pictureList').empty();
        files.forEach(function (file) {
            console.log(file);
            var fullFilePath = path.join(directory, file);
            if (isImage(fullFilePath)) {
                $('#pictureList').append('<div class="gallery">' +
                '<a target="_blank" href="' + fullFilePath + '">' +
                '<img src="' + fullFilePath + '" alt="' + file + '" width="600" height="400"' +
                '</a></div>');
            }
        });
    });
}

function runScript() {
    if (scriptProcess != undefined) {
        scriptProcess.kill();
        console.log("Previous Process killed");
    }
    scriptProcess = process.exec('./test.sh ' + directory + ' ' + switchTime, function (err, stdout, stderr) {
        if (err) {
            console.log("\n" + stderr);
        } else {
            console.log(stdout);
        }
    });
}

function watchFolder() {
    if (watcher != undefined) {
        watcher.close();
    }
    watcher = fs.watch(directory, (eventType, filename) => {
        console.log(eventType);
        console.log(filename);
        readFiles(directory);
        runScript();
    })
}