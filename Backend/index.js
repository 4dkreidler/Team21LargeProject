import express from "express";
import { PORT } from "./config.js";


const app = express();

app.get('/',(request,response)=>{
    console.log(request)
    return response.status(234).send('Welcome to mern')
})

app.listen(PORT, ()=> {
    console.log(`App is listenig to port : ${PORT}`);
});