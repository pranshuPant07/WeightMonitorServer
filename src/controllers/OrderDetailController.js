const OrderDetail = require('../models/OrderDetail');


// exports.getOrderDetails = async (req, res) => {
//     try {
//         const orderDetails = await OrderDetail.find({});
//         res.status(200).json(orderDetails);
//     } catch {
//         res.status(500).json({ error: 'Error fetching employees' });
//     }
// }

// exports.getOrderDetailsByStyleCodeID = async (req, res) => {
//     try {
//         const { StyleCodeID } = req.query; // Retrieve the StyleCodeID from query parameters

//         if (!StyleCodeID) {
//             return res.status(400).json({ error: 'StyleCodeID is required' }); // Return error if StyleCodeID is not provided
//         }

//         const orderDetails = await OrderDetail.find({ StyleCodeID });

//         if (orderDetails.length === 0) {
//             return res.status(404).json({ error: 'No order details found for this StyleCodeID' }); // Handle case when no data is found
//         }

//         res.status(200).json(orderDetails); // Send the found order details as the response
//     } catch (error) {
//         console.error(error); // Log any error for debugging purposes
//         res.status(500).json({ error: 'Error fetching order details' }); // Handle any other errors
//     }
// };



// exports.AddOrderDetails = async (req, res) => {
//     const { StyleCodeID, RequiredQuantity, ScannedQuantity } = req.body;


//     try {
//         const lastStyleCode = await OrderDetail.findOne().sort({ StyleCodeID: -1 }).exec();
//         const newID = lastStyleCode ? lastStyleCode.StyleCodeID + 1 : 1;

//         const newOrderDetails = new OrderDetail({
//             OrderId: newID,
//             StyleCodeID: StyleCodeID,
//             RequiredQuantity: RequiredQuantity,
//             ScannedQuantity: ScannedQuantity,
//             RemainingQuantity: 50
//         });

//         await newOrderDetails.save();

//         res.status(200).json({ message: "Order Details Saved Successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" })
//     }
// }

// exports.UpdateOrderDetails = async (req, res) => {
//     const { StyleCodeID, ScannedQuantity, RemainingQuantity } = req.body;

//     // Log the incoming request data to verify what is being sent from the frontend
//     console.log("Received data to update order details:", req.body);

//     try {
//         // Find the order by StyleCodeID (assuming StyleCodeID is unique for each order, otherwise adjust accordingly)
//         const orderDetails = await OrderDetail.findOne({ StyleCodeID });

//         if (!orderDetails) {
//             console.log("Order not found for StyleCodeID:", StyleCodeID);  // Log if order is not found
//             return res.status(404).json({ message: "Order Details Not Found" });
//         }

//         // Update the order details with the new ScannedQuantity and RemainingQuantity
//         if (ScannedQuantity !== undefined) {
//             orderDetails.ScannedQuantity = ScannedQuantity;
//         }

//         if (RemainingQuantity !== undefined) {
//             orderDetails.RemainingQuantity = RemainingQuantity;
//         }

//         // Save the updated order details
//         await orderDetails.save();

//         res.status(200).json({ message: "Order Details Updated Successfully" });
//     } catch (error) {
//         console.error("Error updating order details:", error); // Log the error for debugging
//         res.status(500).json({ message: "Server Error" });
//     }
// };


exports.getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await OrderDetail.find({});
        res.status(200).json(orderDetails);
    } catch {
        res.status(500).json({ error: 'Error fetching order details' });
    }
};


exports.getOrderDetailsByStyleCodeID = async (req, res) => {
    try {
        const { StyleCodeID } = req.query; // Retrieve the StyleCodeID from query parameters

        console.log("Body", req.body)

        if (!StyleCodeID) {
            return res.status(400).json({ error: 'StyleCodeID is required' }); // Return error if StyleCodeID is not provided
        }

        // Use $elemMatch to find orders with the given StyleCodeID in the StyleCodes array
        const orderDetails = await OrderDetail.find({
            StyleCodes: { $elemMatch: { StyleCodeID } }
        });

        if (orderDetails.length === 0) {
            return res.status(404).json({ error: 'No order details found for this StyleCodeID' }); // Handle case when no data is found
        }

        res.status(200).json(orderDetails); // Send the found order details as the response
    } catch (error) {
        console.error(error); // Log any error for debugging purposes
        res.status(500).json({ error: 'Error fetching order details' }); // Handle any other errors
    }
};


