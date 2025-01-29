const mongoose = require('mongoose');

const NumberSavingSchema = new mongoose.Schema({
    Number: {
        type: String,
        required: true,
    }
}, {
    timestamps: true  // Adds `createdAt` and `updatedAt` fields automatically.
});

// Define and export the NumberMaster model
const NumberMaster = mongoose.model('NumberMaster', NumberSavingSchema);
module.exports = NumberMaster;
