var mongoose=require("mongoose")
//------------------------------komentarze, tekst+autor


var komentarzeSchema= new mongoose.Schema({
    tekst: String,
    autor: String,
});

module.exports=mongoose.model("Komentarze", komentarzeSchema)