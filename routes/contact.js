const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("tournaments/contact.ejs");
});

module.exports = router;