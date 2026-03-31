// Importing necessities
const express = require("express");
const Food = require("../models/foodObject");

// Function that server.js will call
function pantryManager(app) {
	const router = express.Router();

	// Add to pantry
	router.post("/pantry", async(req, res) => {
		try{
			const{foodName, houseID, Category, Stock, price, expirationDate, userID} = req.body;
			
			// Fetch adding user for lastBought
			const user = await User.findOne{userID};
			const lastBought = '{${user.firstName} ${user.lastName}}';
		
			// Assign values
			const newFood = new Food ({
				foodName,
				houseID,
				Category,
				Stock,
				price,
				expirationDate,
				lastBought	
			});
			await newFood.save();

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
	router.put("/pantry/:id", async(req, res) => {
		try {
			const {id} = req.params; // built-in ID of object
			const {foodName, Category, Stock, price, expirationDate, userID} = req.body; // Things that can be edited
			
			// Fetch editing user for lastBought
			const user = await User.findOne{userID};
			const lastBought = '{${user.firstName} ${user.lastName}}';

			// Fetch food item for editing
			const food = await Food.findById(id);

			// Update changed values
			if (foodName !== undefined) food.foodName = foodName; // If any of these were changed, the update object adds them
			if (Category !== undefined) food.Category = Category;
			if (Stock !== undefined) food.Stock = Stock;
			if (price !== undefined) food.price = price;
			if (expirationDate !== undefined) food.expirationDate = expirationDate;
			food.lastBought == lastBought; // Inherently changes when someone edits
			await food.save();

			// Return updated info
			return res.status(200).json({ // 200: request successful
				message: "Food item updated.",
				food
			});			
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	});

	// Delete item
	router.delete("pantry/:id", async(req, res) => {
		try {
			const {id} = req.params;

			// Fetch food item for deletion
			const food = await Food.findById(id);
			await food.remove();

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
	router.get("pantry/:id", async(req, res) => {
		try {
			const {id} = req.params;

			// Retrieve food item
			const food = await Food.findById(id);
			return res.status(200).json({food}); // 200: request successful
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}	
	});

	// Get all items in pantry
	router.get("pantry/:houseID", async(req, res) => {
		try {
			const {houseID} = req.params;
			const foods = await Food.find({houseID}); // Get all foods in this house
			return res status(200).json({food: foods}); // 200: request successful
		} catch(err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}) // 500: server issue
		}
	}

	// Mount onto app
	app.use("/api", router);

}