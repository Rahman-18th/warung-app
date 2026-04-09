const db = require('../config/db');

exports.getDashboard = (req, res) => {

  const dashboardQuery = `
    SELECT
      (SELECT COUNT(*) FROM products) AS total_produk,

      (SELECT COUNT(*) 
       FROM transactions 
       WHERE DATE(created_at) = CURDATE()) 
       AS total_transaksi_hari_ini,

      (SELECT IFNULL(SUM(total_harga),0) 
       FROM transactions 
       WHERE DATE(created_at) = CURDATE()) 
       AS total_pendapatan_hari_ini,

      (SELECT IFNULL(SUM(profit),0) 
       FROM transactions 
       WHERE DATE(created_at) = CURDATE()) 
       AS total_profit_hari_ini
  `;

  db.query(dashboardQuery, (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard",
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: "Data dashboard berhasil diambil",
      data: results[0]
    });

  });

};