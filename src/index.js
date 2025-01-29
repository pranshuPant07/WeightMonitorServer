const express = require('express');
const routes = require('./routes/styleCodeRoutes');
const connectDB = require('./config/db');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

// Enable CORS (you can specify the allowed origin for more security)
app.use(cors({
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// Connect to the database
connectDB();

// Register routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});