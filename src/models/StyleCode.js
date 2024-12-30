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
    SizeType: {
        type: String,
        enum: ['Inch', 'Cm', 'Alphabetic'],
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

const StyleCode = mongoose.model('StyleCode', styleCodeSchema);
module.exports = StyleCode; // Ensure the model is exported
