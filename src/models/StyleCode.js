const mongoose = require('mongoose');

const styleCodeSchema = new mongoose.Schema({
    StyleCodeID: {
        type: String,
        required: true,
    },
    StyleCode: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    Color: {
        type: String,
        required: true,
    },
    SizeType: { // Add this field
        type: String,
        enum: ['Inch', 'Cm', 'Alpha'], // Limit to valid size types
        required: true,
    },
    ItemWeight: {
        type: Map,
        of: Number,
        required: true,
    },
    ItemPackingWeight: {
        type: Number,
        required: true,
    },
});

// Define and export the StyleCode model
const StyleCode = mongoose.model('StyleCode', styleCodeSchema);
module.exports = StyleCode;
