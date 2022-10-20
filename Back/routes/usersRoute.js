// Use strict mode
'use strict';

// import express
const express = require("express");

// import the router
const router = express.Router();

// import the user controller
const userController = require("../controllers/usersCtrl");

// sign up route
router.post("/signup", userController.signup);

// login route
router.post("/login", userController.login);

// export the router
module.exports = router;
