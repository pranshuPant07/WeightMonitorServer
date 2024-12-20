const mongoose = require('mongoose');

const OrderMasterSchema = new mongoose.Schema({
    OrderID: {
        type: Number,
        required: true,
    },
    OrderDate: {
        type: Date,  // Changed from String to Date
        required: true,
    },
    OrderNo: {
        type: Number,
        required: true,
    },
    CustomerName: {
        type: String,
        required: true,
    }
});

// Define and export the OrderMaster model
const OrderMaster = mongoose.model('orderMaster', OrderMasterSchema);
module.exports = OrderMaster;
