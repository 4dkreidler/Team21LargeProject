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
			const user = await User.findOne({userID: Admin});
			if (!user) {
				return res.status(404).json({message: "User not found. Please try again."}); // 404: not found	
			}
			if (user.houseID) { // If already in a house
    			return res.status(400).json({ message: "User already belongs to a house." }); // 400: bad request
			}
			
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
			const {userID, password} = req.body;

			// Ensure input is valid
			if (!password) // No password
				return res.status(400).json({message: "Error: Code is required. Please try again."}); // 400: bad request
			if (password.length !== 6) // Sanitize length
				return res.status(400).json({message: "Error: Code must be six characters long. Please try again."}); // 400: bad request

			// Fetch querying user and house
			const user = await User.findOne({userID});
			if (!user) {
				return res.status(404).json({message: "User not found. Please try again."}); // 404: not found	
			}
			if (user.houseID) { // If already in a house
    			return res.status(400).json({ message: "User already belongs to a house." }); // 400: bad request
			}
			const house = await House.findOne({password});
			if (!house) {
				return res.status(404).json({message: "Code does not belong to any houses."}); // 404: not found	
			}
				
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

	// Leave current house
	router.delete("/houses/:userID", async(req, res) => {
		try {
			const {userID} = req.params;

			// Fetch user for deletion
			const user = await User.findOne({userID});
			if (!user) {
				return res.status(404).json({message: "User not found. Please try again."}); // 404: not found	
			}
			if (!user.houseID) { // If not in a house
    			return res.status(400).json({ message: "User not in a house." }); // 400: bad request
			}

			// Remove from house
			user.houseID = null;
			await user.save();

			// Return updated info
			return res.status(200).json({ // 200: request successful
				message: "Successfully left house.",
				user: {houseID: user.houseID}
			});
		} catch (err) { // Safety net since interacting with database
			console.error(err);
			return res.status(500).json({message: "Unexpected error. Please try again."}); // 500: server error
		}
	});

	// Get all members of house
	router.get("/houses/:houseID", async(req, res) => {
	    try {
	        const {houseID} = req.params;
	        if (!houseID) {
	            return res.status(400).json({ message: "Requested house not found. Please try again." }); // 400: bad request
	        }
	        
	        const members = await User.find({houseID: houseID}); // Fetch all users in house
	        return res.status(200).json({members: members}); // 200: request successful
	    } catch (err) {
	        console.error(err);
	        return res.status(500).json({ message: "Unexpected error. Please try again." }); // 500: server error
	    }
	});

	// Get one specific member from house
	router.get("/houses/:houseID/:userID", async(req, res) => {
	    try {
		    const { houseID, userID } = req.params;
	
	        // Find the specific user in the house
	        const member = await User.findOne({ houseID: houseID, userID: userID });
	        if (!member) {
	            return res.status(404).json({ message: "Member not found in this house." });
	        }
	
	        return res.status(200).json({member: member}); // 200: request successful
	    } catch (err) {
	        console.error(err);
	        return res.status(500).json({ message: "Unexpected error. Please try again." }); // 500: server error
	    }
	});
	
	// Mount onto app
	app.use("/api", router);
}

module.exports = {houseManager};
