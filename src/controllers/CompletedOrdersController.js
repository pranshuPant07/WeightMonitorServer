const CompleteOrders = require('../models/CompletedOrders');
const PDFDocument = require('pdfkit');

exports.getCompleteOrderDetails = async (req, res) => {
    try {
        const { PONumber } = req.body; // Get the PONumber from the request body

        if (!PONumber) {
            // If no PONumber is provided, fetch all PONumbers with their boxes
            const allOrders = await CompleteOrders.find({});

            if (allOrders.length === 0) {
                return res.status(404).json({ message: 'No completed orders found.' });
            }

            return res.status(200).json({
                message: 'All completed orders fetched successfully.',
                orders: allOrders.map(order => ({
                    PONumber: order.PONumber,
                    boxes: order.boxes.map(box => ({
                        BuyersName: box.BuyersName,
                        StyleCode: box.StyleCode,
                        ColorCode: box.ColorCode,
                        data: box.data
                    }))
                })),
            });
        }

        // Fetch orders for the specific PONumber
        const poOrders = await CompleteOrders.findOne({ PONumber });

        if (!poOrders) {
            return res.status(404).json({ message: `No orders found for PO number ${PONumber}.` });
        }

        res.status(200).json({
            message: `Orders fetched successfully for PO number ${PONumber}.`,
            orders: {
                PONumber: poOrders.PONumber,
                boxes: poOrders.boxes.map(box => ({
                    BuyersName: box.BuyersName,
                    StyleCode: box.StyleCode,
                    ColorCode: box.ColorCode,
                    data: box.data
                }))
            },
        });
    } catch (error) {
        console.error('Error fetching complete orders:', error);
        res.status(500).json({
            message: 'An error occurred while fetching complete orders.',
            error: error.message,
        });
    }
};



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

// exports.getCompleteOrderDetails = async (req, res) => {
//     try {
//         const { PONumber } = req.body; // Get the PONumber from the request body

//         if (!PONumber) {
//             // If no PONumber is provided, fetch all PONumbers with their boxes
//             const allOrders = await CompleteOrder.find({});

//             if (allOrders.length === 0) {
//                 return res.status(404).json({ message: 'No completed orders found.' });
//             }

//             return res.status(200).json({
//                 message: 'All completed orders fetched successfully.',
//                 orders: allOrders,
//             });
//         }

//         // Fetch orders for the specific PONumber
//         const poOrders = await CompleteOrder.findOne({ PONumber });

//         if (!poOrders) {
//             return res.status(404).json({ message: `No orders found for PO number ${PONumber}.` });
//         }

//         res.status(200).json({
//             message: `Orders fetched successfully for PO number ${PONumber}.`,
//             orders: poOrders, // Changed from `PONumber` to `orders` for consistency
//         });
//     } catch (error) {
//         console.error('Error fetching complete orders:', error);
//         res.status(500).json({
//             message: 'An error occurred while fetching complete orders.',
//             error: error.message,
//         });
//     }
// };




// exports.addCompleteOrdersDetails = async (req, res) => {
//     try {
//         // Extract data from the request body
//         const { CustomerName, PONumber, GrossWeight, NetWeight, Quantity, ColorCode, TotalBoxes } = req.body;

//         // Validate the required fields
//         if (!CustomerName || !PONumber || !GrossWeight || !NetWeight || !Quantity || !ColorCode || !TotalBoxes) {
//             return res.status(400).json({ message: 'All fields, including PONumber and TotalBoxes, are required.' });
//         }

//         // Find or create the PONumber document
//         let poEntry = await CompleteOrder.findOne({ PONumber });

//         if (!poEntry) {
//             poEntry = new CompleteOrder({ PONumber, boxes: [] });
//         }

//         // Calculate the next box number for the PO
//         const nextBoxNumber = poEntry.boxes.length + 1;

