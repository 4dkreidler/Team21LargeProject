// Importing necessities
require("express");
const {ObjectId} = require('mongodb');

exports.setApp = function (app, client) {
	// Add to pantry
	app.post("/pantry", async(req, res) => {
		try{
			const{foodName, houseID, Category, Stock, price, expirationDate, userID} = req.body; // Takes in basically everything about the food, house ID, and adding user ID
			const db = client.db('pantry');
			
			if (!foodName || !Stock) {
				return res.status(400).json({message: "Missing required fields. Please try again."});
			}

			const objUserID = new ObjectId(userID);
			const objHouseID = new ObjectId(houseID);
			
			// Fetch adding user for lastBought
			const user = await db.collection('users').findOne({_id: objUserID});
			if (!user) {
				return res.status(404).json({message: "User not found. Please try again."}); // 404: not found	
			}
			const lastBought = objUserID; // Store user ID for lastBought to be used in future updates/deletes
		
			// Assign values
			const newFood = ({
				foodName,
				houseID: objHouseID,
				Category,
				Stock,
				price,
				expirationDate,
				lastBought	
			});
			
			const result = await db.collection('foodObjects').insertOne(newFood);

			// Return updated info
			return res.status(201).json({ // 201: successfully created
				message: "Food item added.",
				food: newFood
			});
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	});

	// Update item
	app.put("/pantry/:id", async(req, res) => {
		try {
			const {id} = req.params; // built-in ID of object
			const {foodName, Category, Stock, price, expirationDate, userID} = req.body; // Takes in editable fields and editing user ID
			const db = client.db('pantry');

			const objFoodID = new ObjectId(id);
			const objUserID = new ObjectId(userID);
			
			// Fetch editing user for lastBought
			const user = await db.collection('users').findOne({_id: objUserID});
			if (!user) {
				return res.status(404).json({message: "User not found. Please try again."}); // 404: not found	
			}
			const lastBought = `${user.firstName} ${user.lastName}`;

			// Fetch food item for editing
			const food = await db.collection('foodObjects').findOne({_id: objFoodID});
			if (!food) {
			    return res.status(404).json({message: "Item not found. Please try again."}); // 404: not found
			}
			
			// Update changed values
			let updatedFields = {};
			if (foodName !== undefined) updatedFields.foodName = foodName; // If any of these were changed, the update object adds them
			if (Category !== undefined) updatedFields.Category = Category;
			if (Stock !== undefined) updatedFields.Stock = Stock;
			if (price !== undefined) updatedFields.price = price;
			if (expirationDate !== undefined) updatedFields.expirationDate = expirationDate;
			updatedFields.lastBought = lastBought; // Inherently changes when someone edits
			
			await db.collection('foodObjects').updateOne(
                {_id: objFoodID},
                {$set: updatedFields}
            );

			const updatedFood = await db.collection('foodObjects').findOne({_id: objFoodID});

			// Return updated info
			return res.status(200).json({ // 200: request successful
				message: "Food item updated.",
				updatedFood
			});			
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	});

	// Delete item
	app.delete("/pantry/:id", async(req, res) => {
		try {
			const {id} = req.params; // Takes in ID of item being deleted
			const db = client.db('pantry');

			const objFoodID = new ObjectId(id);

			// Fetch food item for deletion
			const food = await db.collection('foodObjects').findOne({ _id: objFoodID });
			if (!food) {
			    return res.status(404).json({message: "Item not found. Please try again."}); // 404: not found
			}
			
			await db.collection('foodObjects').deleteOne({ _id: objFoodID });

			// Retun confirmation
			return res.status(200).json({ // 200: request successful
				message: "Food item deleted."
			});
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	});

	// Get specific item in pantry
	app.get("/pantry/item/:id", async(req, res) => {
		try {
			const {id} = req.params; // Takes in ID of item being selected
			const db = client.db('pantry');

			const objFoodID = new ObjectId(id);
			
			// Retrieve food item
			const food = await db.collection('foodObjects').findOne({_id: objFoodID});
			if (!food) {
			    return res.status(404).json({message: "Item not found. Please try again."}); // 404: not found
			}
			return res.status(200).json({food}); // 200: request successful
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}	
	});

	// Get all items in pantry
	app.get("/pantry/house/:houseID", async(req, res) => {
		try {
			const {houseID} = req.params; // Takes in ID of house with pantry being checked
			const db = client.db('pantry');

			const objHouseID = new ObjectId(houseID);
			const foods = await db.collection('foodObjects').find({houseID: objHouseID}).toArray();
			
			return res.status(200).json({food: foods}); // 200: request successful
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	});
}
