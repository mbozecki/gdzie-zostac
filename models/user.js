var mongoose=require("mongoose")

//-----------------uzytkownicy- email,imie, posty

var userSchema = new mongoose.Schema({
    email:String,
    imie: String,
    posty: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
});

//"zwraca" ten plik do uzycia dalej
module.exports= mongoose.model("User", userSchema);