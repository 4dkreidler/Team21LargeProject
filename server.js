const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser);

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

app.listen(5000); // start Node + Express server on port 5000

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://RickLeinecker:COP4331Rocks@cluster0-4pisv.mongodb.net/COP4331?retryWrites=true&w=majority';

const client = new MongoClient(url);
client.connect();

var api = require('./api.js');
api.setApp( app, client );

// APIS (Remove since the api's will live in the api.js file, just keeping it in for reference for now)

app.post('/api/login', async (req, res, next) =>
{
    // incoming: email, password
    // outgoing: id, firstName, lastName, error
    
    var error = '';
    
    const { email, password } = req.body;

    const db = client.db('COP4331Cards'); // Connect to proper DB and table
    const results = await db.collection('Users').find({Login:login,Password:password}).toArray(); // User table instead of Users?
    
    var id = -1;
    var fn = '';
    var ln = '';
    
    if( results.length > 0 )
    {
        id = results[0].UserID;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }

    var ret = { id:id, firstName:fn, lastName:ln, error:''};
    res.status(200).json(ret);
});