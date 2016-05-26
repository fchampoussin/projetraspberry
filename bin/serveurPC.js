var express = require("express");
var fs = require("fs");
var mongoose = require('mongoose');
var multer = require('multer');
var wagner = require('wagner-core');
var app = express();
var uploadDir = "./public/uploads";
var modelRom;
var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var cheminFichier;
var upload = multer({storage: storage});
var content;
var fin;
mongoose.connect('mongodb://localhost/projetAnne');
var XMLHttpRequest = require('xhr2');
var foo;
var PORT = process.env.PORT,
    addrIP = process.env.IP,
    RASPBERRY_RETROPIE_URL = 'http://mainline.i3s.unice.fr/roms';
var Q = require('q');
var path = require('path');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
//app.set('stylesheets', 'D:/PROJET_WEB/public/stylesheets');
app.set('view options', { locals: { scripts: ['jquery.js'] } });  // You can declare the scripts that you will need to render in EVERY page
//app.locals.basedir = path.join(__dirname, 'views');

//app.use(express.static(path.join(__dirname, '../public')));
var io = require('socket.io-client');
var dl = require('delivery');
var socket = io.connect('http://localhost:5000');
/*
socket.on('connect', function() {
    console.log('client: connected to server');
    var delivery = dl.listen(socket);
    delivery.connect();
    delivery.on('receive.success', function(file) {
       console.log(file)
    });
});
*/


