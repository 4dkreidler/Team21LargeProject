//model/model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userID: {   // Primary Key
        type: Number,
        required: true,
    },
    fisrtName: {
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
        type: Number,
        required: false,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;