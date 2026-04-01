// Importing necessities
const express = require("express");
const House = require("../models/house");
const User = require("../models/user");

// Function that server.js will call
function houseManager(app) {
	const router = express.Router();
	
	// Create new house
	router.post("/houses", async(req, res) => {
		try{
			const {Admin, HouseName} = req.body; // Creator of house is admin by default
			
			// Ensure input is valid
			if (!HouseName) {
				return res.status(400).json({message: "Error: House name is required. Please try again."}); // 400: bad request
			}
			
			// Assign houseID			
			const lastHouse = await House.findOne().sort({houseID: -1}); // Sort descending
			let houseID;
			if (!lastHouse) { // If there are no saved houses in system
				houseID = 1;
			} else { // If there are saved houses in system
				houseID = lastHouse.houseID + 1;
			}			

			// Fetch creating user for admin
			const user = await User.findOne({Admin});

			// Generate alphanumeric code
			const passwordChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Character pool
			let password = ""; // Empty password
			for(let i = 0; i < 6; i++) {
				password += passwordChars.charAt(Math.floor(Math.random() * passwordChars.length)); // Append random character from pool six times
			}

			// Assign values
			const newHouse = new House({
				HouseName,
				Admin,
				password,
				houseID
			});
			await newHouse.save();

			// Update user's houseID
			user.houseID = houseID;
			await user.save();

			// Return updated info
			return res.status(201).json({ // 201: successfully created
				message: "House created successfully.",
				house: newHouse,
				user: {userID: user.userID, houseID: user.houseID}
			});
		} catch (err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}); // 500: server error
		}
	});

	// Join existing house
	router.post("/houses/join", async(req, res) => {
		try {
			const { userID, password } = req.body;

			// Ensure input is valid
			if (!password) // No password
				return res.status(400).json({message: "Error: Code is required. Please try again."}); // 400: bad request
			if (password.length !== 6) // Sanitize length
				return res.status(400).json({message: "Error: Code must be six characters long. Please try again."}); // 400: bad request

			// Fetch querying user and house
			const user = await User.findOne({userID});
			const house = await House.findOne({password});
			if (!house)
				return res.status(404).json({message: "Code does not belong to any houses."})
			
			// Update user's houseID
			user.houseID = house.houseID;
			await user.save();

			// Return updated info
			return res.status(200).json({ // 200: request successful
				message: "Successfully joined house.",
				user: {houseID: user.houseID}
			});
		} catch (err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}); // 500: server error
		}
	});

	// Mount onto app
	app.use("/api", router);
}

module.exports = {houseManager};
