import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");

const ReferenceSchema = new Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    gain: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    referenceNumber: {
        type: Number,
        required: true,
    }

},{
    timestamps: true,
    versionKey: false
});

export default model("References", ReferenceSchema);