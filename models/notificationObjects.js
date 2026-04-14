import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    houseID: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    message:{
        type:String,
        required:true,
        unique: true
    },
    createdAt: {
        type: Date,
        required: true,
    }
});

export default mongoose.model('notifications', notificationSchema);