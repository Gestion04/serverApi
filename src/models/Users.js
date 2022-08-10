import { Schema, model } from "mongoose";
// const { Schema, model } = require("mongoose");
const UserSchema = new Schema({
    fullName:{
        type:String,
        required:true,
    },
    number: {
        type: Number,
        required: true,
        unique: true
    },
    wallet:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    codeReference: {
        type: String,
    },
    IdReference: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    pendientBalance: {
        type: Number,
        default: 0
    },
    withdrawBalance: {
        type: Number,
        default: 0
    },
    depositBalance: {
        type: Number,
        default: 0
    },
    investBalance: {
        type: Number,
        default: 0
    },
    gainBalance: {
        type: Number,
        default: 0
    }
},{
    timestamps: true,
    versionKey: false
});

export default model("users", UserSchema);