//         // Validate that the next box number does not exceed the total boxes
//         if (nextBoxNumber > TotalBoxes) {
//             return res.status(400).json({
//                 message: `Cannot add more boxes for PO number ${PONumber}. TotalBoxes is limited to ${TotalBoxes}.`,
//             });
//         }

//         // Create the new box entry
//         const newBox = {
//             CustomerName,
//             BoxNumber: nextBoxNumber.toString(),
//             showBoxes: `${nextBoxNumber} of ${TotalBoxes}`,
//             GrossWeight,
//             NetWeight,
//             Quantity,
//             ColorCode,
//             TotalBoxes,
//         };

//         // Add the new box to the PO entry
//         poEntry.boxes.push(newBox);

//         // Save the updated PO entry
//         await poEntry.save();

//         // Fetch all boxes for the updated PONumber
//         const updatedPO = await CompleteOrder.findOne({ PONumber });

//         res.status(201).json({
//             message: `Box added successfully for PO number ${PONumber}.`,
//             PONumber: updatedPO,
//         });
//     } catch (error) {
//         console.error('Error saving order:', error);
//         res.status(500).json({
//             message: 'An error occurred while saving the order.',
//             error: error.message,
//         });
//     }
// };


exports.addCompleteOrdersDetails = async (req, res) => {
    try {
        // Extract data from the request body
        const {
            BuyersName,
            PONumber,
            StyleCode,
            ColorCode,
            BoxNumber,
            TotalBoxes,
            GrossWeight,
            NetWeight,
            Quantity
        } = req.body;

        // Validate the required fields
        if (
            !BuyersName ||
            !PONumber ||
            !StyleCode ||
            !ColorCode ||
            !BoxNumber ||
            !TotalBoxes ||
            !GrossWeight ||
            !NetWeight ||
            !Quantity
        ) {
            return res.status(400).json({ message: 'All fields, including PONumber, BoxNumber, and TotalBoxes, are required.' });
        }

        // Find or create the PONumber document
        let poEntry = await CompleteOrders.findOne({ PONumber });

        if (!poEntry) {
            poEntry = new CompleteOrders({ PONumber, boxes: [] });
        }

        // Check if the box number already exists
        const existingBox = poEntry.boxes.find(box => box.data.some(field => field.BoxNumber === BoxNumber));
        if (existingBox) {
            return res.status(400).json({
                message: `Box number ${BoxNumber} already exists for PO number ${PONumber}.`,
            });
        }

        // Validate that the total number of boxes does not exceed the allowed TotalBoxes
        if (poEntry.boxes.length >= TotalBoxes) {
            return res.status(400).json({
                message: `Cannot add more boxes for PO number ${PONumber}. TotalBoxes is limited to ${TotalBoxes}.`,
            });
        }

        // Create the new box entry
        const newBox = {
            BuyersName,
            StyleCode,
            ColorCode,
            data: [
                { BoxNumber },
                { TotalBoxes },
                { showBoxes: `${BoxNumber} of ${TotalBoxes}` },
                { GrossWeight },
                { NetWeight },
                { Quantity },
            ],
        };

        // Add the new box to the PO entry
        poEntry.boxes.push(newBox);

        // Save the updated PO entry
        await poEntry.save();

        // Fetch all boxes for the updated PONumber
        const updatedPO = await CompleteOrders.findOne({ PONumber });

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



// exports.exportCompleteOrders = async (req, res) => {
//     try {
//         const { selectedPO } = req.query;

//         // Check if selectedPO is provided
//         if (!selectedPO) {
//             return res.status(400).send('PO number is required.');
//         }

//         // Find matching orders
//         const orders = await CompleteOrder.find({ PONumber: selectedPO });

//         if (orders.length === 0) {
//             return res.status(404).send('No matching orders found for the provided PO.');
//         }

//         const doc = new PDFDocument();
//         res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
//         res.setHeader('Content-type', 'application/pdf');

//         doc.pipe(res);

//         // Add headers
//         doc.fontSize(18).text(`Completed Orders for PO: ${selectedPO}`, { align: 'center' });
//         doc.moveDown();

//         // Define table headers
//         const tableHeaders = ["CARTON", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
//         const startX = 50;
//         const startY = doc.y;
//         const columnWidths = [50, 100, 100, 100, 200];

//         // Draw table headers with smaller font size
//         doc.fontSize(10); // Decrease the font size for headers
//         tableHeaders.forEach((header, i) => {
//             doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
//         });

//         doc.moveDown();

//         // Draw table rows
//         orders.forEach((order) => {
//             if (order.boxes && Array.isArray(order.boxes)) {
//                 order.boxes.forEach((box) => {
//                     const currentY = doc.y;

//                     // Draw each column
//                     doc.text(`${box.BoxNumber || 'N/A'}`, startX, currentY, { width: columnWidths[0] }); // Use boxNumber instead of index
//                     doc.text(`${box.GrossWeight || 0} g`, startX + columnWidths[0], currentY, { width: columnWidths[1] });
//                     doc.text(`${box.NetWeight || 0} g`, startX + columnWidths.slice(0, 2).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[2] });
//                     doc.text(`${box.Quantity || 0}`, startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[3] });
//                     doc.text(`${new Date(box.createdAt).toLocaleString()}`, startX + columnWidths.slice(0, 4).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[4] });

//                     doc.moveDown();
//                 });
//             }
//         });


//         doc.end();
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };


// exports.exportCompleteOrders = async (req, res) => {
//     try {
//         const { selectedPO } = req.query;

//         // Check if selectedPO is provided
//         if (!selectedPO) {
//             return res.status(400).send('PO number is required.');
//         }

//         // Find matching orders
//         const orders = await CompleteOrder.find({ PONumber: selectedPO });

//         if (orders.length === 0) {
//             return res.status(404).send('No matching orders found for the provided PO.');
//         }

//         // Extract additional data for the headers
//         const buyerName = orders[0]?.BuyerName || 'Unknown Buyer'; // Assuming BuyerName exists in the orders
//         const poNumber = selectedPO;
//         const totalQuantity = orders.reduce(
//             (sum, order) => sum + (order.boxes?.reduce((boxSum, box) => boxSum + (box.Quantity || 0), 0) || 0),
//             0
//         );
//         const colorCode = orders.map(order => order.ColorCode).join(', ') || 'N/A';
//         const totalBoxCount = orders.reduce((sum, order) => sum + (order.boxes?.length || 0), 0);
//         const printDateTime = new Date().toLocaleString();

//         const doc = new PDFDocument();
//         res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
//         res.setHeader('Content-type', 'application/pdf');

//         doc.pipe(res);

//         // Add headers
//         doc.fontSize(18).text(`Buyer's Name: ${buyerName}`, { align: 'left' });
//         doc.fontSize(18).text(`PO Number: ${poNumber}`, { align: 'left' });
//         doc.fontSize(18).text(`PO Quantity: ${totalQuantity}`, { align: 'left' });
//         doc.fontSize(18).text(`Color Code: ${colorCode}`, { align: 'left' });
//         doc.fontSize(18).text(`Total Box Count: ${totalBoxCount}`, { align: 'left' });
//         doc.fontSize(18).text(`Print Date and Time: ${printDateTime}`, { align: 'left' });
//         doc.moveDown();

//         // Define table headers
//         const tableHeaders = ["CARTON", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
//         const startX = 50;
//         const startY = doc.y;
//         const columnWidths = [50, 100, 100, 100, 200];

//         // Draw table headers with smaller font size
//         doc.fontSize(10); // Decrease the font size for headers
//         tableHeaders.forEach((header, i) => {
//             doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
//         });

//         doc.moveDown();

//         // Draw table rows
//         orders.forEach((order) => {
//             if (order.boxes && Array.isArray(order.boxes)) {
//                 order.boxes.forEach((box) => {
//                     const currentY = doc.y;

//                     // Draw each column
//                     doc.text(`${box.BoxNumber || 'N/A'}`, startX, currentY, { width: columnWidths[0] });
//                     doc.text(`${box.GrossWeight || 0} g`, startX + columnWidths[0], currentY, { width: columnWidths[1] });
//                     doc.text(`${box.NetWeight || 0} g`, startX + columnWidths.slice(0, 2).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[2] });
//                     doc.text(`${box.Quantity || 0}`, startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[3] });
//                     doc.text(`${new Date(box.createdAt).toLocaleString()}`, startX + columnWidths.slice(0, 4).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[4] });

//                     doc.moveDown();
//                 });
//             }
//         });

//         doc.end();
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };


