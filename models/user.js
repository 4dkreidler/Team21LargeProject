//model/model.js

import { type } from 'express/lib/response';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
    },
    password: {
        type: String,
        required: true,
    },
    houseID: {  // Foreign Key: houseID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House'
    },
    validated: {
        type: Boolean,
        default: false,
        required: false
    }
});

export default mongoose.model('users', userSchema);