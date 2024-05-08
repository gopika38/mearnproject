const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
const app = express();
const Routes = require("./routes/route.js");
const generateFees = require('./utils/generateFees');  // Ensure this path is correctly pointing to your fee generation utility

const PORT = process.env.PORT || 5000;

dotenv.config();

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// MongoDB connection setup
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// API Routes
app.use('/', Routes);

// Simple home route
app.get('/', (req, res) => {
    res.send('<h1>Server started and waiting for the client request!!!</h1>');
});

// Cron job for fee generation, scheduled at the beginning of each month at midnight, IST
cron.schedule('0 0 1 * *', () => {
    generateFees();
    console.log("Monthly fees generation task ran.");
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"  // Set to Indian Standard Time
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`);
});