exports.AddOrderDetails = async (req, res) => {
    const { StyleCodes } = req.body; // Expecting an array of style codes in the request body

    if (!Array.isArray(StyleCodes) || StyleCodes.length === 0) {
        return res.status(400).json({ error: "StyleCodes array is required and should not be empty" });
    }

    try {
        // Generate a new OrderId (you can modify this to be a custom logic, depending on your requirement)
        const lastOrder = await OrderDetail.findOne().sort({ OrderId: -1 }).exec();
        const newOrderId = lastOrder ? lastOrder.OrderId + 1 : 1;

        // Create a new OrderDetail with the generated OrderId and the provided StyleCodes
        const newOrderDetails = new OrderDetail({
            OrderId: newOrderId,
            StyleCodes: StyleCodes
        });

        // Save the new OrderDetail to the database
        await newOrderDetails.save();

        res.status(200).json({ message: "Order Details Saved Successfully", orderId: newOrderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};



// exports.UpdateOrderDetails = async (req, res) => {
//     const { StyleCodeID, ScannedQuantity, RemainingQuantity } = req.body;
//     console.log("Received request to update order details with data:", req.body);

//     try {
//         // Find the order containing the StyleCodeID
//         const orderDetails = await OrderDetail.findOne({
//             "StyleCodes.StyleCodeID": StyleCodeID
//         });

//         if (!orderDetails) {
//             return res.status(404).json({ message: "Order Details Not Found" });
//         }

//         // Update the specific style code in the StyleCodes array
//         const styleCode = orderDetails.StyleCodes.find(code => code.StyleCodeID === StyleCodeID);
//         if (styleCode) {
//             // Update the quantities if they're provided
//             if (ScannedQuantity !== undefined) {
//                 styleCode.ScannedQuantity = ScannedQuantity;
//             }

//             if (RemainingQuantity !== undefined) {
//                 styleCode.RemainingQuantity = RemainingQuantity;
//             }

//             // Explicitly mark the StyleCodes array as modified
//             orderDetails.markModified('StyleCodes');

//             // Save the changes to the orderDetails document
//             await orderDetails.save();
//             return res.status(200).json({ message: "Order Details Updated Successfully" });
//         } else {
//             return res.status(404).json({ message: "StyleCodeID not found in this order" });
//         }
//     } catch (error) {
//         console.error("Error updating order details:", error);
//         return res.status(500).json({ message: "Server Error" });
//     }
// };


// exports.UpdateOrderDetails = async (req, res) => {
//     // Log incoming request body
//     console.log("Received request to update order details with data:", req.body);

//     const { StyleCodeID, ScannedQuantity, RemainingQuantity } = req.body;

//     try {
//         // Find the order containing the StyleCodeID
//         const orderDetails = await OrderDetail.findOne({
//             "StyleCodes.StyleCodeID": StyleCodeID
//         });

//         if (!orderDetails) {
//             console.log("Order Details Not Found for StyleCodeID:", StyleCodeID);
//             return res.status(404).json({ message: "Order Details Not Found" });
//         }

//         console.log("Order details found:", orderDetails);

//         // Find the style code in the array
//         const styleCode = orderDetails.StyleCodes.find(code => code.StyleCodeID === StyleCodeID);
//         if (styleCode) {
//             console.log("Found StyleCode:", styleCode);

//             // Update quantities if provided
//             if (ScannedQuantity !== undefined) {
//                 styleCode.ScannedQuantity = ScannedQuantity;
//                 console.log("Updated ScannedQuantity:", styleCode.ScannedQuantity);
//             }

//             if (RemainingQuantity !== undefined) {
//                 styleCode.RemainingQuantity = RemainingQuantity;
//                 console.log("Updated RemainingQuantity:", styleCode.RemainingQuantity);
//             }

//             // Mark the StyleCodes array as modified and save
//             orderDetails.markModified('StyleCodes');
//             await orderDetails.save();
//             console.log("Order details saved successfully with updated quantities.");

//             return res.status(200).json({ message: "Order Details Updated Successfully" });
//         } else {
//             console.log("StyleCodeID not found in the order's StyleCodes array.");
//             return res.status(404).json({ message: "StyleCodeID not found in this order" });
//         }
//     } catch (error) {
//         console.error("Error updating order details:", error);
//         return res.status(500).json({ message: "Server Error" });
//     }
// };



exports.UpdateOrderDetails = async (req, res) => {
    // Log incoming request body
    console.log("Received request to update order details with data:", req.body);

    const { StyleCodeID, ScannedQuantity, RemainingQuantity, Status } = req.body;

    try {
        // Find the order containing the StyleCodeID
        const orderDetails = await OrderDetail.findOne({
            "StyleCodes.StyleCodeID": StyleCodeID
        });

        if (!orderDetails) {
            console.log("Order Details Not Found for StyleCodeID:", StyleCodeID);
            return res.status(404).json({ message: "Order Details Not Found" });
        }

        console.log("Order details found:", orderDetails);

        // Find the style code in the array
        const styleCode = orderDetails.StyleCodes.find(code => code.StyleCodeID === StyleCodeID);
        if (styleCode) {
            console.log("Found StyleCode:", styleCode);

            // Update quantities if provided
            if (ScannedQuantity !== undefined) {
                styleCode.ScannedQuantity = ScannedQuantity;
                console.log("Updated ScannedQuantity:", styleCode.ScannedQuantity);
            }

            if (RemainingQuantity !== undefined) {
                styleCode.RemainingQuantity = RemainingQuantity;
                console.log("Updated RemainingQuantity:", styleCode.RemainingQuantity);
            }

            // Update status if provided
            if (Status !== undefined) {
                styleCode.Status = Status;
                console.log("Updated Status:", styleCode.Status);
            }

            // Mark the StyleCodes array as modified and save
            orderDetails.markModified('StyleCodes');
            await orderDetails.save();
            console.log("Order details saved successfully with updated quantities and status.");

            return res.status(200).json({ message: "Order Details Updated Successfully" });
        } else {
            console.log("StyleCodeID not found in the order's StyleCodes array.");
            return res.status(404).json({ message: "StyleCodeID not found in this order" });
        }
    } catch (error) {
        console.error("Error updating order details:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


