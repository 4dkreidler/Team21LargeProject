//model/model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const houseSchema = new Schema({
  HouseName: {
    type: String,
    required: true,
  },
  Admin:{   // Foreign Key: User ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  password: {
    type: String,
    required: true,
  }
});

const House = mongoose.model('House', houseSchema);

module.exports = House;
