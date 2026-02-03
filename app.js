const express = require("express") ;
const app = express() ;
const mongoose = require("mongoose");
const path = require("path")
const methodOverride = require("method-override") ;
const ejsMate = require("ejs-mate") ;
const Tournament = require("./models/tournament.js") ;

const MONGO_URL = "mongodb://127.0.0.1:27017/battlearena" ;
main()
  .then( (res) => {
    console.log("connected to our db battlearena") ;
  })
  .catch( (err) => {
    console.log(err) ;
  });
  
async function main() {
    await mongoose.connect(MONGO_URL) ;
}

app.set("view engine" , "ejs" ) ;
app.set("views" , path.join( __dirname , "views" ));
app.use( express.urlencoded( {extended : true} ) ) ; // to parse data from route
app.use(methodOverride("_method")) ;
app.engine( "ejs" , ejsMate) ;
app.use(express.static(path.join(__dirname,"/public"))) ;


app.get("/tournaments", (req,res) =>{
    res.render('tournaments/index.ejs') ;
});

app.get("/" , (req,res) => {
    res.render('home.ejs') ;
}) ;

// app.get("/test" , async (req,res) => {
//     let sample = new Tournament({
//         title : "Solo Cup Feb 2026" ,
//         description: "lohhhanbsmndshdshsavdjsahvdsabdvsdbasvdshgscavhgds",
//         game : " free fire" ,
//         mode : "solo",
//         slots: 256 ,
//         pool : 100000 ,
//         timing : new Date()
//     }) ;
//     await sample.save() ;
//     console.log("sample was saved");
//     res.send("successful testing") ;

// });

app.listen( 8080 , () => {
    console.log(" server is listening.. ") ;
}) ;