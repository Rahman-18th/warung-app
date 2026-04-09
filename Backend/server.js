
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();
const verifyToken = require('./middleware/authMiddleware');
const productsRoutes = require('./routes/productsRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')

app.use(cors());
app.use(express.json());
app.use('/api/products' , productsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/test', verifyToken, (req, res) => {
    res.json({
        message: 'Kamu berhasil mengakses route protected!',
        user: req.user
    });
});
app.use('/api/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
