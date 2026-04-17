require('express');
require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
const bcrypt = require('bcrypt');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();

exports.setApp = function ( app, client )
{
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
    });

    //login api
    app.post('/api/login', async (req, res, next) =>
{
    // incoming: login, password
    // outgoing: id, firstName, lastName, error (token)
    var error = '';
    const { email, password } = req.body;

    /// NEW LOGIN CODE (with email verification check)
    try {
        // MongoDB connection
        const db = client.db('pantry');

        // Find user by email only
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(200).json({ error: "Invalid email/password" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(200).json({ error: "Invalid email/password" });
        }

        // Check email verification
        if (!user.validated) {
            return res.status(200).json({ error: "Please verify your email before logging in" });
        }

        // Generate JWT
        const path = require('path');
        const token = require(path.join(__dirname, '..', 'createJWT.js'));
        const ret = token.createToken(user);

        return res.status(200).json(ret);

    } catch (e) {
        console.log(e.toString());
        return res.status(500).json({ error: "Server error" });
    }

});

    //register api
    app.post('/api/register', async (req, res, next) =>
    {
        // incoming: firstName, lastName, email, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { firstName, lastName, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
         if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." });
        }
        var houseID = null; 

        try {
            // MongoDB connection
            const db = client.db('pantry');

            // Check if user already exists
            const existingUser = await db.collection('users').findOne({ email });

            // If user already exists 
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            //Generate token for email verification
            const token = crypto.randomBytes(32).toString("hex");

            //Create new User
            const newUser = {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                houseID,
                validated: false,
                verificationToken: token,
                verificationTokenExpires: Date.now() + 1000 * 60 * 30 // 30 min
            };

            //Insert new user into database
            const result = await db.collection('users').insertOne(newUser);
            
            //Backend verify link
            const verifyURL = `http://localhost:5555/api/verify/${token}`;

            await transporter.sendMail({
                to: email,
                subject: "Verify your email",
                html: `
                    <h2>Email Verification</h2>
                    <p>Click below to verify your account:</p>
                    <a href="${verifyURL}">${verifyURL}</a>
                `
            });

            //Return json with results 
            var ret = { id: result.insertedId, firstName: firstName, lastName: lastName, error: '' };
            res.status(200).json(ret);

        } catch(err){
            //Return an error
            console.log(err.toString()); 
            return res.json({error: 'Error: Internal Server Error'});
        }
    });


    //verify email api (redirect version)
    app.get("/api/verify/:token", async (req, res) => {
        const { token } = req.params;

        try {
            //MongoDB connection
            const db = client.db('pantry');

            //find user with matching verification token
            const user = await db.collection('users').findOne({ 
                verificationToken: token
            });

            //No user found
            if (!user) {
                //  redirect to error page 
                return res.redirect("http://localhost:5173/login");
            }

            //user found but token expired
            if(Date.now() >= user.verificationTokenExpires){
                //delete user so they can reregister
                await db.collection('users').deleteOne(
                    {_id: user._id}
                )
                //redirect to error page
                return res.redirect("http://localhost:5173/signup");
            }

            //  mark verified
            await db.collection('users').updateOne(
                {email: user.email },
                {$set: {validated : true, verificationToken : null, verificationTokenExpires : null}}
            );

            //  redirect to success page
            return res.redirect("http://localhost:5173/verification-success");

        } catch (err) {
            console.log(err); 
            return res.redirect("http://localhost:5173/login");
        }
    });

}
