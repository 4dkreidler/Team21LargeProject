//model/model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({
  foodName: {
    type: String,
    required: true,
  },
  houseID: {   // Foreign Key: House ID
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House'
    },
  Category: {       // Enum: "Dairy", "Produce", "Non-perishable", etc
    type: String,
    required: true,
  },
  Stock: {
    type: Number,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: false,
  },
  lastBought: {   // Foreign Key: User ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const foodObject = mongoose.model('FoodObject', foodSchema);

module.exports = foodObject;