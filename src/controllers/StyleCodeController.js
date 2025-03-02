const StyleCodeS = require('../models/StyleCode');

// exports.StyleCodeRegister = async (req, res) => {
//     const { StyleCode, ItemWeight, ItemPackingWeight } = req.body;
//     try {

//         const lastStyleCode = await StyleCodeS.findOne().sort({ StyleCodeID: -1 }).exec();
//         const newID = lastStyleCode ? lastStyleCode.StyleCodeID + 1 : 1;

//         const styleCodeData = new StyleCodeS({
//             StyleCodeID: newID,
//             StyleCode: StyleCode,
//             ItemWeight: ItemWeight,
//             ItemPackingWeight: ItemPackingWeight
//         });

//         // Save the new StyleCode document
//         await styleCodeData.save();


//         // Return success message
//         res.status(201).json({ message: 'Style Code Created Successfully' });
//     } catch (error) {
//         // Log and return error
//         console.error("Error while saving StyleCode:", error);
//         res.status(500).json({ error: 'Server Error' });
//     }
//     };

exports.StyleCodeRegister = async (req, res) => {
    const { StyleCode, ItemWeight, ItemPackingWeight, Description, Color, SizeType } = req.body;

    // Validation: Ensure all required fields are present
    if (!StyleCode || !ItemWeight || !ItemPackingWeight || !Description || !Color || !SizeType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Get the last StyleCodeID and generate a new ID
        const lastStyleCode = await StyleCodeS.findOne().sort({ StyleCodeID: -1 }).exec();
        const lastIDNumber = lastStyleCode ? parseInt(lastStyleCode.StyleCodeID.match(/\d+$/)?.[0]) : 0; // Extract numeric part
        const newIDNumber = lastIDNumber + 1;
        const newID = `11CK0${newIDNumber.toString().padStart(5, '0')}`; // Example format: "11CK010001"

        // Create a new StyleCode document
        const styleCodeData = new StyleCodeS({
            StyleCodeID: newID,
            StyleCode: StyleCode,
            Description: Description,
            Color: Color,
            SizeType: SizeType,
            ItemWeight: ItemWeight,
            ItemPackingWeight: ItemPackingWeight
        });

        // Save the new StyleCode document
        await styleCodeData.save();

        // Return success message
        res.status(201).json({ message: 'Style Code Created Successfully', data: styleCodeData });
    } catch (error) {
        // Log and return error
        console.error("Error while saving StyleCode:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};


exports.getStyleCodes = async (req, res) => {
    try {
        const styleCodeData = await StyleCodeS.find({});
        res.status(200).json(styleCodeData);
    } catch {
        res.status(500).json({ error: 'Error fetching employees' });
    }
}

exports.welcome = async (req, res) => {
    try {
        res.status(200).json({message:"CONNECTED"});
    } catch {
        res.status(500).json({ error: 'NOT CONNECTED' });
    }
}



exports.StyleCodeUpdate = async (req, res) => {
    const { StyleCodeID, StyleCode, Description, Color, SizeType, ItemWeight, ItemPackingWeight } = req.body;

    try {
        // Validate SizeType
        if (!['Inch', 'Cm', 'Alphabetic'].includes(SizeType)) {
            return res.status(400).json({ error: 'Invalid SizeType' });
        }

        // Find the existing StyleCode by StyleCodeID
        const existingStyleCodeByID = await StyleCodeS.findOne({ StyleCodeID });
        if (!existingStyleCodeByID) {
            return res.status(404).json({ error: 'StyleCode not found' });
        }

        // Check if another StyleCode with the same StyleCode exists
        const existingStyleCode = await StyleCodeS.findOne({
            StyleCode,
            StyleCodeID: { $ne: StyleCodeID },
        });

        if (existingStyleCode) {
            return res.status(409).json({ message: 'Style Code Already Exists' });
        }

        // Update the fields
        existingStyleCodeByID.StyleCode = StyleCode || existingStyleCodeByID.StyleCode;
        existingStyleCodeByID.Description = Description || existingStyleCodeByID.Description;
        existingStyleCodeByID.Color = Color || existingStyleCodeByID.Color;
        existingStyleCodeByID.SizeType = SizeType || existingStyleCodeByID.SizeType;
        existingStyleCodeByID.ItemWeight = ItemWeight || existingStyleCodeByID.ItemWeight;
        existingStyleCodeByID.ItemPackingWeight = ItemPackingWeight || existingStyleCodeByID.ItemPackingWeight;

        // Save the updated StyleCode document
        await existingStyleCodeByID.save();

        res.status(200).json({ message: 'Style Code Updated Successfully' });
    } catch (error) {
        console.error("Error while updating StyleCode:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};