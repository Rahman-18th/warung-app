const db = require('../config/db');


// ===============================
// CREATE TRANSACTION
// ===============================
exports.createTransaction = (req, res) => {
  const { product_id, jumlah } = req.body;

  if (!product_id || !jumlah || jumlah <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Data tidak valid'
    });
  }

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal memulai transaksi",
        error: err.message
      });
    }

    db.query('SELECT * FROM products WHERE id = ?', [product_id], (err, results) => {
      if (err) {
        return db.rollback(() =>
          res.status(500).json({
            success: false,
            message: "Gagal mengambil data produk",
            error: err.message
          })
        );
      }

      if (results.length === 0) {
        return db.rollback(() =>
          res.status(404).json({
            success: false,
            message: 'Produk tidak ditemukan'
          })
        );
      }

      const product = results[0];

      if (product.stok < jumlah) {
        return db.rollback(() =>
          res.status(400).json({
            success: false,
            message: "Stok tidak cukup"
          })
        );
      }

      const total_harga = product.harga_jual * jumlah;
      // hitung profit
      const profit = (product.harga_jual - product.harga_beli) * jumlah;
      const sisa_stok = product.stok - jumlah;

      db.query(
        'UPDATE products SET stok = ? WHERE id = ?',
        [sisa_stok, product_id],
        (err) => {
          if (err) {
            return db.rollback(() =>
              res.status(500).json({
                success: false,
                message: "Gagal update stok",
                error: err.message
              })
            );
          }

          db.query(
            'INSERT INTO transactions (product_id, store_id, jumlah, total_harga, profit) VALUES (?, ?, ?, ?, ?)',
            [product_id, product.store_id, jumlah, total_harga, profit],
            (err) => {
              if (err) {
                return db.rollback(() =>
                  res.status(500).json({
                    success: false,
                    message: "Gagal menyimpan transaksi",
                    error: err.message
                  })
                );
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() =>
                    res.status(500).json({
                      success: false,
                      message: "Gagal commit transaksi",
                      error: err.message
                    })
                  );
                }

                res.status(201).json({
                  success: true,
                  message: "Transaksi berhasil",
                  data: {
                    product_id,
                    jumlah,
                    total_harga,
                    profit,
                    sisa_stok
                  }
                });
              });
            }
          );
        }
      );
    });
  });
};


// ===============================
// GET ALL TRANSACTIONS
// ===============================
exports.getTransactions = (req, res) => {
  const query = `
    SELECT 
      t.id,
      p.nama_produk,
      t.jumlah,
      t.total_harga,
      t.created_at
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    ORDER BY t.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data transaksi",
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: "Data transaksi berhasil diambil",
      data: results
    });
  });
};

// ===============================
// LAPORAN HARIAN
// ===============================
exports.getTodayReport = (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_transaksi,
      COALESCE(SUM(total_harga), 0) as total_pendapatan
    FROM transactions
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil laporan harian",
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: "Laporan harian berhasil diambil",
      data: results[0]
    });
  });
};

// ===============================
// TOTAL PROFIT
// ===============================
exports.getTotalProfit = (req, res) => {
  const query = `
    SELECT 
      COALESCE(SUM((p.harga_jual - p.harga_beli) * t.jumlah), 0) AS total_profit
    FROM transactions t
    JOIN products p ON t.product_id = p.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil total profit",
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: "Total profit berhasil diambil",
      data: results[0]
    });
  });
};