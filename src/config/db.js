const mongoose = require('mongoose');
require('dotenv').config();  // Ensure dotenv is required to load variables from .env file

// MongoDB connection function
const connectDB = async () => {
    try {
        const mongoURI = "mongodb://localhost:27017/myLocalDatabase";
        // Use the URI from the .env file
        if (!mongoURI) {
            throw new Error("MongoDB URI is not defined in .env file");
        }
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
