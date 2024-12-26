const mongoose = require('mongoose');

const styleCodeSchema = new mongoose.Schema({
    StyleCodeID: {
        type: String, // Changed to String to match the format of "11TM010019"
        required: true,
    },
    StyleCode: {
        type: String,
        required: true,
    },
    ItemWeight: {
        type: Map, // Using a Map to hold weights for different categories
        of: Number, // Each value in the map is a Number
        required: true,
    },
    ItemPackingWeight: {
        type: Number,
        required: true,
    }
});

// Define and export the StyleCode model
const StyleCode = mongoose.model('StyleCode', styleCodeSchema);
module.exports = StyleCode;