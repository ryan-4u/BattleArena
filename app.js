const express = require("express") ;
const app = express() ;
const mongoose = require("mongoose");
const path = require("path")
const methodOverride = require("method-override") ;
const ejsMate = require("ejs-mate") ;
const Tournament = require("./models/tournament.js") ;
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

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

// Session & Flash
app.use(session({
    secret: "battle-arena-secret-key",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user.js");

// Make user available in all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// All routes from routes/index.js will be prefixed with "/"
const indexRoutes = require("./routes/index.js");
app.use(indexRoutes);

app.listen( 8080 , () => {
    console.log(" server is listening.. ") ;
}) ;