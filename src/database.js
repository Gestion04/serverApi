require('dotenv').config();
import {connect} from "mongoose";
// const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;
(async () => {
    try{
        let mongo = await connect(MONGO_URI);
        console.log("DB connected to: "+ mongo.connection.name);
    }catch(err){
        console.log("Error: "+ err);
    }
})();