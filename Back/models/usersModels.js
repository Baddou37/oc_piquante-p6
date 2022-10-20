// Import of the mongoose module
const mongoose = require('mongoose');

// Import Unique Validator
const uniqueValidator = require('mongoose-unique-validator');

// Create a schema for the user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Apply the uniqueValidator plugin to userSchema
userSchema.plugin(uniqueValidator);

// Export the model
module.exports = mongoose.model('User', userSchema);