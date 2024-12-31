const mongoose = require('mongoose');

const BoxSchema = new mongoose.Schema({
    BoxNumber: {
        type: String,
        required: true,
    },
    TotalBoxes: {
        type: Number,
        required: true,
    },
    showBoxes: {
        type: String,
    },
    GrossWeight: {
        type: Number,
        required: true,
    },
    NetWeight: {
        type: Number,
        required: true,
    },
    Quantity: {
        type: Number,
        required: true,
    },
    ColorCode: {
        type: String,
        required: true,
    },
});

const PONumberSchema = new mongoose.Schema({
    PONumber: {
        type: String,
        required: true,
        unique: true,
    },
    boxes: [BoxSchema],
});

const CompleteOrders = mongoose.model('CompleteOrders', PONumberSchema);
module.exports = CompleteOrders;
