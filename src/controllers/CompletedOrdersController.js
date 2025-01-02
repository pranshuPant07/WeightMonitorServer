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

        if (!selectedPO) {
            return res.status(400).send('PO number is required.');
        }

        const order = await CompleteOrders.findOne({ PONumber: selectedPO });

        if (!order) {
            return res.status(404).send('No matching orders found for the provided PO.');
        }

        const buyerName = order.boxes[0]?.BuyersName || 'Unknown Buyer';
        const StyleCode = order.boxes[0]?.StyleCode;
        const poNumber = selectedPO;
        const totalQuantity = order.boxes.reduce(
            (sum, box) =>
                sum + box.data.reduce((dataSum, field) => dataSum + (field.Quantity || 0), 0),
            0
        );
        const colorCode = [...new Set(order.boxes.map(box => box.ColorCode))].join(', ') || 'N/A';
        const totalBoxCount = order.boxes.reduce((sum, box) => sum + box.data.length, 0);
        const printDateTime = new Date().toLocaleString();

        const doc = new PDFDocument();
        let currentPageNumber = 1; // Track the current page number
        res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        const topMargin = 20;
        doc.y = topMargin;

        // Print Date and Time
        doc.fontSize(10).text(`Print Date: ${printDateTime}`, { align: 'right' });
        doc.moveDown();
        doc.moveDown();

        // Render Header Details
        const headerDetails = [
            { label: "Buyer's Name", value: buyerName },
            { label: "Style Code", value: StyleCode },
            { label: "PO Number", value: poNumber },
            { label: "PO Quantity", value: totalQuantity },
            { label: "Color Code", value: colorCode },
            { label: "Total Box Count", value: totalBoxCount },
        ];

        const columnWidth = 180;
        const rowSpacing = 20; // Increased spacing between rows
        let currentX = 50;
        let currentY = doc.y;

        headerDetails.forEach((detail, index) => {
            doc.fontSize(10).text(`${detail.label}: ${detail.value}`, currentX, currentY);

            if ((index + 1) % 3 === 0) {
                currentX = 50;
                currentY += rowSpacing;
            } else {
                currentX += columnWidth;
            }
        });

        // Add space between Header Details and Table Headers
        doc.moveDown(); // Add a single line of space
        doc.moveDown(); // Add another line for more space

        // Table Header and Layout
        const tableHeaders = ["Carton #", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
        const startX = 60;
        const columnWidths = [60, 100, 100, 60, 150];
        const rowHeight = 20;
        const maxRowsPerPage = 30; // Fixed number of rows per page
        let currentRowCount = 0; // Track the number of rows on the current page

        const drawTableHeaders = () => {
            doc.font('Helvetica-Bold').fontSize(10); // Bold headers
            tableHeaders.forEach((header, i) => {
                const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
                doc.text(header, columnStart, currentY, { width: columnWidths[i], align: 'center' });
            });

            currentY += rowHeight; // Move below headers

            // Add a line below the headers
            doc.moveTo(startX, currentY - 10)
                .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), currentY - 10)
                .stroke();
        };

        const addPageNumber = (pageNumber) => {
            doc.fontSize(8)
                .text(`Page ${pageNumber}`, 0, doc.page.height - 82, { align: 'right' }); // Bottom center
        };

        // Draw initial headers
        drawTableHeaders();

        // Render Table Rows
        order.boxes.forEach((box) => {
            box.data.forEach((field) => {
                // Check if we need a new page
                if (currentRowCount >= maxRowsPerPage) {
                    addPageNumber(currentPageNumber); // Add page number to the current page
                    currentPageNumber++; // Increment page number
                    doc.addPage(); // Add a new page
                    currentY = 50; // Reset Y position for the new page
                    currentRowCount = 0; // Reset row count for the new page
                    drawTableHeaders(); // Draw table headers on the new page
                }

                doc.font('Helvetica').fontSize(10); // Normal font for entries
                const rowData = [
                    field.BoxNumber || 'N/A',
                    `${field.GrossWeight || 0} g`,
                    `${field.NetWeight || 0} g`,
                    field.Quantity || 0,
                    new Date(field.createdAt || box.createdAt).toLocaleString(),
                ];

                rowData.forEach((text, i) => {
                    const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc.text(text, columnStart, currentY, { width: columnWidths[i], align: 'center' });
                });

                currentY += rowHeight; // Increment Y position
                currentRowCount++; // Increment row count
            });
        });

        // Add the final page number
        addPageNumber(currentPageNumber);

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
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
//         const order = await CompleteOrders.findOne({ PONumber: selectedPO });

