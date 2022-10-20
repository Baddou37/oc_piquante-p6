'use strict';

// import express
const express = require('express');

// import router
const router = express.Router();

// import the middleware auth 
const auth = require('../middleware/auth');

// import the middleware multer for images
const multer = require('../middleware/multer');

// import sauce controller
const sauceCtrl = require('../controllers/saucesCtrl');

// get all sauces 
router.get('/', auth, sauceCtrl.getAllSauces);

// create sauce
router.post('/', auth, multer, sauceCtrl.createSauce);

// get one sauce
router.get('/:id', auth, sauceCtrl.getOneSauce);

// modify a sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce);

// delete a sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce);

// sauce likes
router.post('/:id/like', auth, sauceCtrl.likes);

// export the router
module.exports = router;