exports.exportCompleteOrders = async (req, res) => {
    try {
        const { selectedPO } = req.query;

        // Check if selectedPO is provided
        if (!selectedPO) {
            return res.status(400).send('PO number is required.');
        }

        // Find matching orders
        const order = await CompleteOrders.findOne({ PONumber: selectedPO });

        if (!order) {
            return res.status(404).send('No matching orders found for the provided PO.');
        }

        // Extract additional data for the headers
        const buyerName = order.boxes[0]?.BuyersName || 'Unknown Buyer'; // Assuming BuyersName exists in the boxes
        const poNumber = selectedPO;
        const totalQuantity = order.boxes.reduce(
            (sum, box) => sum + (box.data.find(field => field.Quantity)?.Quantity || 0),
            0
        );
        const colorCode = order.boxes.map(box => box.ColorCode).join(', ') || 'N/A';
        const totalBoxCount = order.boxes.length;
        const printDateTime = new Date().toLocaleString();

        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Add headers
        doc.fontSize(18).text(`Buyer's Name: ${buyerName}`, { align: 'left' });
        doc.fontSize(18).text(`PO Number: ${poNumber}`, { align: 'left' });
        doc.fontSize(18).text(`PO Quantity: ${totalQuantity}`, { align: 'left' });
        doc.fontSize(18).text(`Color Code: ${colorCode}`, { align: 'left' });
        doc.fontSize(18).text(`Total Box Count: ${totalBoxCount}`, { align: 'left' });
        doc.fontSize(18).text(`Print Date and Time: ${printDateTime}`, { align: 'left' });
        doc.moveDown();

        // Define table headers
        const tableHeaders = ["CARTON", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
        const startX = 50;
        const startY = doc.y;
        const columnWidths = [50, 100, 100, 100, 200];

        // Draw table headers with smaller font size
        doc.fontSize(10); // Decrease the font size for headers
        tableHeaders.forEach((header, i) => {
            doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
        });

        doc.moveDown();

        // Draw table rows
        order.boxes.forEach((box) => {
            const currentY = doc.y;

            const boxNumber = box.data.find(field => field.BoxNumber)?.BoxNumber || 'N/A';
            const grossWeight = box.data.find(field => field.GrossWeight)?.GrossWeight || 0;
            const netWeight = box.data.find(field => field.NetWeight)?.NetWeight || 0;
            const quantity = box.data.find(field => field.Quantity)?.Quantity || 0;
            const createdAt = box.data.find(field => field.createdAt)?.createdAt || box.createdAt;

            // Draw each column
            doc.text(boxNumber, startX, currentY, { width: columnWidths[0] });
            doc.text(`${grossWeight} g`, startX + columnWidths[0], currentY, { width: columnWidths[1] });
            doc.text(`${netWeight} g`, startX + columnWidths.slice(0, 2).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[2] });
            doc.text(quantity, startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[3] });
            doc.text(`${new Date(createdAt).toLocaleString()}`, startX + columnWidths.slice(0, 4).reduce((a, b) => a + b, 0), currentY, { width: columnWidths[4] });

            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};