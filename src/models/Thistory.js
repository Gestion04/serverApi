import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const ThistorySchema = new Schema({
    number: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true
    }
},{
    timestamps: true,
    versionKey: false
});

export default model("Thistory", ThistorySchema);