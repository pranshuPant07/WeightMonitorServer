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
        const {
            BuyersName,
            PONumber,
            StyleCode,
            ColorCode,
            TotalBoxes,
            GrossWeight,
            NetWeight,
            Quantity
        } = req.body;

        // Validate required fields
        if (
            !BuyersName ||
            !PONumber ||
            !StyleCode ||
            !ColorCode ||
            !TotalBoxes ||
            !GrossWeight ||
            !NetWeight ||
            !Quantity
        ) {
            return res.status(400).json({ message: 'All fields, including PONumber and TotalBoxes, are required.' });
        }

        // Find the matching PONumber in the database
        let poEntry = await CompleteOrders.findOne({ PONumber });

        if (poEntry) {
            // If PONumber exists, calculate the next BoxNumber
            const existingBoxes = poEntry.boxes.length > 0 ? poEntry.boxes[0].data.length : 0;
            const nextBoxNumber = existingBoxes + 1;

            // Validate that the total number of boxes does not exceed TotalBoxes
            if (nextBoxNumber > TotalBoxes) {
                return res.status(400).json({
                    message: `Cannot add more boxes for PO number ${PONumber}. TotalBoxes is limited to ${TotalBoxes}.`,
                });
            }

            // Add the new box details to the existing PO entry
            const newBoxData = {
                BoxNumber: nextBoxNumber.toString(), // Auto-incremented BoxNumber
                TotalBoxes,
                showBoxes: `${nextBoxNumber} of ${TotalBoxes}`,
                GrossWeight,
                NetWeight,
                Quantity,
            };

            // Append the new box data to the first box object
            if (poEntry.boxes.length > 0) {
                poEntry.boxes[0].data.push(newBoxData);
            } else {
                // If no boxes exist, create a new box entry
                poEntry.boxes.push({
                    BuyersName,
                    StyleCode,
                    ColorCode,
                    data: [newBoxData],
                });
            }

            // Save the updated PO entry
            await poEntry.save();

            return res.status(200).json({
                message: `Box added successfully to existing PO number ${PONumber}.`,
                PONumber: poEntry,
            });
        } else {
            // If PONumber does not exist, create a new entry
            const newPO = new CompleteOrders({
                PONumber,
                boxes: [
                    {
                        BuyersName,
                        StyleCode,
                        ColorCode,
                        data: [
                            {
                                BoxNumber: "1", // First box starts with 1
                                TotalBoxes,
                                showBoxes: `1 of ${TotalBoxes}`,
                                GrossWeight,
                                NetWeight,
                                Quantity,
                            },
                        ],
                    },
                ],
            });

            // Save the new PO entry
            await newPO.save();

            return res.status(201).json({
                message: `New PO number ${PONumber} created and box added successfully.`,
                PONumber: newPO,
            });
        }
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
            (sum, box) =>
                sum + box.data.reduce((dataSum, field) => dataSum + (field.Quantity || 0), 0),
            0
        );
        const colorCode = [...new Set(order.boxes.map(box => box.ColorCode))].join(', ') || 'N/A'; // Unique color codes
        const totalBoxCount = order.boxes.reduce((sum, box) => sum + box.data.length, 0); // Total entries in data array
        const printDateTime = new Date().toLocaleString();

        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Add headers
        doc.fontSize(16).text(`Buyer's Name: ${buyerName}`, { align: 'left' });
        doc.fontSize(16).text(`PO Number: ${poNumber}`, { align: 'left' });
        doc.fontSize(16).text(`PO Quantity: ${totalQuantity}`, { align: 'left' });
        doc.fontSize(16).text(`Color Code: ${colorCode}`, { align: 'left' });
        doc.fontSize(16).text(`Total Box Count: ${totalBoxCount}`, { align: 'left' });
        doc.fontSize(16).text(`Print Date and Time: ${printDateTime}`, { align: 'left' });
        doc.moveDown();

        // Define table headers
        const tableHeaders = ["CARTON", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
        const startX = 50;
        const startY = doc.y;
        const columnWidths = [100, 100, 100, 100, 150];

        // Draw bold table headers
        doc.font('Helvetica-Bold').fontSize(10); // Set bold font and smaller size for headers
        tableHeaders.forEach((header, i) => {
            const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.text(header, columnStart, startY, { width: columnWidths[i], align: 'center' });
        });

        // Draw line below headers
        const headerBottomY = doc.y + 5; // Add some space below the headers
        doc.moveTo(startX, headerBottomY)
            .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), headerBottomY)
            .stroke();

        doc.moveDown();

        // Draw table rows with centered alignment
        doc.font('Helvetica').fontSize(10); // Reset to regular font for table rows
        order.boxes.forEach((box) => {
            box.data.forEach((field) => {
                const currentY = doc.y;

                const boxNumber = field.BoxNumber || 'N/A';
                const grossWeight = `${field.GrossWeight || 0} g`;
                const netWeight = `${field.NetWeight || 0} g`;
                const quantity = field.Quantity || 0;
                const createdAt = `${new Date(field.createdAt || box.createdAt).toLocaleString()}`;

                const rowData = [boxNumber, grossWeight, netWeight, quantity, createdAt];

                // Render each column's data centered
                rowData.forEach((text, i) => {
                    const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc.text(text, columnStart, currentY, { width: columnWidths[i], align: 'center' });
                });

                doc.moveDown();
            });
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};