app.listen(3000, function () {

    console.log("Je suis le serveur du PC, love me please ! <3");
    console.log("Open http://localhost:3000/" +
        " and upload some files!")

});
var model = require('./models')(wagner);
modelRom=model.Rom;
app.use(require('morgan')());
app.use(express.static('./public'));
app.use('/api/v1', require('./api')(wagner));
var storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var _getAllFilesFromFolder = function (dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function (file) {

        file = dir + '/' + file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};


app.post('/api/file', upload.array('file'), function (req, res) {

    console.log("received " + req.files.length + " files");// form files
    for (var i = 0; i < req.files.length; i++) {
        console.log("### " + req.files[i].path);
        var newName = req.files[i].path.substr(req.files[i].path.lastIndexOf('/') + 1);
        var extension = newName.split(".")[1];
        var dest = redirect(extension);
        fsextra.copy(req.files[i].path, uploadDir + dest + "/" + newName, {replace: true}, function (err) {
            if (err) {
                throw err;
            }
        });
    }

    res.status(204).end();

});

app.get('/', function (req, res) {
    res.render("index");
    //res.sendFile(path.join(__dirname, '../public', 'index.html'));

});



function loadGamelist(url) {
    return Q.Promise(function(resolve, reject, notify) {
        var request = new XMLHttpRequest();
        console.log("loadGamelist on");
        request.open("GET", url, true);
        request.onload = onload;
        request.onerror = onerror;
        request.onprogress = onprogress;
        request.send();

        function onload() {
            if (request.status === 200)
            {
                console.log("Fin de loadGamelist");
                resolve(request.responseText);
            }
            else
            {
                reject(new Error("Status code was " + request.status));
            }
        }

        function onerror() {
            reject(new Error("Can't XHR " + JSON.stringify(url)));
        }

        function onprogress(event) {
            notify(event.loaded / event.total);
        }
    });
}
// -------------------------------------------------------------------
function saveThePrivateKitty(chats){
    for (var k = 0; k < chats.length; k++) {
        chats[k].save(function (err, sovie) {
            if (err) return console.error(err);
            //console.log(sovie.id);
            sovie.speak();
        });
    }
}
function saveProcessedFileToMongo(chemin,cons,pa,name,desc,date,dev,pub,genre,rating,play,callbackChaton) {

    console.log(chemin.length);
    var listeChatonMignion = [];
    for (var k = 0; k < chemin.length; k++) {
        sovie = new modelRom({
            path: pa[k],
            name: name[k],
            desc: desc[k],
            image: chemin[k],
            releasedate: date[k],
            developper: dev[k],
            publisher: pub[k],
            genre: genre[k],
            rating: rating[k],
            player: play[k],
            console: cons[k]
        });
        listeChatonMignion.push(sovie);


    }
    callbackChaton(listeChatonMignion);
}
function processRelativeImg(chemin,cons,pa,name,desc,date,dev,pub,genre,rating,play,callbackSVG) {
    var tableImg = [];
    console.log(chemin.length);
    for (var k = 0; k < chemin.length; k++) {
        var nomIm = chemin[k].toString().substr(chemin[k].toString().lastIndexOf('\\') + 1);
        tableImg.push(path.join("/image?image=images/", cons[k], "/" + nomIm));
        console.log(path.join("/image?image=images/", cons[k], "/" + nomIm));
       // saveProcessedFileToMongo(tableImg,cons,pa,name,desc,date,dev,pub,genre,rating,play);
    }
    //saveProcessedFileToMongo(tableImg,cons,pa,name,desc,date,dev,pub,genre,rating,play);
    callbackSVG(tableImg,cons,pa,name,desc,date,dev,pub,genre,rating,play,saveThePrivateKitty);
}
function processFile(res,parent,callbackIMG) {

    var parseString = require('xml2js').parseString;
    var xml = content;

    parseString(xml, function (err, result) {
        fin = JSON.stringify(result);
        foo = result;
    });
    var sovie;
    var tablePa = [];
    var tableName = [];
    var tableDesc = [];
    var tableDate = [];
    var tableDev = [];
    var tablePub = [];
    var tableGenre = [];
    var tableRating = [];
    var tablePlay = [];
    var tableCon = [];
    var tableImgTemp = [];

    for (var i = 0; i < foo.gameList.game.length; i++) {

        tableImgTemp.push(path.join(cheminFichier, foo.gameList.game[i].image.toString()));

        var pa = foo.gameList.game[i].path;
        tablePa.push(pa);
        var name = foo.gameList.game[i].name;
        tableName.push(name);
        var desc = foo.gameList.game[i].desc;
        tableDesc.push(desc);
        var date = foo.gameList.game[i].releasedate;
        tableDate.push(date);
        var dev = foo.gameList.game[i].developper;
        tableDev.push(dev);
        var pub = foo.gameList.game[i].publisher;
        tablePub.push(pub);
        var genre = foo.gameList.game[i].genre;
        tableGenre.push(genre);
        var rating = foo.gameList.game[i].rating;
        tableRating.push(rating);
        var play = foo.gameList.game[i].player;
        tablePlay.push(play);
        var con = parent;//foo.gameList.game[i].console;
        tableCon.push(con);

        //tablImg.push(processRelativeImg(pathImg.toString(), con));
        //var img = processRelativeImg(pathImg.toString(),con);

    }
    callbackIMG(tableImgTemp,tableCon,tablePa,tableName,tableDesc,tableDate,tableDev,tablePub
        ,tableGenre,tableRating,tablePlay,saveProcessedFileToMongo);
    //processRelativeImg(tableImgTemp,tableCon);
}

//--------------------------------------------
app.get('/bin/script.js', function (req, res) {

        res.sendFile(path.join(__dirname + "/script.js"));
});
app.get('/bin/listerJeu.js', function (req, res) {

    res.sendFile(path.join(__dirname + "/listerJeu.js"));
});
app.get('/views/css_jeu_style.css', function (req, res) {

    res.sendFile(path.join(__dirname + "/../views/css_jeu_style.css"));
});
app.get('/bin/jquery.easyPaginate.js', function (req, res) {

    res.sendFile(path.join(__dirname + "jquery.easyPaginate.js"));
});
app.get('/gamelist/:id', function (req, res) {
    var consoleName = req.params.id;

    var url = RASPBERRY_RETROPIE_URL + '/' + consoleName + '/gamelist.xml';
    console.log('URL = ' + url);
    loadGamelist(url)
        .then(function(data) {
            var json;
            var parser =  require('xml2js').parseString;
            parser(data, function (err, result) {
                json = JSON.stringify(result);

            });
            console.log(json)
            res.end(json);
        }).fail(function(err) {
        res.end("Error console not found" +err);
    });
});
app.get('/runscraper/:id', function (req, res) {
    // on lance le scraper sur le serveur
    var ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', function(data) {
        res.end("stdout: " + data);
    });
});
app.get("/jean",function (req,res) {
res.render("selecteurFichier");
});
app.get('/liste', function (req, res) {



    cheminFichier = req.query.chemin;
    nconf.set('cheminFichier', cheminFichier);
    nconf.save(function (err) {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Configuration saved successfully.');
    });
    var a = _getAllFilesFromFolder(cheminFichier);//"C:/Users/Foxlight/Downloads/Roms"
    var parent = [];
    var listeData=[];
    for (index = 0; index < a.length; ++index) {
        //console.log(a[index]);
        //console.log(a[index].toString().substr(a[index].toString().lastIndexOf('/')+1));
        var strToTest = a[index].toString().substr(a[index].toString().lastIndexOf('/')+1);
        var strValid = "gamelist.xml";
        if(strToTest.match(strValid)){
            console.log("------------------------------ VALIDATION")

            var parts = a[index].toString().split('/');
           // console.log(parts)
            var filename = parts.pop();
             parent.push(parts.pop());

            fs.readFile(a[index], "utf-8", function read(err, data) {
                if (err) {
                    throw err;
                }
                content = data;
                processFile(data,parent[0],processRelativeImg);
                parent.splice(0, 1);
                //processFile(data,parent.pop(),processRelativeImg);          // Or put the next step in a function and invoke it
                //res.render('index', {title: 'Hey', message: "cassoulet"});
            });
        }
    }

});

app.get('/image', function(req, res) {
    var nomImage = req.query.image;
    cheminFichier = nconf.get('cheminFichier');
    var chemin = path.join(cheminFichier.toString(), nomImage.toString());
    console.log(chemin);
    var img = fs.readFileSync(chemin);
    res.writeHead(200, {'Content-Type': 'image/gif' });
    res.end(img, 'binary');


});


app.get('/py', function (req, res) {
    isPyAlive;
    res.render('index', {a: 'Hey', b: "chocobo"});

    setTimeout();


});
app.get('/uploads', function (req, res) {
    fs.readdir("./public/uploads", function (err, list) {
        res.end(JSON.stringify(list));
    });

});
setTimeout(function () {
    console.log('hello world!');

}, 5000);