//         if (!order) {
//             return res.status(404).send('No matching orders found for the provided PO.');
//         }

//         // Extract additional data for the headers
//         const buyerName = order.boxes[0]?.BuyersName || 'Unknown Buyer';
//         const StyleCode = order.boxes[0]?.StyleCode;
//         const poNumber = selectedPO;
//         const totalQuantity = order.boxes.reduce(
//             (sum, box) =>
//                 sum + box.data.reduce((dataSum, field) => dataSum + (field.Quantity || 0), 0),
//             0
//         );
//         const colorCode = [...new Set(order.boxes.map(box => box.ColorCode))].join(', ') || 'N/A';
//         const totalBoxCount = order.boxes.reduce((sum, box) => sum + box.data.length, 0);
//         const printDateTime = new Date().toLocaleString();

//         const doc = new PDFDocument();
//         res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
//         res.setHeader('Content-type', 'application/pdf');

//         doc.pipe(res);

//         const topMargin = 20;
//         doc.y = topMargin;

//         // Print Date and Time at the top-right corner
//         doc.fontSize(10).text(`Print Date: ${printDateTime}`, { align: 'right' });

//         doc.moveDown();

//         // Header details in a 3x2 grid layout
//         const headerDetails = [
//             { label: "Buyer's Name", value: buyerName },
//             { label: "Style Code", value: StyleCode },
//             { label: "PO Number", value: poNumber },
//             { label: "PO Quantity", value: totalQuantity },
//             { label: "Color Code", value: colorCode },
//             { label: "Total Box Count", value: totalBoxCount },
//         ];

//         const columnWidth = 180;
//         const rowSpacing = 15;
//         let currentX = 50;
//         let currentY = doc.y;

//         headerDetails.forEach((detail, index) => {
//             doc.fontSize(10).text(`${detail.label}: ${detail.value}`, currentX, currentY);

//             if ((index + 1) % 3 === 0) {
//                 currentX = 50;
//                 currentY += rowSpacing;
//             } else {
//                 currentX += columnWidth;
//             }
//         });

//         doc.moveDown();
//         doc.moveDown();

//         // Table headers and layout
//         const tableHeaders = ["Carton #", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
//         const startX = 25;
//         const startY = doc.y;
//         const columnWidths = [60, 100, 100, 60, 150];
//         const rowHeight = 20;

//         // Draw table headers
//         doc.font('Helvetica-Bold').fontSize(10);
//         tableHeaders.forEach((header, i) => {
//             const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//             doc.text(header, columnStart, startY, { width: columnWidths[i], align: 'center' });
//         });

//         const headerBottomY = startY + rowHeight - 10;
//         doc.moveTo(startX, headerBottomY)
//             .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), headerBottomY)
//             .stroke();

//         let currentYY = headerBottomY + 10;

//         // Render table rows
//         doc.font('Helvetica').fontSize(10);
//         order.boxes.forEach((box) => {
//             box.data.forEach((field) => {
//                 if (currentY + rowHeight > doc.page.height - 50) {
//                     doc.addPage();
//                     currentY = 50;
//                 }

//                 const rowData = [
//                     field.BoxNumber || 'N/A',
//                     `${field.GrossWeight || 0} g`,
//                     `${field.NetWeight || 0} g`,
//                     field.Quantity || 0,
//                     new Date(field.createdAt || box.createdAt).toLocaleString(),
//                 ];

//                 rowData.forEach((text, i) => {
//                     const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                     doc.text(text, columnStart, currentYY, { width: columnWidths[i], align: 'center' });
//                 });

//                 currentYY += rowHeight;
//             });
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
//         const order = await CompleteOrders.findOne({ PONumber: selectedPO });

//         if (!order) {
//             return res.status(404).send('No matching orders found for the provided PO.');
//         }

