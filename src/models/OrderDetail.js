// const mongoose = require('mongoose');

// const OrderDetailSchema = new mongoose.Schema({
//     OrderId: {
//         type: String,
//         required: true,
//     },
//     StyleCodeID: {
//         type: Number,
//         required: true,
//     },
//     RequiredQuantity: {
//         type: Number,
//         required: true,
//     },
//     ScannedQuantity: {
//         type: Number,
//         required: true,
//     },
//     RemainingQuantity: {
//         type: Number,
//         required: true,
//     }
// })

// const OrderDetail = mongoose.model('OrderDetail', OrderDetailSchema);
// module.exports = OrderDetail;



const mongoose = require('mongoose');

const StyleCodeSchema = new mongoose.Schema({
    StyleCodeID: {
        type: Number,
        required: true,
    },
    RequiredQuantity: {
        type: Number,
        required: true,
    },
    ScannedQuantity: {
        type: Number,
        required: true,
    },
    RemainingQuantity: {
        type: Number,
        required: true,
    },
    Status:{
        type: Boolean,
        required: true
    }
});

const OrderDetailSchema = new mongoose.Schema({
    OrderId: {
        type: String,
        required: true,
    },
    StyleCodes: [StyleCodeSchema]  // Array of StyleCode objects
});

const OrderDetail = mongoose.model('OrderDetail', OrderDetailSchema);
module.exports = OrderDetail;

  