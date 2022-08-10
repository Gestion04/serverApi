import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const InvertSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
},{
    timestamps: true
});

export default model("Inverts", InvertSchema);