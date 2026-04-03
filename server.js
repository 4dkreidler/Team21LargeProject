const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');
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

app.post('/api/login', async (req, res, next) =>
{
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    var error = '';
    const { email, password } = req.body;
    
    //MongoDB connection
    const db = client.db('pantry');
    const results = await
    db.collection('users').find({email:email,password:password}).toArray();
    
    var id = -1;
    var fn = '';
    var ln = '';
    if( results.length > 0 )
    {
        id = results[0]._id;
        fn = results[0].firstName;
        ln = results[0].lastName;
    }

    var ret = { id:id, firstName:fn, lastName:ln, error:''};
    res.status(200).json(ret);
});

app.post('/api/register', async (req, res, next) =>
{
    // incoming: firstName, lastName, email, password
    // outgoing: id, firstName, lastName, error
    var error = '';
    const { firstName, lastName, email, password } = req.body;

    //MongoDB connection
    const db = client.db('pantry');
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
    }

    const newUser = {
        firstName,
        lastName,
        email,
        password
    };

    const result = await db.collection('users').insertOne(newUser);

    var ret = { id: result.insertedId, firstName: firstName, lastName: lastName, error: '' };
    res.status(200).json(ret);
});

//Start server at Port 5000
app.listen(5000, ()=> {
    console.log(`App is listenig to port : 5000`);
});