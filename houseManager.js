// houseManager.js

require('express');
const mongoose = require('mongoose');

// Import models
const House = require('./models/house');
const User = require('./models/user');

exports.setApp = function (app)
{
    // =========================
    // CREATE HOUSE
    // =========================
    app.post('/api/houses', async (req, res) =>
    {
        try
        {
            const { Admin, HouseName } = req.body;

            if (!HouseName)
                return res.status(400).json({ error: "House name is required." });

            // Find admin user
            const user = await User.findById(Admin);
            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (user.houseID)
                return res.status(400).json({ error: "User already in a house." });

            // Generate 6-char code
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let password = "";
            for (let i = 0; i < 6; i++)
                password += chars.charAt(Math.floor(Math.random() * chars.length));

            const newHouse = new House({
                HouseName,
                Admin: user._id,
                password
            });

            await newHouse.save();

            // Update user with house reference
            user.houseID = newHouse._id;
            await user.save();

            res.status(201).json({
                message: "House created",
                house: newHouse,
                user: { id: user._id, houseID: user.houseID },
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

            if (!password || password.length !== 6)
                return res.status(400).json({ error: "Invalid code." });

            const user = await User.findById(userID);
            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (user.houseID)
                return res.status(400).json({ error: "User already in a house." });

            const house = await House.findOne({ password });
            if (!house)
                return res.status(404).json({ error: "House not found." });

            user.houseID = house._id;
            await user.save();

            res.status(200).json({
                message: "Joined house",
                user: { houseID: user.houseID },
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

            const user = await User.findById(userID);
            if (!user)
                return res.status(404).json({ error: "User not found." });

            if (!user.houseID)
                return res.status(400).json({ error: "User not in a house." });

            user.houseID = null;
            await user.save();

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

            const members = await User.find({ houseID })
                .select('-password'); // don't send passwords

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

            const member = await User.findOne({
                _id: userID,
                houseID: houseID
            }).select('-password');

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