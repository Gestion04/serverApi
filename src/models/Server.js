import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const ServerSchema = new Schema({
    Admin: {
        type: String,
        required: true
    },
    AllBalance: {
        type: Number,
        required: true
    },
    Balance: {
        type: Number,
        required: true
    },
    Invests:{
        type: Number,
        required: true
    }
},{
    timestamps: true
});

export default model("Servers", ServerSchema);