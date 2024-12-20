const OrderMaster = require('../models/OrderMaster');
const orderDetail = require('../models/OrderDetail');
const StyleCodes = require('../models/StyleCode');

exports.AddOrderMaster = async (req, res) => {
    const { OrderDate, OrderNo, CustomerName } = req.body;

    // Check for missing fields
    if (!OrderDate || !OrderNo || !CustomerName) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Find the last OrderID and generate a new one
        const lastStyleCode = await OrderMaster.findOne().sort({ OrderID: -1 }).exec();

        let newID = 1;  // Default to 1 if no previous order exists

        if (lastStyleCode && typeof lastStyleCode.OrderID === 'number' && !isNaN(lastStyleCode.OrderID)) {
            newID = lastStyleCode.OrderID + 1;
        }

        // Ensure that OrderDate is a valid Date object or string
        const orderDate = new Date(OrderDate);  // Ensure it's a Date object

        if (isNaN(orderDate)) {
            return res.status(400).json({ message: "Invalid OrderDate format" });
        }

        const newOrderMaster = new OrderMaster({
            OrderID: newID,  // Assign the calculated OrderID
            OrderDate: orderDate,  // Save the date as a Date object
            OrderNo: OrderNo,
            CustomerName: CustomerName
        });

        await newOrderMaster.save();

        res.status(200).json({ message: "Order Master Saved Successfully" });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getOrderMasterByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "Date is Required" });
        }

        let query = {};

        // Step 1: Filter by the provided date (date is in YYYY-MM-DD format)
        const startOfDay = new Date(date); // Start of the day (00:00:00)
        const endOfDay = new Date(date);   // End of the day (23:59:59)
        endOfDay.setHours(23, 59, 59, 999); // Set to end of the day (23:59:59.999)

        // MongoDB query for date range
        query.OrderDate = { $gte: startOfDay, $lte: endOfDay };

        const orders = await OrderMaster.find(query);

        // Return the filtered orders for that specific day
        res.status(200).json(orders);

    } catch (error) {
        console.error("Error fetching OrderMasters:", error);
        res.status(500).json({ error: 'Error fetching order masters' });
    }
};



exports.getOrderMasterByPO = async (req, res) => {
    try {
        const { PO } = req.query;

        // Check if PO is provided
        if (!PO) {
            return res.status(400).json({ error: "PO is required" });
        }

        // Query to find order details by OrderId (PO)
        const orderDetails = await orderDetail.find({ OrderId: PO });

        // If no order details are found for the PO, return a 404
        if (orderDetails.length === 0) {
            return res.status(404).json({ error: "PO number not found in OrderDetails" });
        }

        // If order details are found, return them with a 200 status
        return res.status(200).json(orderDetails);

    } catch (error) {
        // Log error for debugging purposes
        console.error("Error fetching OrderMasters:", error);

        // Return a server error response
        return res.status(500).json({ error: 'Error fetching order masters' });
    }
};

exports.getOrderMasterByStyleCode = async (req, res) => {
  try {
    // Get StyleCodeID from query. If it's a string, split into an array.
    const { StyleCodeID } = req.query;

    // Check if StyleCodeID is provided
    if (!StyleCodeID) {
      return res.status(400).json({ error: "Style Code is Required" });
    }

    // If StyleCodeID is a comma-separated string, split into an array
    const styleCodeIDs = Array.isArray(StyleCodeID)
      ? StyleCodeID // If it's already an array
      : StyleCodeID.split(","); // If it's a comma-separated string

    // Find matching StyleCodes based on the list of StyleCodeIDs
    const scID = await StyleCodes.find({
        StyleCodeID: { $in: styleCodeIDs }, // Use $in to search for any of the provided StyleCodeIDs
    });

    // If no matching StyleCodes are found, return a 404
    if (scID.length === 0) {
      return res.status(404).json({ error: "Style Code(s) not found" });
    }

    // Return the found StyleCodes
    return res.status(200).json(scID);

  } catch (error) {
    console.error("Error fetching StyleCode:", error);

    // Return a server error response
    return res.status(500).json({ error: "Error fetching StyleCode" });
  }
};




