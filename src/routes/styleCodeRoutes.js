const express = require('express');
const router = express.Router();

// Import controllers
const styleCodeAuth = require('../controllers/StyleCodeController');
const orderDetials = require('../controllers/OrderDetailController');
const orderMaster = require('../controllers/OrderMaster');
const CompleteOrders = require('../controllers/CompletedOrdersController');
const NumberMaster = require('../controllers/NumberMasterController');


//Test Server
router.post('/api/Register', NumberMaster.Register)

// Style Code Routes
router.post('/api/StyleCodeRegister', styleCodeAuth.StyleCodeRegister);
router.get('/api/getStyleCodes', styleCodeAuth.getStyleCodes);
router.get('/', styleCodeAuth.welcome);
router.post('/api/updateStyleCodes', styleCodeAuth.StyleCodeUpdate);

// Order Details Routes
router.get('/api/getOrderDetails', orderDetials.getOrderDetails);
router.get('/api/getOrderDetailsByStyleCodeID', orderDetials.getOrderDetailsByStyleCodeID);

//Completed Order Routes
router.post('/api/getCompletedOrders', CompleteOrders.getCompleteOrderDetails);
router.post('/api/addCompleteOrders', CompleteOrders.addCompleteOrdersDetails);
router.get('/api/downloadCompletedOrders', CompleteOrders.exportCompleteOrders);


router.post('/api/AddOrderDetials', orderDetials.AddOrderDetails);
router.post('/api/UpdateOrderDetails', orderDetials.UpdateOrderDetails);



// Order Master Routes
router.post('/api/createOrderMaster', orderMaster.AddOrderMaster);
router.get('/api/getOrderMasterByDate', orderMaster.getOrderMasterByDate);
router.get('/api/getOrderMasterByPO', orderMaster.getOrderMasterByPO);
router.get('/api/getOrderMasterByStyleCode', orderMaster.getOrderMasterByStyleCode);

module.exports = router;