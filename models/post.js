var mongoose=require("mongoose")

//--------------post- tytul+tekst

var postSchema = new mongoose.Schema({
    tytul: String,
    tekst: String,
})

//eksportuje zawartosc zeby mozna bylo ja potem odczytac
module.exports=mongoose.model("Post", postSchema)
