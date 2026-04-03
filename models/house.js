// houseManager.js

require('express');
const {ObjectId} = require('mongodb');

exports.setApp = function (app, client)
{
    // =========================
    // CREATE HOUSE
    // =========================
    app.post('/api/houses', async (req, res) =>
    {
        try
        {
            const { Admin, HouseName } = req.body;

	    // MongoDB connection
	    const db = client.db('pantry');

            if (!HouseName)
                return res.status(400).json({ error: "House name is required." });

            // Find admin user
	    const adminID = new ObjectId(Admin);
            const user = await db.collection('users').findOne({_id: adminID});
            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (user.houseID)
                return res.status(400).json({ error: "User already in a house." });

            // Generate 6-char code
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let password = "";
            for (let i = 0; i < 6; i++)
                password += chars.charAt(Math.floor(Math.random() * chars.length));

            const newHouse = ({
                HouseName,
                Admin: user._id,
                password
            });

            const result = await db.collection('houses').insertOne(newHouse);

            // Update user with house reference
            await db.collection('users').updateOne(
              { _id: adminID },
	    	      {$set: {houseID: result.insertedId}}
	          )

            res.status(201).json({
                message: "House created",
                house: newHouse,
                user: {houseID: result.insertedId},
                error: ""
            });
        }
        catch (err)
        {
            console.error(err);
            res.status(500).json({ error: "Server error." });
        }
    });

    // =========================
    // JOIN HOUSE
    // =========================
    app.post('/api/houses/join', async (req, res) =>
    {
        try
        {
            const { userID, password } = req.body;
	          const db = client.db('pantry');

            if (!password || password.length !== 6)
                return res.status(400).json({ error: "Invalid code." });

            const objUserID = new ObjectId(userID);
	          const user = await db.collection('users').findOne({_id: objUserID});

            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (user.houseID)
                return res.status(400).json({ error: "User already in a house." });

            const house = await db.collection('houses').findOne({password});

            if (!house)
                return res.status(404).json({ error: "House not found." });

            await db.collection('users').updateOne(
              { _id: objUserID},
	    	      {$set: {houseID: house._id}} 
	          )

            res.status(200).json({
                message: "Joined house",
                user: {houseID: house._id},
                error: ""
            });
        }
        catch (err)
        {
            console.error(err);
            res.status(500).json({ error: "Server error." });
        }
    });

    // =========================
    // LEAVE HOUSE
    // =========================
    app.delete('/api/houses/:userID', async (req, res) =>
    {
        try
        {
            const { userID } = req.params;
	          const db = client.db('pantry');

            const objUserID = new ObjectId(userID);
	          const user = await db.collection('users').findOne({_id: objUserID});

            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (!user.houseID)
                return res.status(400).json({ error: "User not in a house." });

            await db.collection('users').updateOne(
              { _id: objUserID},
	    	      {$set: {houseID: null}} 
	          )

            res.status(200).json({
                message: "Left house",
                user: { houseID: null },
                error: ""
            });
        }
        catch (err)
        {
            console.error(err);
            res.status(500).json({ error: "Server error." });
        }
    });

    // =========================
    // GET ALL MEMBERS IN HOUSE
    // =========================
    app.get('/api/houses/:houseID', async (req, res) =>
    {
        try
        {
            const { houseID } = req.params;
	    const db = client.db('pantry');

            const objHouseID = new ObjectId(houseID);

	    const members = await db.collection('users').find({houseID: objHouseID}).project({password: 0}).toArray();

            res.status(200).json({
                members,
                error: ""
            });
        }
        catch (err)
        {
            console.error(err);
            res.status(500).json({ error: "Server error." });
        }
    });

    // =========================
    // GET SPECIFIC MEMBER
    // =========================
    app.get('/api/houses/:houseID/:userID', async (req, res) =>
    {
        try
        {
            const { houseID, userID } = req.params;
	    const db = client.db('pantry');

	    const objHouseID = new ObjectId(houseID);
	    const objUserID = new ObjectId(userID);

            const member = await db.collection('users').findOne(
                {
                    houseID: objHouseID,
                    _id: objUserID
                },
                {projection: {password: 0}}
            );

            if (!member)
                return res.status(404).json({ error: "Member not found." });

            res.status(200).json({
                member,
                error: ""
            });
        }
        catch (err)
        {
            console.error(err);
            res.status(500).json({ error: "Server error." });
        }
    });
};
