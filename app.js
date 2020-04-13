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


app.use(bodyParser.urlencoded({extended: true}));


app.listen(3000, function(){
    console.log("Serwer działa...")
});

// Schemat tworzenia miejsc
var miejscaSchema= new mongoose.Schema({
    nazwa:String,
    image: String
})

var Miejsca=mongoose.model("Miejsca",miejscaSchema)


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
            res.render("miejsca", {miejsca:miejsca})
        }
    })
});

app.post("/miejsca", function(req,res){
    //zbierz dane z formularza i dodaj do tabeli
    var nazwa=req.body.nazwa;
    var image=req.body.image;
    var nowemiejsca={nazwa:nazwa, image:image}
    // stworz nowe miejsce i dodaj do tabeli
    Miejsca.create(nowemiejsca,function(err,nowe){
        if(err){
            console.log(err);
        } else {
            res.redirect("/miejsca")
        }
    })
});

app.get("/miejsca/new", function(req,res){
    res.render("new.ejs")
})