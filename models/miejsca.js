;var mongoose=require("mongoose")

// Schemat tworzenia miejsc
var miejscaSchema= new mongoose.Schema({
    nazwa:String,
    image: String,
    krotkiopis: String,
    dlugiopis: String,
    cena: Number,
    googlelokacja: Array,
    imie: String,
    numer: Number,
    komentarze: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Komentarze"
        }
    ]
})

module.exports=mongoose.model("Miejsca",miejscaSchema)
