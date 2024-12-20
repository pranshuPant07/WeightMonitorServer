const mongoose = require('mongoose');

const styleCodeSchema = new mongoose.Schema({
    StyleCodeID: {
        type: Number,
        required: true,
    },
    StyleCode: {
        type: String,
        required: true,
    },
    ItemWeight: {
        type: Number,
        required: true,
    },
    ItemPackingWeight: {
        type: Number,
        required: true,
    }
});

// Define and export the Login model
const StyleCode = mongoose.model('StyleCode', styleCodeSchema);
module.exports = StyleCode;