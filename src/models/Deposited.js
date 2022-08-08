import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const DepositedSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    urlImage: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
},{
    timestamps: true
});

export default model("Depositeds", DepositedSchema);