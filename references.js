var mongoose=require("mongoose")
require('dotenv').config();
const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {useNewUrlParser: true,  useUnifiedTopology: true }  );

var Post=require("./models/post")
var Komentarze=require("./models/komentarze")
var User=require("./models/user")

Post.create({
    tytuk: "cos ciekawego",
    tekst: "Najdlucszy komentarz swiata",

},  function (err, post){
        User.findOne({email:"e@mail.com"}, function(err, TenUser){
            if(err){
                console.log(err)
            } else {
                TenUser.posty.push(post);
                TenUser.save(function(err,dane){
                    if (err){
                        console.log(err)
                    } else {
                        console.log(dane)
                    }
                }); 
            }
        })
})