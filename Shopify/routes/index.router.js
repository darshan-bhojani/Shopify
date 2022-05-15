const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventory.controller');

router.post('/addItem', inventoryController.addItem);
router.put('/updateItem', inventoryController.updateItem);
router.delete('/deleteItem/:id', inventoryController.deleteItem);
router.post('/restorableDeleteItem/', inventoryController.restorableDeleteItem);
router.post('/restoreItem', inventoryController.restoreItem);
router.post('/deleteItems', inventoryController.deleteItems);
router.get('/getItem/:id', inventoryController.getItem);
router.get('/getWholeInventory', inventoryController.getWholeInventory);

module.exports = router;



