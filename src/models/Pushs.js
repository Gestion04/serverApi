import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const PushSchema = new Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
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

export default model("Pushs", PushSchema);