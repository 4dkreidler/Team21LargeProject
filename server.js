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
client.connect();

//MIDDLEWARE
app.use(cors());
app.use(express.json());

//Add Authentication APIs
var auth = require('./auth.js');
auth.setApp( app, client );

// ROUTES
//app.use("/api", authRoutes);

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

//Frontend integration
app.use(express.static(path.join(__dirname, 'Frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/dist', 'index.html'));
});

//Start server at Port 5000
app.listen(5000, ()=> {
    console.log(`App is listenig to port : 5000`);
});