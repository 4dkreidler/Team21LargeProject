require('express');
require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();

exports.setApp = function ( app, client )
{
    const transporter = nodemailer.createTransport({
    service: 'gmail.com',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
    });

    //login api
    app.post('/api/login', async (req, res, next) =>
{
    const { email, password } = req.body;

    const db = client.db('pantry');
    const results = await db.collection('users')
        .find({ email: email, password: password })
        .toArray();

    if (results.length === 0) {
        return res.status(200).json({
            id: -1,
            firstName: '',
            lastName: '',
            houseID: '-1',
            error: ''
        });
    }

    const user = results[0];

    return res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        houseID: user.houseID || '-1',
        error: ''
    });
});

    //register api
    app.post('/api/register', async (req, res, next) =>
    {
        // incoming: firstName, lastName, email, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { firstName, lastName, email, password } = req.body;
        var houseID = '-1'; 

        try {
            //MongoDB connection
            const db = client.db('pantry');
            const existingUser = await db.collection('users').findOne({ email });

            //If user already exists 
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }

            //Generate token for email verification
            const token = crypto.randomBytes(32).toString("hex");

            //Create new User
            const newUser = {
                firstName,
                lastName,
                email,
                password,
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
            var ret = { id: result.insertedId, firstName: firstName, lastName: lastName, error: error };
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