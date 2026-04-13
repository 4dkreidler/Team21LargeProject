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
        unique: true
    },
    password: {
        type: String,
        required: true,
    },

    houseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House'
    },

    
    validated: {
        type: Boolean,
        default: false
    },

    verificationToken: String,
    verificationTokenExpires: Date
});

export default mongoose.model('users', userSchema);