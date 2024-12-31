const mongoose = require('mongoose');

const CompletedOrderSchema = new mongoose.Schema({
    BoxNumber: {
        type: String,
        required: true,
    },
    TotalBoxes: {
        type: Number,
        required: true,
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
    }
});

// Define and export the OrderMaster model
const CompleteOrders = mongoose.model('CompletedOrders', CompletedOrderSchema);
module.exports = CompleteOrders;
