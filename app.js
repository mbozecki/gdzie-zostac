var express = require("express")
var app = express()
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local')


var Miejsca = require("./models/miejsca")
var Komentarze = require("./models/komentarze")
var User = require('./models/user')
require('dotenv').config();

const uri = process.env.ATLAS_URI;

//Podłączenie się do bazy danych przez mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Połączono z bazą danych!")
});

//----------------------------------KONFIGURACJA HASLA
app.use(require("express-session")({
    secret: "Jakikolwiek jest ten sekret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//------------------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public")) //do pliku css

app.listen(3000, function () {
    console.log("Serwer działa...")
});

app.set("view engine", "ejs")

app.use(function(req,res, next){ //to middleware bedzie obecne w kazdej stronie, i przekazuje dane uzytkownika
    res.locals.user=req.user;
    next();
})
app.get("/", function (req, res) {
    res.render("landing");
});

app.get("/miejsca", function (req, res) {

    //wez wszystkie miejsca z bazy danych
    Miejsca.find({}, function (err, miejsca) {
        if (err) {
            console.log(err);
        } else {
            res.render("miejsca/index", { miejsca: miejsca })
        }
    })
});

app.post("/miejsca", function (req, res) {
    //zbierz dane z formularza i dodaj do tabeli
    var nazwa = req.body.nazwa;
    var image = req.body.image;
    var krotkiopis = req.body.krotkiopis;
    var dlugiopis = req.body.dlugiopis;
    var cena = req.body.cena;
    var nowemiejsca = { nazwa: nazwa, image: image, krotkiopis: krotkiopis, dlugiopis: dlugiopis, cena: cena }
    // stworz nowe miejsce i dodaj do tabeli
    Miejsca.create(nowemiejsca, function (err, nowe) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("index")
        }
    })
});

app.get("/miejsca/new", function (req, res) {
    res.render("miejsca/new")
})

//znajdz miejsce przez ID, i dodaj tam komentarze
app.get("/miejsca/:id", function (req, res) { //populate zeby wypelnilo nie tylko ID komentarzy
    Miejsca.findById(req.params.id).populate("komentarze").exec(function (err, miejsceID) {
        if (err) {
            console.log(err)
        } else {
            res.render("miejsca/show", { miejsce: miejsceID })
        }
    })
})

//==================Komentarze

app.get("/miejsca/:id/komentarze/new",czyZalogowany, function (req, res) {
    Miejsca.findById(req.params.id, function (err, miejsca) {
        if (err) {
            console.log(err)
        } else {
            res.render("komentarze/new", { miejsca: miejsca })
        }
    })
})

app.post("/miejsca/:id/komentarze",czyZalogowany, function (req, res) {


    //znajdz miejsce by id, stowrz nowy komentarz i polacz go z miejscem. a potem przekieruj
    Miejsca.findById(req.params.id, function (err, miejsca) {
        if (err) {
            console.log(err);
            res.redirect("/miejsca")
        } else {

            Komentarze.create(req.body.komentarz, function (err, komentarz) {
                if (err) {
                    console.log(err)
                } else {
                    miejsca.komentarze.push(komentarz);
                    miejsca.save();
                    console.log("udało niby się!")
                    res.redirect("/miejsca/" + miejsca._id);
                }
            })
        }
    })
})

//AUTORYZACJA

app.get("/register", function (req, res) {
    res.render("register");
})

app.post("/register", function (req, res) {
    var nowyuser = new User({ username: req.body.username })
    User.register(nowyuser, req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            return res.render("register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/miejsca")

            })
        }
    })
})

//pokaz formularz logujacy
app.get("/login", function(req,res){
    res.render("login")
})

//--------------------tu middleware-----------
app.post("/login",passport.authenticate("local",
    {
        successRedirect: "/miejsca", //jezeli uda sie zalogowac
        failureRedirect: "/login",  //jezeli sie nie uda
    }),  function(req,res){ 
}); 

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/miejsca")
})

function czyZalogowany(req,res,next){ //middleware, jeżeli użytkownik zalogowany-> normalnie wykonuje akcje, jeżeli nie to przekierowuje na /login
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}