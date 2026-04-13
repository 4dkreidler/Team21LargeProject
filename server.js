const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const MongoClient = require('mongodb').MongoClient;
 
// IMPORT ROUTES
//import authRoutes from "./Backend/routes/auth.js";

//Connects to MongoDB using .env file
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
const PORT = 5555; 

/*
//Mongoose connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Mongoose connected'))
.catch(err => console.log(err));
*/

//MIDDLEWARE
app.use(cors());
app.use(express.json());

client.connect()
.then(() => {
    console.log('Connected to MongoDB');

    //Add Authentication APIs
    var auth = require('./auth.js');
    auth.setApp( app, client );


    var passwordManager = require('./passwordManager.js');
    passwordManager.setApp( app, client );

    //Add House Management APIs
    var houseManager = require('./houseManager.js');
    houseManager.setApp( app, client );

    //Add Pantry Management APIs
    var pantryManager = require('./pantryManager.js');
    pantryManager.setApp( app, client );

    //Frontend integration
    app.use(express.static(path.join(__dirname, 'Frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'Frontend/dist', 'index.html'));
    });

    app.use((req, res, next) =>
    {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        );
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PATCH, DELETE, OPTIONS'
        );
        next();
    });

    //Start server at Port 5000 (after the DB connection is established)
    app.listen(PORT, ()=> {
        console.log(`App is listenig to port : `+ PORT);
    });
})
.catch(err => {
    console.error('Failed to connect to MongoDB', err);
});