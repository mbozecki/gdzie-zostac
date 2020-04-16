var express=require("express")
var app=express()
var bodyParser= require("body-parser");
var mongoose = require('mongoose');

require('dotenv').config();

const uri = process.env.ATLAS_URI;
//Podłączenie się do bazy danych przez mongoose
mongoose.connect(uri, {useNewUrlParser: true,  useUnifiedTopology: true }  );
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Połączono z bazą danych!")
});

var Miejsca=require("./models/miejsca")
var Komentarze=require("./models/komentarze")
var User=require("./models/user")

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public")) //do pliku css

app.listen(3000, function(){
    console.log("Serwer działa...")
});


app.set("view engine","ejs")

app.get("/", function(req,res){
    res.render("landing");
});

app.get("/miejsca",function(req,res){
    //wez wszystkie miejsca z bazy danych
    Miejsca.find({}, function(err,miejsca){ 
        if(err){
            console.log(err);
        } else {
            res.render("miejsca/index", {miejsca:miejsca})
        }
    })
});

app.post("/miejsca", function(req,res){
    //zbierz dane z formularza i dodaj do tabeli
    var nazwa=req.body.nazwa;
    var image=req.body.image;
    var krotkiopis=req.body.krotkiopis;
    var dlugiopis=req.body.dlugiopis;
    var cena=req.body.cena;
    var nowemiejsca={nazwa:nazwa, image:image,krotkiopis:krotkiopis, dlugiopis:dlugiopis, cena:cena }
    // stworz nowe miejsce i dodaj do tabeli
    Miejsca.create(nowemiejsca,function(err,nowe){
        if(err){
            console.log(err);
        } else {
            res.redirect("index")
        }
    })
});

app.get("/miejsca/new", function(req,res){
    res.render("miejsca/new")
})


//znajdz miejsce przez ID, i dodaj tam komentarze
app.get("/miejsca/:id", function(req,res){ //populate zeby wypelnilo nie tylko ID komentarzy
    Miejsca.findById(req.params.id).populate("komentarze").exec(function(err, miejsceID){
        if (err){
            console.log(err)
        } else {
            res.render("miejsca/show", {miejsce: miejsceID})
        }
    })
})

//==================Komentarze

app.get("/miejsca/:id/komentarze/new", function(req,res){
    Miejsca.findById(req.params.id, function(err, miejsca){
        if(err){
            console.log(err)
        } else {
            res.render("komentarze/new", {miejsca:miejsca})
        }
    })
})

app.post("/miejsca/:id/komentarze", function(req,res){
    

    //znajdz miejsce by id, stowrz nowy komentarz i polacz go z miejscem. a potem przekieruj
    Miejsca.findById(req.params.id, function(err, miejsca){
        if(err){
            console.log(err);
            res.redirect("/miejsca")
        } else {
           
            Komentarze.create(req.body.komentarz, function(err, komentarz){
                if(err){
                    console.log(err)
                } else {
                    miejsca.komentarze.push(komentarz);
                    miejsca.save();
                    console.log("udało niby się!")
                    res.redirect("/miejsca/"+miejsca._id);
                }
            })
        }
    })
})