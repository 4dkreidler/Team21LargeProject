// Importing necessities
require("express");
require('mongodb');

exports.setApp = function (app, client) {
	// Add notification
	app.post("/api/addNotification", async(req, res) => {
		try{

            //Takes in houseID, userName, message
            //Returns error
			const{houseID, userName, message} = req.body; 
			const db = client.db('pantry');
			
			if (!userName || !message) {
				return res.status(400).json({error: "Missing required fields. Please try again."});
			}

			const objHouseID = new ObjectId(houseID);
			
			const house = await db.collection('houses').findOne({_id: objHouseID});
			if (!house){
                return res.status(404).json({error: "House not found"});
            }
			// Assign values
			const newNotify = ({
				houseID: objHouseID,
				userName,
                message,
                createdAt: Date.now()
			});
			
			const result = await db.collection('notifications').insertOne(newNotify);

			// 201: successfully created
			return res.status(201).json({ error: "",});
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	});


    // Get notifications from a house 
	app.get("/api/getNotifications/:houseID", async(req, res) => {
		try {
			const { houseID } = req.params;
			const db = client.db('pantry');

			const objHouseID = new ObjectId(houseID);
			
			// Build the query
			let query = { houseID: objHouseID };

			const notifications = await db.collection('notifications').find(query).toArray();
			
			// Sending back 'items' to match the frontend state expectations
			return res.status(200).json({ notifications: notifications }); 
		} catch(err) {
			console.error(err);
			return res.status(500).json({message: "Unexpected error."})
    }
});
}