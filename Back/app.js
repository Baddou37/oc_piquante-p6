// use strict mode
'use strict'; 

// load env variables
const dotenv = require("dotenv").config();

// import env variables
const mongodbPassword = process.env.MONGODBPWD;
const mongodbServer = process.env.MONGODBSERVER;
const mongodbId = process.env.MONGODBID;
const protocol = process.env.PROTOCOL;
const endpoint = process.env.ENDPOINT;


// import Express
const express = require("express");

// Call of Express
const app = express();

// DB Piquante URI
const PiquanteUri = process.env.PIQUANTEURI;

// connection to MongoDB
const mongoose = require("mongoose");
mongoose
    .connect(
        PiquanteUri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

// set the headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  next();
});

// DB error handler
const db = mongoose.connection;
db.on("error", (error) => console.error(error));

//Intercept all request who have a json contentType to be able to use tu body.req
app.use(express.json());

// import cors package
const cors = require('cors');

// import the routes
const userRoute = require("./routes/usersRoute");
const sauceRoute = require("./routes/saucesRoute");

// use the routes
app.use("/api/auth", userRoute);
app.use("/api/sauces", sauceRoute);

// import of path
const path = require('path');


// define the path where the image will be store
app.use('/images', express.static(path.join(__dirname, 'images')));

// Give an acces for server.js
module.exports = app;