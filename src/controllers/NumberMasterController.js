const NumberSavings = require('../models/NumberSaving');

exports.Register = async (req, res) => {
    const { Number } = req.body;

    if (!Number) {
        return res.status(400).json({ message: 'Number is required' });
    }

    try {
        const newNumber = new NumberSavings({
            Number
        });

        await newNumber.save();

        // Return success response "Y"
        res.status(200).json({ message: 'Y' });
    } catch (error) {
        // Log and return "N" for error
        console.error("Error while saving NumberSavings:", error);
        res.status(500).json({ message: 'N' });
    }
};
