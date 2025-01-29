// const mongoose = require('mongoose');
// require('dotenv').config();  // Ensure dotenv is required to load variables from .env file

// // MongoDB connection function
// const connectDB = async () => {
//     try {
//         const mongoURI = "mongodb://localhost:27017/myLocalDatabase";
//         // Use the URI from the .env file
//         if (!mongoURI) {
//             throw new Error("MongoDB URI is not defined in .env file");
//         }
//         await mongoose.connect(mongoURI);
//         console.log('Connected to MongoDB');
//     } catch (error) {
//         console.error('MongoDB connection error:', error);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');
require('dotenv').config();  // Ensure dotenv is required to load variables from .env file

// MongoDB connection function
const connectDB = async () => {
    try {
        // Check for mongoURI in .env file, otherwise use local URI
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/myLocalDatabase";

        // If mongoURI is still undefined or empty (though unlikely with the fallback above)
        if (!mongoURI) {
            throw new Error("MongoDB URI is not defined in .env file and fallback to local URI failed");
        }

        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
