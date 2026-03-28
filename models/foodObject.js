//model/model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({
  foodName: {
    type: String,
    required: true,
  },
  houseID: {        // foreign key: houseID
    type: Number,
    required: true,
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
  lastBought: {     // foreing key: UserID
    type: Number,
    required: true,
  }
});

const foodObject = mongoose.model('foodObject', foodSchemaSchema);

module.exports = foodObject;