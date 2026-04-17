// houseManager.js

require('express');
const {ObjectId} = require('mongodb');

exports.setApp = function (app, client)
{
    //Create House API
    app.post('/api/houses', async (req, res) =>
    {
        try
        {
            const { Admin, HouseName } = req.body; // Take in creating user ID and inputted house name

            // MongoDB connection
            const db = client.db('pantry');

            if (!HouseName)
                return res.status(400).json({ error: "House name is required." });

            // Find admin user
	        const adminID = new ObjectId(Admin);
            const user = await db.collection('users').findOne({_id: adminID});
            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (user.houseID && user.houseID !== "-1")
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

    //Join House API
    app.post('/api/houses/join', async (req, res) =>
    {
        try
        {
            const { userID, password } = req.body; // Take in joining user ID and house code
	          const db = client.db('pantry');

            if (!password || password.length !== 6)
                return res.status(400).json({ error: "Invalid code." });

            const objUserID = new ObjectId(userID);
	          const user = await db.collection('users').findOne({_id: objUserID});

            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (user.houseID && user.houseID !== "-1" && user.houseID !== -1)
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

    //Leave House API
    app.delete('/api/houses/:userID', async (req, res) =>
    {
        try
        {
            const { userID } = req.params; // Take in leaving user ID 
	        const db = client.db('pantry');

            const objUserID = new ObjectId(userID);
	    	const user = await db.collection('users').findOne({_id: objUserID});
			
            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (!user.houseID)
                return res.status(400).json({ error: "User not in a house." });

			const house = await db.collection('houses').findOne({_id: user.houseID});
			if (!house) 
				return res.status(404).json({error: "House not found."});

			// If user is admin
			if (house.Admin.equals(objUserID))
        	{
				// Get other user in hosue to be new admin
	            const newAdmin = await db.collection('users').findOne({
	                houseID: user.houseID,
	                _id: {$ne: objUserID}
            	});
	            if (newAdmin) // If other user found
	            {
	                await db.collection('houses').updateOne(
	                    { _id: house._id },
	                    {$set: {Admin: newAdmin._id}}
	                );
	            }
	            else // If no other users in house
	            {
	                await db.collection('houses').deleteOne({_id: house._id});
	            }
       		}
			
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

    //Get House for User API
    app.get('/api/houses/user/:userID', async (req, res) => {
        try {
            const { userID } = req.params;
            const db = client.db('pantry');

            // Check if userID is a valid 24-character hex string
            if (!userID || userID.length !== 24) {
                console.log("Invalid or missing UserID received:", userID);
                return res.status(200).json({ households: [] });
            }

            // Create the ObjectId
            const objUserID = new ObjectId(userID);

            // Find the user
            const user = await db.collection('users').findOne({ _id: objUserID });
            
            if (!user || !user.houseID || user.houseID === "-1") {
                return res.status(200).json({ households: [] });
            }

            // Find the house 
            const house = await db.collection('houses').findOne({ _id: new ObjectId(user.houseID) });

            if (!house) {
                return res.status(200).json({ households: [] });
            }

            res.status(200).json({
                households: [{
                    _id: house._id.toString(),
                    name: house.HouseName,
                    password: house.password,

                    role: house.Admin.toString() === user._id.toString() ? "Admin" : "Member"
                }]
            });
        } catch (err) {
            console.error("Internal Server Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
	
    //Get Specific User API
    app.get('/api/houses/:houseID/:userID', async (req, res) =>
    {
        try
        {
            const { houseID, userID } = req.params; // Take in house ID and requested user ID
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

    //Get All House Members API
    app.get('/api/houses/:houseID', async (req, res) =>
    {
        try
        {
            const { houseID } = req.params; // Take in house ID
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

    //Update House Name API
    app.post('/api/houses/update', async (req, res) => {
        try {
            const { houseID, newName } = req.body;
            const db = client.db('pantry');

            if (!houseID || !newName) {
                return res.status(400).json({ error: "Missing houseID or newName." });
            }

            const result = await db.collection('houses').updateOne(
                { _id: new ObjectId(houseID) },
                { $set: { HouseName: newName } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "House not found." });
            }

            res.status(200).json({ message: "House name updated successfully!", error: "" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error." });
        }
    
    });
}
