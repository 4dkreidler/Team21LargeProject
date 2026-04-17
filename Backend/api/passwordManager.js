require('express');
require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
const bcrypt = require('bcrypt');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();


exports.setApp = function(app, client)
{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    
    //emailpassword
    app.post('/api/emailpassword', async(req, res) => 
    {
        //incoming: email 
        //outgoing: error
        const {email} = req.body; 

        try{
            //MongoDB connection
            const db = client.db('pantry'); 
            const user = await db.collection('users').findOne({email:email});

            //if user doesn't exist
            if(!user)
            {
                return res.status(404).json({error: "No user tied to this email"}); 
            }

            //if email is not validated 
            if(!user.validated)
            {
                return res.status(400).json({error: "User email not validated"}); 
            }

            //Generate token for password reset 
            const token = crypto.randomBytes(32).toString("hex");
            
            //add token to verificiationToken
            await db.collection('users').updateOne(
                {email:email}, 
                {$set: {verificationToken : token, verificationTokenExpires : Date.now() + 1000 * 60 * 30 }})//30 min token

            //Backend verify link
            const verifyURL = `http://localhost:5173/reset-password/${token}`;

            //send email
            await transporter.sendMail({
                to: email,
                subject: "Reset your password",
                html: `
                    <h2>Password Reset</h2>
                    <p>Click below to change your password:</p>
                    <a href="${verifyURL}">${verifyURL}</a>
                `
            });
            return res.status(200).json({ message: "Email sent successfully" });

        }catch(err){
            console.log(err); 
            return res.status(400).json({error: "Internal server error"});
        }
    });

    //resetpassword
    app.post('/api/resetpassword/:token', async(req, res) => 
    {
        //incoming: newPassword
        //outoging: error
        const {token} = req.params; 
        const {newPassword} = req.body; 
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
                return res.status(404).json({error: "No verificationToken match"}); 
            }

            //user found but token expired
            if(Date.now() >= user.verificationTokenExpires){
                //redirect to error page
                return res.status(400).json({error: "Password reset link expired"});
            }

            //update password and  null verification token 
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.collection('users').updateOne(
                {email: user.email },
                {$set: {password: hashedPassword, verificationToken : null, verificationTokenExpires : null}}
            );

            //return no error
            return res.status(200).json({error: ""});

        } catch (err) {
            console.log(err);             
            return res.status(400).json({error: "Internal server error"});
        }
    });
}
