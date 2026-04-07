//model/model.js

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
    }
});

export default mongoose.model('users', userSchema);