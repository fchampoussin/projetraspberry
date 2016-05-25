var express = require("express");
var fs = require("fs");
var rom = require("./rom.js");
var isPyAlive = require("./isPyAlive.js");
var mongoose = require('mongoose');
var pug = require('pug');
var wagner = require('wagner-core');
var request;
request = require('request');
var multer = require('multer');
var app = express();
require('./models')(wagner);
app.use('/api/v1', require('./api')(wagner));
app.use(require('morgan')());
app.set('views', 'D:/PROJET_WEB/views');
app.set('view engine', 'pug');
var directory = "";
var dest = "./public/uploads" + directory;
var uploadDir =  "./public/uploads";
dl = require('delivery');
var io = require('socket.io').listen(5000);
var dl = require('delivery');
var fs = require('fs');
var delivery;
io.sockets.on('connection', function(socket) {
    console.log('server: a new client connected');
    delivery = dl.listen(socket);
    delivery.on('delivery.connect', function(delivery) {

        delivery.on('send.success', function(file) {
            console.log('File sent successfully!');
        });
    });
});


var storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;

        var stat = filesystem.statSync(file);
        var filename = file.replace(/^.*[\\\/]/, '');
        //console.log(filename);
        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else if(filename=="gamelist.xml"){
           // console.log(file)
            results.push(file);
        }


    });

    return results;

};

var upload = multer({ storage: storage });

app.use(express.static('./public'));

app.post('/api/file', upload.array('file'), function (req, res) {

    console.log("received " + req.files.length + " files");// form files
    for (var i=0; i < req.files.length; i++) {
        console.log("### " + req.files[i].path);
        var newName = req.files[i].path.substr(req.files[i].path.lastIndexOf('/')+1);
        var extension = newName.split(".")[1];
        var dest = redirect(extension);
        fsextra.copy(req.files[i].path, uploadDir+dest+"/"+newName, { replace : true }, function (err) {
            if (err) {
                throw err;
            }
        });
    }

    res.status(204).end();

});

// -------------------------------------------------------------------



//--------------------------------------------



app.get('/gamelist', function (req, res) {
    var a = _getAllFilesFromFolder("D:/PROJET_WEB/xml");
    var caracole;
    for (index = 0; index < a.length; ++index) {
        caracole = a[index];
        console.log("Je vais envoyer a mon poto le serveur pc :" +a[index]);

       // post_to_url('http://localhost:3000/api/file', {file: a[index]});
    }
    delivery.send({
        name: caracole,
        path: caracole.toString()
    });
});

app.listen(3100, function () {

    console.log("Je suis le serveur du py, et je suis vivant !");
    console.log("Open http://localhost:3100/gamelist and upload some files!")

});

function redirect(extension) {
    console.log("Extension 2" + extension);
    switch(extension){
        case "nes":
            directory="/nes";
            break;
        case "sfc":
            directory="/supernintendo";
            break;
        case "gbc":
            directory="/gbc";
            break;
        case "gb":
            directory="/gb";
            break;
        case "n64":
            directory="/n64";
            break;
        case "a26":
            directory="/atari2600";
            break;
        case "ngp":
            directory="/neogeopocket";
            break;
        case "agb":
            directory="/gameboyadvance";
            break;
        case "500":
            directory="/famicomdisksystem";
            break;
        case "lnx":
            directory="/lynx";
            break;
        default:
            directoy="/other";
            break;
    }
    dest=dest+directory;
    return directory;
}
