const CompleteOrder = require('../models/CompletedOrders');

exports.addCompleteOrdersDetails = async (req, res) => {
    try {
        // Extract order details from the request body
        const { BoxNumber, GrossWeight, NetWeight, Quantity, ColorCode } = req.body;

        // Validate the required fields
        if (!BoxNumber || !GrossWeight || !NetWeight || !Quantity || !ColorCode) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Create a new order document
        const newOrder = new CompleteOrder({
            BoxNumber,
            GrossWeight,
            NetWeight,
            Quantity,
            ColorCode,
        });

        // Save the document to the database
        const savedOrder = await newOrder.save();

        // Respond with the saved order details
        res.status(201).json({
            message: 'Order saved successfully.',
            order: savedOrder,
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
        const employees = await CompleteOrder.find();

        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename=employees.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(18).text('Employee List', { align: 'center' });
        doc.moveDown();

        employees.forEach((employee, index) => {
            doc.fontSize(12).text(
                `${index + 1}.   Name: ${employee.Name},
        Mobile Number: ${employee.Mobilenumber},
        Date of Join: ${employee.Dateofjoin},
        Department: ${employee.Department}
  
        `
            );
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};