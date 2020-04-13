var express=require("express")
var app=express()
var bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//tymczasowo, potem bedzie przeniesione do bazy danych
var miejsca= [
    {nazwa: "Msc1", image:"https://images.pexels.com/photos/3820994/pexels-photo-3820994.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"},
    {nazwa: "Msc2", image:"https://images.pexels.com/photos/3820994/pexels-photo-3820994.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"},
    {nazwa: "Msc3", image:"https://images.pexels.com/photos/2659475/pexels-photo-2659475.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"}
]


app.listen(3000, function(){
    console.log("Serwer działa...")
});


app.set("view engine","ejs")

app.get("/", function(req,res){
    res.render("landing");
});

app.get("/miejsca",function(req,res){

    res.render("miejsca", {miejsca:miejsca})
});

app.post("/miejsca", function(req,res){
    //zbierz dane z formularza i dodaj do tabeli
    var nazwa=req.body.nazwa;
    var image=req.body.image;
    var nowemiejsca={nazwa:nazwa, image:image}
    miejsca.push(nowemiejsca)
    res.redirect("/miejsca")
});

app.get("/miejsca/new", function(req,res){
    res.render("new.ejs")
})