// exports.getOrderMaster = async (req, res) => {
//     try {
//         const { date, po } = req.query;

//         // Build the query object
//         let query = {};

//         // If a date is provided, filter by that date (assuming date is in YYYY-MM-DD format)
//         if (date) {
//             const startOfDay = new Date(date); // Start of the day
//             const endOfDay = new Date(date);
//             endOfDay.setHours(23, 59, 59, 999); // End of the day

//             query.OrderDate = { $gte: startOfDay, $lte: endOfDay };  // MongoDB query for date range
//         }

//         // If a PO number is provided, filter by that PO
//         if (po) {
//             query.OrderNo = po;
//         }

//         // Fetch filtered orders based on the query
//         const orders = await OrderMaster.find(query);

//         // Return the filtered orders
//         res.status(200).json(orders);
//     } catch (error) {
//         console.error("Error fetching OrderMasters:", error);
//         res.status(500).json({ error: 'Error fetching order masters' });
//     }
// };


// exports.getOrderMaster = async (req, res) => {
//     try {
//         const { date, po } = req.query;

//         // Build the query object for OrderMaster
//         let query = {};

//         // If a date is provided, filter by that date (assuming date is in YYYY-MM-DD format)
//         if (date) {
//             const startOfDay = new Date(date); // Start of the day
//             const endOfDay = new Date(date);
//             endOfDay.setHours(23, 59, 59, 999); // End of the day

//             query.OrderDate = { $gte: startOfDay, $lte: endOfDay };  // MongoDB query for date range
//         }

//         // If a PO number is provided, check in OrderDetails collection
//         if (po) {
//             // Step 1: Check if the PO number exists in the OrderDetails collection
//             const orderDetails = await orderDetail.find({ OrderId: po });

//             if (orderDetails.length === 0) {
//                 // If PO number is not found in OrderDetails, send a 404 response
//                 return res.status(404).json({ error: 'PO number not found in OrderDetails' });
//             }

//             // Step 2: If PO exists in OrderDetails, return all related data from OrderDetails
//             return res.status(201).json(orderDetails);
//         }

//         // Step 3: Fetch filtered orders based on the query
//         const orders = await OrderMaster.find(query);

//         // Return the filtered orders (including matching PO)
//         res.status(200).json(orders);
//     } catch (error) {
//         console.error("Error fetching OrderMasters:", error);
//         res.status(500).json({ error: 'Error fetching order masters' });
//     }
// };



// exports.getOrderMaster = async (req, res) => {
//     try {
//         const { date, po } = req.query;

//         // Validate if date is provided
//         if (!date) {
//             return res.status(400).json({ error: 'Date is required' });
//         }

//         // Build the query object for OrderMaster
//         let query = {};

//         // Step 1: Filter by the provided date (date is in YYYY-MM-DD format)
//         const startOfDay = new Date(date); // Start of the day (00:00:00)
//         const endOfDay = new Date(date);   // End of the day (23:59:59)
//         endOfDay.setHours(23, 59, 59, 999); // Set to end of the day (23:59:59.999)

//         // MongoDB query for date range
//         query.OrderDate = { $gte: startOfDay, $lte: endOfDay };

//         // Step 2: If a PO number is provided, check if it exists in the OrderDetails collection
//         if (po) {
//             // Check if PO exists in OrderDetails
//             const orderDetails = await orderDetail.find({ OrderId: po });

//             if (orderDetails.length === 0) {
//                 // If PO number is not found in OrderDetails, return a 404 response
//                 return res.status(404).json({ error: 'PO number not found in OrderDetails' });
//             }

//             // If PO exists, return all related data from OrderDetails
//             return res.status(200).json(orderDetails);
//         }

//         // Step 3: If no PO number is provided, fetch filtered orders from OrderMaster based on the query
//         const orders = await OrderMaster.find(query);

//         // Return the filtered orders for that specific day
//         res.status(200).json(orders);

//     } catch (error) {
//         console.error("Error fetching OrderMasters:", error);
//         res.status(500).json({ error: 'Error fetching order masters' });
//     }
// };
