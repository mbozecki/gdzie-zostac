var express = require("express")
app = express()
bodyParser = require("body-parser");
mongoose = require('mongoose');
passport = require('passport');
LocalStrategy = require('passport-local')
request = require("request")
methodOverride = require("method-override")
Miejsca = require("./models/miejsca")
Komentarze = require("./models/komentarze")
User = require('./models/user')

require('dotenv').config();

const uri = process.env.ATLAS_URI;

//Podłączenie się do bazy danych przez mongoose
mongoose.connect(uri, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
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
app.use(methodOverride("_method"));


if (process.env.PORT==undefined){
    port = 3000;
}
else{
    port=process.env.PORT //heroku użyje tej opcji   
}


app.listen(port, () => {
    console.log(`Serwer działa na porcie: ${port}`);
});
app.set("view engine", "ejs")

app.use(function (req, res, next) { //to middleware bedzie obecne w kazdej stronie, i przekazuje dane uzytkownika
    res.locals.user = req.user;
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

// edytuj miejsce
app.get("/miejsca/:id/edit", function (req, res) {
    Miejsca.findById(req.params.id, function (err, miejsca) {
        if (err) {
            console.log(err)
        } else {
            res.render("miejsca/edit", { miejsca: miejsca })
        }
    })
})

app.put("/miejsca/:id", function (req, res) {
    //znajdz i zaktualizuj miejsce, i 
    var lokacja = encodeURIComponent(req.body.lokacja);
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + lokacja + "&key=" + process.env.GOOGLEKEY; //używam google maps geocoding api
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var googlelokacja = JSON.parse(body)
            try{
                googlelokacja = (googlelokacja["results"][0]["geometry"]["location"])// Do odczytania koordynatów danego miejsca
                console.log(googlelokacja)
            }
            catch(err){
                console.log("BŁĄD Z GMAPS!: "+err)
                googlelokacja={
                    lat:0,
                    lng:0
                }

            }     
            var nowemiejsca = { nazwa: req.body.nazwa, image: req.body.image, krotkiopis: req.body.krotkiopis, dlugiopis: req.body.dlugiopis, cena: req.body.cena, googlelokacja: googlelokacja, imie: req.body.imie, numer: req.body.numer }
            Miejsca.findByIdAndUpdate(req.params.id, nowemiejsca, function (err, nowemiejsce) {
                if (err) {
                    res.redirect("/miejsca")
                } else {
                    res.redirect("/miejsca/" + req.params.id)
                }
            })
        }
    })
});
//Usun miejsce
app.delete("/miejsca/:id",czyZalogowany, function(req,res){
    Miejsca.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.send("Błąd"+err)
        } else {
            res.redirect("/miejsca")
        }
    })
})

app.post("/miejsca", function (req, res) {
    //zbierz dane z formularza i dodaj do tabeli
    var nazwa = req.body.nazwa;
    var image = req.body.image;
    if (!CzyToImageURL(image)){
        image="https://images.unsplash.com/photo-1532066643731-52af2cdc0270?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    }
    var krotkiopis = req.body.krotkiopis;
    var dlugiopis = req.body.dlugiopis;
    var lokacja = encodeURIComponent(req.body.lokacja); // zamienia np spacje na +, aby mozna bylo stworzyc z tego adres
    var cena = req.body.cena;
    var imie = req.body.imie;
    var numer = req.body.numer;
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + lokacja + "&key=" + process.env.GOOGLEKEY; //używam google maps geocoding api
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var googlelokacja = JSON.parse(body)
            try{
                googlelokacja = (googlelokacja["results"][0]["geometry"]["location"])
                console.log(googlelokacja)
            }
            catch(err){
                console.log("BŁĄD Z GMAPS!: "+err)
                googlelokacja={
                    lat:0,
                    lng:0
                }

            }
             // Do odczytania koordynatów danego miejsca
            var nowemiejsca = { nazwa: nazwa, image: image, krotkiopis: krotkiopis, dlugiopis: dlugiopis, cena: cena, googlelokacja: googlelokacja, imie: imie, numer: numer }
            // stworz nowe miejsce i dodaj do tabeli
            Miejsca.create(nowemiejsca, function (err, nowe) { //tworzy nowe miejsce w bazie dancyh
                if (err) {
                    console.log(err);
                    res.send("Niepoprawne wartości. Spróbuj jeszcze raz...")
                } else {
                    res.redirect("../miejsca")
                }
            })
        }
        else {
            console.log(error)
            res.send("Niepoprawne wartości. Spróbuj jeszcze raz...")
        }
    })
});




app.get("/miejsca/new", czyZalogowany, function (req, res) {
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

app.get("/miejsca/:id/komentarze/new", czyZalogowany, function (req, res) {
    Miejsca.findById(req.params.id, function (err, miejsca) {
        if (err) {
            console.log(err)
        } else {
            res.render("komentarze/new", { miejsca: miejsca })
        }
    })
})

app.post("/miejsca/:id/komentarze", czyZalogowany, function (req, res) {
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
app.get("/login", function (req, res) {
    res.render("login")
})

//--------------------tu middleware-----------
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/miejsca", //jezeli uda sie zalogowac
        failureRedirect: "/login",  //jezeli sie nie uda
    }), function (req, res) {
    });

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/miejsca")
})

app.get("*", function (req, res) { //zlapie wszystkie adresy które nie są zdefiniowane
    res.redirect("/miejsca")
})

function czyZalogowany(req, res, next) { //middleware, jeżeli użytkownik zalogowany-> normalnie wykonuje akcje, jeżeli nie to przekierowuje na /login
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login")
}

function CzyToImageURL(str){ //przyda sie do wylapywania bledow jezeli ktos wpisze bledny link do obrazu
    if ( typeof str !== 'string' ) return false;
    return !!str.match(/\w+\.(jpg|jpeg|gif|png|tiff|bmp)$/gi);
}   