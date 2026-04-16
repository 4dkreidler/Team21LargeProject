import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { PORT } from "./config.js";

// IMPORT ROUTES
import authRoutes from "./routes/auth.js";

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect('mongodb+srv://4dkreidler_db_user:db_password@cluster0.cf1ewy8.mongodb.net/?appName=Cluster0')
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ROUTES
app.use("/api", authRoutes);

// TEST ROUTE
app.get('/',(request,response)=>{
    console.log(request)
    return response.status(234).send('Welcome to mern')
})

// START SERVER
app.listen(PORT, ()=> {
    console.log(`App is listenig to port : ${PORT}`);
});