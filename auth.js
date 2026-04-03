require('express');
require('mongodb');

exports.setApp = function ( app, client )
{
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
}