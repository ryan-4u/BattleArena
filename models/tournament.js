const mongoose = require("mongoose") ;
const Schema = mongoose.Schema ; 
const tournamentSchema = new Schema({
    title:{
        type: String ,
        required: true
    } ,
    description:{
        type: String 
    } ,
    game : {
        type: String
    } ,
    mode:{
        type: String 
    } ,
    slots:{
        type : Number 
    },
    pool :{
        type: Number 
    },
    timing :{
        type: String
    }
}) 

const Tournaments = mongoose.model("Tournaments",tournamentSchema);
module.exports = Tournaments ;