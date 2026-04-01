require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

// import routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foodManager');
const { houseManager } = require('./routes/houseManager');

// mount routes
app.use('/api', authRoutes);
app.use('/api', foodRoutes);
houseManager(app); 

app.listen(5000, () => console.log('Server running'));