import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const ReceiverSchema = new Schema({
    number: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
    date: {
        type: String,
        required: true
    },
    pendientNumber: {
        type: Number,
        required: true,
    }
},{
    timestamps: true,
    versionKey: false
});

export default model("Receivers", ReceiverSchema);