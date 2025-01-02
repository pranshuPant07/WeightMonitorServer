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
//         const {
//             BuyersName,
//             PONumber,
//             StyleCode,
//             ColorCode,
//             TotalBoxes,
//             GrossWeight,
//             NetWeight,
//             Quantity
//         } = req.body;

//         // Validate required fields
//         if (
//             !BuyersName ||
//             !PONumber ||
//             !StyleCode ||
//             !ColorCode ||
//             !TotalBoxes ||
//             !GrossWeight ||
//             !NetWeight ||
//             !Quantity
//         ) {
//             return res.status(400).json({ message: 'All fields, including PONumber and TotalBoxes, are required.' });
//         }

//         // Find the matching PONumber in the database
//         let poEntry = await CompleteOrders.findOne({ PONumber });

//         if (poEntry) {
//             // If PONumber exists, calculate the next BoxNumber
//             const existingBoxes = poEntry.boxes.length > 0 ? poEntry.boxes[0].data.length : 0;
//             const nextBoxNumber = existingBoxes + 1;

//             // Validate that the total number of boxes does not exceed TotalBoxes
//             if (nextBoxNumber > TotalBoxes) {
//                 return res.status(400).json({
//                     message: `Cannot add more boxes for PO number ${PONumber}. TotalBoxes is limited to ${TotalBoxes}.`,
//                 });
//             }

//             // Add the new box details to the existing PO entry
//             const newBoxData = {
//                 BoxNumber: nextBoxNumber.toString(), // Auto-incremented BoxNumber
//                 TotalBoxes,
//                 showBoxes: `${nextBoxNumber} of ${TotalBoxes}`,
//                 GrossWeight,
//                 NetWeight,
//                 Quantity,
//             };

//             // Append the new box data to the first box object
//             if (poEntry.boxes.length > 0) {
//                 poEntry.boxes[0].data.push(newBoxData);
//             } else {
//                 // If no boxes exist, create a new box entry
//                 poEntry.boxes.push({
//                     BuyersName,
//                     StyleCode,
//                     ColorCode,
//                     data: [newBoxData],
//                 });
//             }

//             // Save the updated PO entry
//             await poEntry.save();

//             return res.status(200).json({
//                 message: `Box added successfully to existing PO number ${PONumber}.`,
//                 PONumber: poEntry,
//             });
//         } else {
//             // If PONumber does not exist, create a new entry
//             const newPO = new CompleteOrders({
//                 PONumber,
//                 boxes: [
//                     {
//                         BuyersName,
//                         StyleCode,
//                         ColorCode,
//                         data: [
//                             {
//                                 BoxNumber: "1", // First box starts with 1
//                                 TotalBoxes,
//                                 showBoxes: `1 of ${TotalBoxes}`,
//                                 GrossWeight,
//                                 NetWeight,
//                                 Quantity,
//                             },
//                         ],
//                     },
//                 ],
//             });

//             // Save the new PO entry
//             await newPO.save();

//             return res.status(201).json({
//                 message: `New PO number ${PONumber} created and box added successfully.`,
//                 PONumber: newPO,
//             });
//         }
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

        // Log incoming request body
        console.log("Request Body:", req.body);

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
            console.error("Validation Failed: Missing Required Fields.");
            return res.status(400).json({ message: 'All fields, including PONumber and TotalBoxes, are required.' });
        }

        // Find the matching PONumber in the database
        console.log(`Checking for existing PONumber: ${PONumber}`);
        let poEntry = await CompleteOrders.findOne({ PONumber });

        if (poEntry) {
            console.log(`PONumber ${PONumber} found in database.`);

            // Calculate the next BoxNumber
            const existingBoxes = poEntry.boxes.length > 0 ? poEntry.boxes[0].data.length : 0;
            const nextBoxNumber = existingBoxes + 1;

            console.log(`Existing Boxes: ${existingBoxes}, Next Box Number: ${nextBoxNumber}`);

            // Validate that the total number of boxes does not exceed TotalBoxes
            if (nextBoxNumber > TotalBoxes) {
                console.error(`Box limit exceeded for PO number ${PONumber}. TotalBoxes: ${TotalBoxes}`);
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

            console.log("New Box Data to Add:", newBoxData);

            if (poEntry.boxes.length > 0) {
                poEntry.boxes[0].data.push(newBoxData);
                console.log("Appended new box data to existing boxes.");
            } else {
                // If no boxes exist, create a new box entry
                poEntry.boxes.push({
                    BuyersName,
                    StyleCode,
                    ColorCode,
                    data: [newBoxData],
                });
                console.log("Created new box entry since no existing boxes were found.");
            }

            // Save the updated PO entry
            await poEntry.save();
            console.log("PO entry updated successfully.");

            return res.status(200).json({
                message: `Box added successfully to existing PO number ${PONumber}.`,
                PONumber: poEntry,
            });
        } else {
            console.log(`PONumber ${PONumber} not found. Creating new PO entry.`);

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

            console.log("New PO Data:", newPO);

            // Save the new PO entry
            await newPO.save();
            console.log("New PO entry created successfully.");

            return res.status(201).json({
                message: `New PO number ${PONumber} created and box added successfully.`,
                PONumber: newPO,
            });
        }
    } catch (error) {
        console.error("Error saving order:", error);
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
        const order = await CompleteOrders.findOne({ PONumber: selectedPO });

        if (!order) {
            return res.status(404).send('No matching orders found for the provided PO.');
        }

        // Extract additional data for the headers
        const buyerName = order.boxes[0]?.BuyersName || 'Unknown Buyer'; // Assuming BuyersName exists in the boxes
        const StyleCode = order.boxes[0]?.StyleCode;
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
        doc.fontSize(14).text(`Buyer's Name: ${buyerName}`, { align: 'left' });
        doc.fontSize(14).text(`Style Code: ${StyleCode}`, { align: 'left' });
        doc.fontSize(14).text(`PO Number: ${poNumber}`, { align: 'left' });
        doc.fontSize(14).text(`PO Quantity: ${totalQuantity}`, { align: 'left' });
        doc.fontSize(14).text(`Color Code: ${colorCode}`, { align: 'left' });
        doc.fontSize(14).text(`Total Box Count: ${totalBoxCount}`, { align: 'left' });
        doc.fontSize(14).text(`Print Date and Time: ${printDateTime}`, { align: 'left' });
        doc.moveDown();
        doc.moveDown();

        // Define table headers
        const tableHeaders = ["Carton", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
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