//         // Extract additional data for the headers
//         const buyerName = order.boxes[0]?.BuyersName || 'Unknown Buyer'; // Assuming BuyersName exists in the boxes
//         const StyleCode = order.boxes[0]?.StyleCode;
//         const poNumber = selectedPO;
//         const totalQuantity = order.boxes.reduce(
//             (sum, box) =>
//                 sum + box.data.reduce((dataSum, field) => dataSum + (field.Quantity || 0), 0),
//             0
//         );
//         const colorCode = [...new Set(order.boxes.map(box => box.ColorCode))].join(', ') || 'N/A'; // Unique color codes
//         const totalBoxCount = order.boxes.reduce((sum, box) => sum + box.data.length, 0); // Total entries in data array
//         const printDateTime = new Date().toLocaleString();

//         const doc = new PDFDocument();
//         res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
//         res.setHeader('Content-type', 'application/pdf');

//         doc.pipe(res);

//         const topMargin = 20; // Set a custom top margin
//         doc.y = topMargin; // Set the vertical position

//         // Add Print Date and Time at the top-right corner
//         doc.fontSize(10).text(`Print Date: ${printDateTime}`, { align: 'right' });

//         // Leave a small gap below the top-right text before other headers
//         doc.moveDown();
//         doc.moveDown();
//         doc.moveDown();
//         doc.moveDown();

//         // Define the two-row, three-column layout for the remaining details
//         const headerDetails = [
//             { label: "Buyer's Name", value: buyerName },
//             { label: "Style Code", value: StyleCode },
//             { label: "PO Number", value: poNumber },
//             { label: "PO Quantity", value: totalQuantity },
//             { label: "Color Code", value: colorCode },
//             { label: "Total Box Count", value: totalBoxCount },
//         ];

//         // Define positions and render the headers in a grid layout
//         const columnWidth = 180; // Define column width for alignment
//         const rowSpacing = 15; // Spacing between rows
//         let currentX = 50; // Start from the left margin
//         let currentY = doc.y; // Start from the current Y position

//         headerDetails.forEach((detail, index) => {
//             // Render label and value in the format "Label: Value"
//             doc.fontSize(10).text(`${detail.label}: ${detail.value}`, currentX, currentY);

//             // Move to the next column or row
//             if ((index + 1) % 3 === 0) {
//                 currentX = 50; // Reset to the left margin for a new row
//                 currentY += rowSpacing; // Move down to the next row
//             } else {
//                 currentX += columnWidth; // Move to the next column
//             }
//         });

//         // Leave some space before the table
//         doc.moveDown();
//         doc.moveDown();


//         // Define table headers
//         const tableHeaders = ["Carton #", "Gross Weight", "Net Weight", "Quantity", "Date and Time"];
//         const startX = 25;
//         const startY = doc.y;
//         const columnWidths = [100, 100, 100, 100, 150];

//         // Draw bold table headers
//         doc.font('Helvetica-Bold').fontSize(10); // Set bold font and smaller size for headers
//         tableHeaders.forEach((header, i) => {
//             const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//             doc.text(header, columnStart, startY, { width: columnWidths[i], align: 'center' });
//         });

//         // Draw line below headers
//         const headerBottomY = doc.y + 5; // Add some space below the headers
//         doc.moveTo(startX, headerBottomY)
//             .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), headerBottomY)
//             .stroke();

//         doc.moveDown();

//         // Draw table rows with centered alignment
//         doc.font('Helvetica').fontSize(10); // Reset to regular font for table rows
//         order.boxes.forEach((box) => {
//             box.data.forEach((field) => {
//                 const currentY = doc.y;

//                 const boxNumber = field.BoxNumber || 'N/A';
//                 const grossWeight = `${field.GrossWeight || 0} g`;
//                 const netWeight = `${field.NetWeight || 0} g`;
//                 const quantity = field.Quantity || 0;
//                 const createdAt = `${new Date(field.createdAt || box.createdAt).toLocaleString()}`;

//                 const rowData = [boxNumber, grossWeight, netWeight, quantity, createdAt];

//                 // Render each column's data centered
//                 rowData.forEach((text, i) => {
//                     const columnStart = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                     doc.text(text, columnStart, currentY, { width: columnWidths[i], align: 'center' });
//                 });

//                 doc.moveDown();
//             });
//         });

//         doc.end();
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };