const CompleteOrders = require('../models/CompletedOrders');
const PDFDocument = require('pdfkit');

exports.getCompleteOrderDetails = async (req, res) => {
    try {
        const { PONumber } = req.body; // Get the PONumber from the request body

        if (!PONumber) {
            // Fetch all orders if PONumber is not provided
            const allOrders = await CompleteOrders.find({});

            if (!allOrders || allOrders.length === 0) {
                return res.status(404).json({ message: 'No completed orders found.' });
            }

            const formattedOrders = allOrders.map(order => ({
                PONumber: order.PONumber,
                boxes: order.boxes.map(box => ({
                    PONumber: box.PONumber || order.PONumber, // Ensure PONumber exists
                    BuyersName: box.BuyersName || 'N/A',
                    StyleCode: box.StyleCode || 'N/A',
                    ColorCode: box.ColorCode || 'N/A',
                    data: box.data.map(dataItem => ({
                        BoxNumber: dataItem.BoxNumber || 'N/A',
                        TotalBoxes: dataItem.TotalBoxes || 0,
                        showBoxes: dataItem.showBoxes || 'N/A',
                        GrossWeight: dataItem.GrossWeight || 0,
                        NetWeight: dataItem.NetWeight || 0,
                        Quantity: dataItem.Quantity || 0,
                        Size: dataItem.Size,
                        createdAt: dataItem.createdAt ? new Date(dataItem.createdAt).toLocaleString() : 'Invalid Date',
                    }))
                }))
            }));

            return res.status(200).json({
                message: 'All completed orders fetched successfully.',
                orders: formattedOrders,
            });
        }

        // Fetch orders for the specific PONumber
        const poOrders = await CompleteOrders.findOne({ PONumber });

        if (!poOrders) {
            return res.status(404).json({ message: `No orders found for PO number ${PONumber}.` });
        }

        const formattedOrder = {
            PONumber: poOrders.PONumber,
            boxes: poOrders.boxes.map(box => ({
                PONumber: box.PONumber || poOrders.PONumber,
                BuyersName: box.BuyersName || 'N/A',
                StyleCode: box.StyleCode || 'N/A',
                ColorCode: box.ColorCode || 'N/A',
                data: box.data.map(dataItem => ({
                    BoxNumber: dataItem.BoxNumber || 'N/A',
                    TotalBoxes: dataItem.TotalBoxes || 0,
                    showBoxes: dataItem.showBoxes || 'N/A',
                    GrossWeight: dataItem.GrossWeight || 0,
                    NetWeight: dataItem.NetWeight || 0,
                    Quantity: dataItem.Quantity || 0,
                    Size: dataItem.Size || 0,
                    createdAt: dataItem.createdAt ? new Date(dataItem.createdAt).toLocaleString() : 'Invalid Date',
                }))
            }))
        };

        return res.status(200).json({
            message: `Orders fetched successfully for PO number ${PONumber}.`,
            orders: formattedOrder,
        });
    } catch (error) {
        console.error('Error fetching complete orders:', error);
        return res.status(500).json({
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
            Quantity,
            Size,
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
            !Quantity ||
            !Size
        ) {
            console.error("Validation Failed: Missing Required Fields.");
            return res
                .status(400)
                .json({ message: 'All fields, including PONumber and TotalBoxes, are required.' });
        }

        // Find the matching PONumber in the database
        console.log(`Checking for existing PONumber: ${PONumber}`);
        let poEntry = await CompleteOrders.findOne({ PONumber });

        if (poEntry) {
            console.log(`PONumber ${PONumber} found in database.`);

            // Check for existing StyleCode in PO
            const styleEntry = poEntry.boxes.find((box) => box.StyleCode === StyleCode);

            if (styleEntry) {
                // Calculate the next BoxNumber for this StyleCode
                const existingBoxes = styleEntry.data.length;
                const nextBoxNumber = existingBoxes + 1;

                console.log(
                    `StyleCode: ${StyleCode}, Existing Boxes: ${existingBoxes}, Next Box Number: ${nextBoxNumber}, TotalBoxes: ${TotalBoxes}`
                );

                // Validate that the total number of boxes does not exceed TotalBoxes
                if (nextBoxNumber > TotalBoxes) {
                    console.error(
                        `StyleCode ${StyleCode} completed for PO number ${PONumber}. TotalBoxes: ${TotalBoxes}`
                    );
                    return res.status(400).json({
                        message: `StyleCode ${StyleCode} completed. Cannot add more boxes.`,
                    });
                }

                // Add the new box details to the existing StyleCode
                const newBoxData = {
                    BoxNumber: nextBoxNumber.toString(),
                    TotalBoxes,
                    showBoxes: `${nextBoxNumber} of ${TotalBoxes}`,
                    GrossWeight,
                    NetWeight,
                    Quantity,
                    Size,
                    createdAt: new Date(),
                };

                console.log("New Box Data to Add:", newBoxData);

                styleEntry.data.push(newBoxData);

                console.log("Appended new box data to existing StyleCode.");

                // Save the updated PO entry
                await poEntry.save();
                console.log("PO entry updated successfully.");

                return res.status(200).json({
                    message: `Box added successfully to StyleCode ${StyleCode} in PO number ${PONumber}.`,
                    PONumber: poEntry,
                });
            }

            // If StyleCode is not found, add a new StyleCode entry
            console.log(`StyleCode ${StyleCode} not found. Adding new StyleCode entry.`);
            const newBoxData = {
                BoxNumber: "1", // First box starts with 1
                TotalBoxes,
                showBoxes: `1 of ${TotalBoxes}`,
                GrossWeight,
                NetWeight,
                Quantity,
                Size,
                createdAt: new Date(),
            };

            poEntry.boxes.push({
                BuyersName,
                StyleCode,
                ColorCode,
                data: [newBoxData],
            });

            console.log("New StyleCode entry added.");

            // Save the updated PO entry
            await poEntry.save();
            console.log("PO entry updated successfully.");

            return res.status(200).json({
                message: `New StyleCode ${StyleCode} added to PO number ${PONumber}.`,
                PONumber: poEntry,
            });
        }

        // If PONumber does not exist, create a new PO entry
        console.log(`PONumber ${PONumber} not found. Creating new PO entry.`);

        const newPO = new CompleteOrders({
            PONumber,
            boxes: [
                {
                    BuyersName,
                    StyleCode,
                    ColorCode,
                    data: [
                        {
                            BoxNumber: "1",
                            TotalBoxes,
                            showBoxes: `1 of ${TotalBoxes}`,
                            GrossWeight,
                            NetWeight,
                            Quantity,
                            Size,
                            createdAt: new Date(),
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

        // Convert the current date and time to IST
        const getISTDateTime = (date) =>
            new Intl.DateTimeFormat('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(new Date(date || Date.now()));

        const printDateTime = getISTDateTime(); // Print date in IST

        const doc = new PDFDocument();
        let currentPageNumber = 1; // Track the current page number
        res.setHeader('Content-disposition', 'attachment; filename=CompletedOrders.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        const topMargin = 20;
        doc.y = topMargin;

        // Print Date and Time in IST
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
                    getISTDateTime(field.createdAt || box.createdAt), // Convert to IST
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
