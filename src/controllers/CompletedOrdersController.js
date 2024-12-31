const CompleteOrder = require('../models/CompletedOrders');
const PDFDocument = require('pdfkit');


// exports.addCompleteOrdersDetails = async (req, res) => {
//     try {
//         // Extract order details from the request body
//         const { BoxNumber, GrossWeight, NetWeight, Quantity, ColorCode } = req.body;

//         // Validate the required fields
//         if (!BoxNumber || !GrossWeight || !NetWeight || !Quantity || !ColorCode) {
//             return res.status(400).json({ message: 'All fields are required.' });
//         }

//         // Create a new order document
//         const newOrder = new CompleteOrder({
//             BoxNumber,
//             GrossWeight,
//             NetWeight,
//             Quantity,
//             ColorCode,
//         });

//         // Save the document to the database
//         const savedOrder = await newOrder.save();

//         // Respond with the saved order details
//         res.status(201).json({
//             message: 'Order saved successfully.',
//             order: savedOrder,
//         });
//     } catch (error) {
//         console.error('Error saving order:', error);
//         res.status(500).json({
//             message: 'An error occurred while saving the order.',
//             error: error.message,
//         });
//     }
// };

exports.getCompleteOrderDetails = async (req, res) => {
    try {
        const { PONumber } = req.body; // Get the PONumber from the request body

        if (!PONumber) {
            // If no PONumber is provided, fetch all PONumbers with their boxes
            const allOrders = await CompleteOrder.find({});

            if (allOrders.length === 0) {
                return res.status(404).json({ message: 'No completed orders found.' });
            }

            return res.status(200).json({
                message: 'All completed orders fetched successfully.',
                orders: allOrders,
            });
        }

        // Fetch orders for the specific PONumber
        const poOrders = await CompleteOrder.findOne({ PONumber });

        if (!poOrders) {
            return res.status(404).json({ message: `No orders found for PO number ${PONumber}.` });
        }

        res.status(200).json({
            message: `Orders fetched successfully for PO number ${PONumber}.`,
            orders: poOrders, // Changed from `PONumber` to `orders` for consistency
        });
    } catch (error) {
        console.error('Error fetching complete orders:', error);
        res.status(500).json({
            message: 'An error occurred while fetching complete orders.',
            error: error.message,
        });
    }
};




exports.addCompleteOrdersDetails = async (req, res) => {
    try {
        // Extract data from the request body
        const { CustomerName, PONumber, GrossWeight, NetWeight, Quantity, ColorCode, TotalBoxes } = req.body;

        // Validate the required fields
        if (!CustomerName || !PONumber || !GrossWeight || !NetWeight || !Quantity || !ColorCode || !TotalBoxes) {
            return res.status(400).json({ message: 'All fields, including PONumber and TotalBoxes, are required.' });
        }

        // Find or create the PONumber document
        let poEntry = await CompleteOrder.findOne({ PONumber });

        if (!poEntry) {
            poEntry = new CompleteOrder({ PONumber, boxes: [] });
        }

        // Calculate the next box number for the PO
        const nextBoxNumber = poEntry.boxes.length + 1;

        // Validate that the next box number does not exceed the total boxes
        if (nextBoxNumber > TotalBoxes) {
            return res.status(400).json({
                message: `Cannot add more boxes for PO number ${PONumber}. TotalBoxes is limited to ${TotalBoxes}.`,
            });
        }

        // Create the new box entry
        const newBox = {
            CustomerName,
            BoxNumber: nextBoxNumber.toString(),
            showBoxes: `${nextBoxNumber} of ${TotalBoxes}`,
            GrossWeight,
            NetWeight,
            Quantity,
            ColorCode,
            TotalBoxes,
        };

        // Add the new box to the PO entry
        poEntry.boxes.push(newBox);

        // Save the updated PO entry
        await poEntry.save();

        // Fetch all boxes for the updated PONumber
        const updatedPO = await CompleteOrder.findOne({ PONumber });

        res.status(201).json({
            message: `Box added successfully for PO number ${PONumber}.`,
            PONumber: updatedPO,
        });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({
            message: 'An error occurred while saving the order.',
            error: error.message,
        });
    }
};



exports.exportCompleteOrders = async (req, res) => {
    try {
        const { selectedPO } = req.query;

        // Check if selectedPO is provided
        if (!selectedPO) {
            return res.status(400).send('PO number is required.');
        }

        // Find matching orders
        const orders = await CompleteOrder.find({ PONumber: selectedPO });

        if (orders.length === 0) {
            return res.status(404).send('No matching orders found for the provided PO.');
        }

        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Add headers
        doc.fontSize(18).text(`Completed Orders for PO: ${selectedPO}`, { align: 'center' });
        doc.moveDown();

        // Table headers
        doc.fontSize(14).text("CARTON", { continued: true, width: 100 });
        doc.text("Gross Weight", { continued: true, width: 100 });
        doc.text("Net Weight", { continued: true, width: 100 });
        doc.text("Quantity", { continued: true, width: 100 });
        doc.text("Date and Time", { align: "left" });

        doc.moveDown();

        // Table content
        orders.forEach((order, index) => {
            doc.fontSize(12).text(`${index + 1}`, { continued: true, width: 100 });
            doc.text(`${order.GrossWeight || 0} kg`, { continued: true, width: 100 });
            doc.text(`${order.NetWeight || 0} kg`, { continued: true, width: 100 });
            doc.text(`${order.Quantity || 0}`, { continued: true, width: 100 });
            doc.text(`${new Date(order.createdAt).toLocaleString()}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};
