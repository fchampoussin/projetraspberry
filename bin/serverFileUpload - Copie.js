var express = require("express");
var fs = require("fs");
var rom = require("./rom.js");
var isPyAlive = require("./isPyAlive.js");
var mongoose = require('mongoose');
var pug = require('pug');


var multer = require('multer');
var wagner = require('wagner-core');
var app = express();


require('./models')(wagner);

app.use('/api/v1', require('./api')(wagner));


app.use(require('morgan')());

app.set('view engine', 'pug');
var directory = "";
var dest = "./public/uploads" + directory;
var name = "";
var extension = "";
var uploadDir =  "./public/uploads";

var modelRom;

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

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

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

app.get('/', function (req, res) {

    res.sendFile("D:\PROJET_WEB\views\index.pug");

});


// -------------------------------------------------------------------
var content;
var fin;
var foo;
function processFile(res) {
    // console.log(content);

    var parseString = require('xml2js').parseString;
    var xml = content;

    parseString(xml, function (err, result) {
        fin = JSON.stringify(result);
        foo = result;
    });
    mongoose.connect('mongodb://localhost/projetAnne');
    var roro = require("./rom");
    modelRom = new roro(mongoose);
    var sovie;
    for (var i = 0; i < foo.gameList.game.length; i++) {
        var pa = foo.gameList.game[i].path;
        var name = foo.gameList.game[i].name;
        var desc = foo.gameList.game[i].desc;
        var img = foo.gameList.game[i].image;
        var date = foo.gameList.game[i].releasedate;
        var dev = foo.gameList.game[i].developper;
        var pub = foo.gameList.game[i].publisher;
        var genre = foo.gameList.game[i].genre;
        var rating = foo.gameList.game[i].rating;
        var play= foo.gameList.game[i].player;
        var con = foo.gameList.game[i].console;
        sovie =new modelRom({path : pa,name : name,desc :desc,image :img,releasedate :date,developper : dev,publisher : pub,genre : genre,rating :rating,
            player: play,console :con});

        sovie.save(function (err, sovie) {
            if (err) return console.error(err);
            console.log(sovie.id);
            sovie.speak();
        });
    }
   //// var jojo =new modelRom({ name: 'Silence' });
    //jojo.speak();
}




//--------------------------------------------


app.get('/liste', function (req, res) {
    var a = _getAllFilesFromFolder("C:/Users/Foxlight/Downloads/exampleFileUpload/exampleFileUpload/xml");
    for (index = 0; index < a.length; ++index) {
        console.log(a[index]);
    }
    fs.readFile("C:/Users/Foxlight/Downloads/exampleFileUpload/exampleFileUpload/xml/gamelist.xml","utf-8", function read(err, data) {
        if (err) {
            throw err;
        }
        content = data;
        processFile(res);          // Or put the next step in a function and invoke it
        res.render('index', { title: 'Hey', message: "cassoulet"});
    });



});

app.get('/py', function (req, res) {
    isPyAlive;
    res.render('index', { a: 'Hey', b: "chocobo"});

    setTimeout();


});

setTimeout(function() {
    console.log('hello world!');

}, 5000);

app.get('/uploads', function (req, res) {
    fs.readdir("./public/uploads", function(err, list) {
        res.end(JSON.stringify(list));
    });

});
app.listen(3000, function () {

    console.log("Server is listening on port 3000");
    console.log("Open http://localhost:3000 and upload some files!")

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
