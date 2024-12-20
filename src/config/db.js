const mongoose = require('mongoose');
require('dotenv').config();  // Ensure dotenv is required to load variables from .env file

// MongoDB connection function
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;  // Use the URI from the .env file
        if (!uri) {
            throw new Error("MongoDB URI is not defined in .env file");
        }
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
