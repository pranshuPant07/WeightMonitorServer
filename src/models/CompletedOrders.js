// const mongoose = require('mongoose');

// const BoxSchema = new mongoose.Schema({
//     CustomerName: {
//         type: String,
//         required: true,
//     },
//     BoxNumber: {
//         type: String,
//         required: true,
//     },
//     TotalBoxes: {
//         type: Number,
//         required: true,
//     },
//     showBoxes: {
//         type: String,
//     },
//     GrossWeight: {
//         type: Number,
//         required: true,
//     },
//     NetWeight: {
//         type: Number,
//         required: true,
//     },
//     Quantity: {
//         type: Number,
//         required: true,
//     },
//     ColorCode: {
//         type: String,
//         required: true,
//     },
// }, { timestamps: true });

// const PONumberSchema = new mongoose.Schema({
//     PONumber: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     boxes: [BoxSchema],
// }, { timestamps: true });

// const CompleteOrders = mongoose.model('CompleteOrders', PONumberSchema);
// module.exports = CompleteOrders;



// const mongoose = require('mongoose');

// const BoxSchema = new mongoose.Schema({
//     BuyersName: {
//         type: String, // Corresponds to "Buyers name"
//         required: true,
//     },
//     StyleCode: {
//         type: String, // Corresponds to "Style Code"
//         required: true,
//     },
//     ColorCode: {
//         type: String, // Corresponds to "Color Code"
//         required: true,
//     },
//     data: [
//         {
//             BoxNumber: { type: String, required: true },
//             TotalBoxes: { type: Number, required: true },
//             showBoxes: { type: String, required: true },
//             GrossWeight: { type: Number, required: true },
//             NetWeight: { type: Number, required: true },
//             Quantity: { type: Number, required: true },

//         }
//     ],
// }, { timestamps: true });

// const PONumberSchema = new mongoose.Schema({
//     PONumber: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     boxes: [BoxSchema],
// }, { timestamps: true });

// const CompleteOrders = mongoose.model('CompleteOrders', PONumberSchema);
// module.exports = CompleteOrders;



const mongoose = require('mongoose');

const BoxSchema = new mongoose.Schema({
    BuyersName: {
        type: String, // Corresponds to "Buyers name"
        required: true,
    },
    StyleCode: {
        type: String, // Corresponds to "Style Code"
        required: true,
    },
    ColorCode: {
        type: String, // Corresponds to "Color Code"
        required: true,
    },
    data: [
        {
            BoxNumber: { type: String, required: true },
            TotalBoxes: { type: Number, required: true },
            showBoxes: { type: String, required: true },
            GrossWeight: { type: Number, required: true },
            NetWeight: { type: Number, required: true },
            Quantity: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }, // Timestamp for each object in the data array
        }
    ],
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
