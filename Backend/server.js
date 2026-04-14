
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Basic Headers
app.use(helmet());

// Rate Limiting (100 Request per 15 Menit)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { success: false, message: 'Terlalu banyak permintaan, coba lagi setelah 15 menit' },
});
app.use('/api', limiter);

const verifyToken = require('./middleware/authMiddleware');
const productsRoutes = require('./routes/productsRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
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
