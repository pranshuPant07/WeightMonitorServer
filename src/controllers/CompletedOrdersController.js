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
        const {CustomerName, PONumber, GrossWeight, NetWeight, Quantity, ColorCode, TotalBoxes } = req.body;

        // Validate the required fields
        if (!CustomerName||!PONumber || !GrossWeight || !NetWeight || !Quantity || !ColorCode || !TotalBoxes) {
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
        const orders = await CompleteOrder.find(); // Fetch all orders from the DB

        // Calculate required data
        const buyerName = orders[0]?.BuyerName || "Unknown Buyer"; // Assuming BuyerName is stored in the entries
        const poNumber = orders[0]?.PONumber || "Unknown PO"; // Assuming PONumber is stored in the entries
        const totalQuantity = orders.reduce((sum, order) => sum + (order.Quantity || 0), 0); // Total Quantity
        const colorCode = orders.map(order => order.ColorCode).join(", "); // Combine all color codes
        const boxCount = orders.length; // Total number of entries (Box count)
        const printDateTime = new Date().toLocaleString(); // Current date and time

        // Start generating the PDF
        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Add the header details
        doc.fontSize(16).text(`Buyer's Name: ${buyerName}`);
        doc.fontSize(16).text(`PO Number: ${poNumber}`);
        doc.fontSize(16).text(`Total Quantity: ${totalQuantity}`);
        doc.fontSize(16).text(`Color Code: ${colorCode}`);
        doc.fontSize(16).text(`Box Count: ${boxCount}`);
        doc.fontSize(16).text(`Print Date and Time: ${printDateTime}`);
        doc.moveDown();

        // Add the table headers
        doc.fontSize(14).text("CARTON", { continued: true, width: 100 });
        doc.text("Gross Weight", { continued: true, width: 100 });
        doc.text("Net Weight", { continued: true, width: 100 });
        doc.text("Quantity", { continued: true, width: 100 });
        doc.text("Date and Time", { align: "left" });

        doc.moveDown();

        // Render table data
        orders.forEach((order, index) => {
            doc.fontSize(12).text(`${index + 1}`, { continued: true, width: 100 }); // Carton number
            doc.text(`${order.GrossWeight || 0} kg`, { continued: true, width: 100 }); // Gross Weight
            doc.text(`${order.NetWeight || 0} kg`, { continued: true, width: 100 }); // Net Weight
            doc.text(`${order.Quantity || 0}`, { continued: true, width: 100 }); // Quantity
            doc.text(`${new Date(order.createdAt).toLocaleString()}`); // Creation date and time
        });

        doc.end(); // Finalize the PDF
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};
