var mongoose=require("mongoose")
var passportLocalMongoose=require("passport-local-mongoose")

//-----------------uzytkownik

var UserSchema = new mongoose.Schema({
    login: String,
    haslo: String

});

UserSchema.plugin(passportLocalMongoose);

//"zwraca" ten plik do uzycia dalej
module.exports= mongoose.model("User", UserSchema);