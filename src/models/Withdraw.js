import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const WithdrawSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    wallet: {
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

export default model("Withdraws", WithdrawSchema);