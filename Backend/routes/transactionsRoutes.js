const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const transactionsController = require('../controllers/transactionsController');



router.get('/report/today', verifyToken, transactionsController.getTodayReport);
router.get('/profit', verifyToken, transactionsController.getTotalProfit);
// GET semua transaksi
router.get('/', verifyToken, transactionsController.getTransactions);

// POST transaksi baru
router.post('/', verifyToken, transactionsController.createTransaction);



module.exports = router;