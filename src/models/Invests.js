import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const InvestSchema = new Schema({
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
    dateEnd:{
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
    },
    day: {
        type: Number,
        required: true,
        default: 1
    },
    gain: {
        type: Number,
        required: true
    }
},{
    timestamps: true
});

export default model("Invests", InvestSchema);