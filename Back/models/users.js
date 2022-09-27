// Import of the mongoose module
const mongoose = require('mongoose');

// Create a schema for the user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Export the model
module.exports = mongoose.model('User', userSchema);