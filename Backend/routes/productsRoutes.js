const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const productsController = require('../controllers/productsController');

router.get('/', verifyToken, productsController.getProducts);
router.post('/', verifyToken, productsController.addProduct);
router.put('/:id', verifyToken, productsController.updateProduct);
router.delete('/:id', verifyToken, productsController.deleteProduct);

module.exports = router;