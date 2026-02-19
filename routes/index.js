const express = require("express");
const router = express.Router();

// Mount other route files
const tournamentRoutes = require("./tournaments.js");
const contactRoutes = require("./contact.js");

router.get("/" , (req,res) => {
    res.render('home.ejs') ;
}) ;
router.get("/login" , (req,res) => {
    res.render('login.ejs') ;
}) ;
router.get("/register" , (req,res) => {
    res.render('register.ejs') ;
}) ;


// Mount routes with prefixes
router.use("/tournaments", tournamentRoutes);
router.use("/contact", contactRoutes);
router.get("/about" , (req,res) => {
    res.render("tournaments/about.ejs") ;
}) ;

module.exports = router;
