require('express');
require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();
import { buildPath } from "./Frontend/src/utils/Path";

exports.setApp = function(app, client)
{
    const transporter = nodemailer.createTransport({
        service: 'gmail.com',
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
        const email = req.body; 

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
            const verifyURL = `http://localhost:5555/resetpassword/${token}`;

            //send email
            await transporter.sendMail({
                to: email,
                subject: "Reset your password",
                html: `
                    <h2>Email Verification</h2>
                    <p>Click below to verify your account:</p>
                    <a href="${verifyURL}">${verifyURL}</a>
                `
            });

        }catch(err){
            console.log(err); 
            return res.status(400).json({error: "Internal server error"});
        }
    });

    //resetpassword
    app.post('/resetpassword/:token', async(req, res) => 
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
            await db.collection('users').updateOne(
                {email: user.email },
                {$set: {password: newPassword, verificationToken : null, verificationTokenExpires : null}}
            );

            //return no error
            return res.status(200).json({error: ""});

        } catch (err) {
            console.log(err);             
            return res.status(400).json({error: "Internal server error"});
        }
    });
}