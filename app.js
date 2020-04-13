var express=require("express")
var app=express()
var bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//tymczasowo, potem bedzie przeniesione do bazy danych
var miejsca= [
    {nazwa: "Msc1", image:"https://images.unsplash.com/photo-1534595038511-9f219fe0c979?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
    {nazwa: "Msc2", image:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
    {nazwa: "Msc3", image:"https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
    {nazwa: "Msc4", image:"https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
    {nazwa: "Msc5", image:"https://images.unsplash.com/photo-1486304873000-235643847519?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
    {nazwa: "Msc6", image:"https://images.unsplash.com/photo-1529408686214-b48b8532f72c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"}

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