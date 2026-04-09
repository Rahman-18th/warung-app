const db = require('../config/db');

// ===============================
// CREATE TRANSACTION (KERANJANG)
// ===============================
exports.createTransaction = (req, res) => {
  const { cart } = req.body; // cart array of { product_id, jumlah }

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Keranjang belanja kosong'
    });
  }

  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal memulai transaksi", error: err.message });
    }

    try {
      let total_harga = 0;
      let total_profit = 0;
      let itemsToInsert = [];
      let updatesToProducts = [];

      // Validasi semua item di keranjang dengan urutan asinkron DB
      // Gunakan db.promise() untuk async/await
      for (let item of cart) {
        const [rows] = await db.promise().query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (rows.length === 0) {
           throw new Error(`Produk ID ${item.product_id} tidak ditemukan`);
        }
        
        const product = rows[0];
        if (product.stok < item.jumlah) {
           throw new Error(`Stok ${product.nama_produk} tidak cukup. (Stok: ${product.stok}, Diminta: ${item.jumlah})`);
        }
        
        const subtotal = product.harga_jual * item.jumlah;
        const profit = (product.harga_jual - product.harga_beli) * item.jumlah;
        
        total_harga += subtotal;
        total_profit += profit;

        itemsToInsert.push({
          product_id: product.id,
          jumlah: item.jumlah,
          harga_beli: product.harga_beli,
          harga_jual: product.harga_jual,
          subtotal,
          profit
        });

        updatesToProducts.push({
          id: product.id,
          sisa_stok: product.stok - item.jumlah
        });
      }

      // Ambil store_id dari produk pertama untuk referensi transaksi
      // (Berdasarkan skema lama, transactions membutuhkan store_id)
      const store_id = cart[0].store_id || 1;

      // Insert ke tabel transactions sebagai Header
      const [transResult] = await db.promise().query(
        'INSERT INTO transactions (total_harga, profit, store_id) VALUES (?, ?, ?)',
        [total_harga, total_profit, store_id]
      );
      const transaction_id = transResult.insertId;

      // Insert ke transaction_details dan Update Stok Produk
      for (let item of itemsToInsert) {
        await db.promise().query(
          'INSERT INTO transaction_details (transaction_id, product_id, jumlah, harga_beli, harga_jual, subtotal, profit) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [transaction_id, item.product_id, item.jumlah, item.harga_beli, item.harga_jual, item.subtotal, item.profit]
        );
      }

      for (let update of updatesToProducts) {
        await db.promise().query(
          'UPDATE products SET stok = ? WHERE id = ?',
          [update.sisa_stok, update.id]
        );
      }

      db.commit((err) => {
        if (err) throw err;
        
        res.status(201).json({
          success: true,
          message: "Transaksi berhasil",
          data: {
             transaction_id,
             total_harga
          }
        });
      });

    } catch (error) {
      db.rollback(() => {
        res.status(400).json({
          success: false,
          message: error.message || "Terjadi kesalahan saat transaksi"
        });
      });
    }
  });
};


// ===============================
// GET ALL TRANSACTIONS
// ===============================
exports.getTransactions = (req, res) => {
  const query = `
    SELECT 
      t.id as transaction_id, 
      t.total_harga as grand_total, 
      t.profit as total_profit, 
      t.created_at,
      td.product_id, 
      td.jumlah, 
      td.subtotal,
      p.nama_produk
    FROM transactions t
    LEFT JOIN transaction_details td ON t.id = td.transaction_id
    LEFT JOIN products p ON td.product_id = p.id
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

    // Karena formatnya row join, kita mapping manual per transaction_id ke satu object
    const transactionsMap = {};
    results.forEach(row => {
      if (!transactionsMap[row.transaction_id]) {
        transactionsMap[row.transaction_id] = {
          id: row.transaction_id,
          total_harga: row.grand_total,
          total_profit: row.total_profit,
          created_at: row.created_at,
          details: []
        };
      }
      
      // Ada kemungkinan data details null jika transaksi tanpa produk (anomali)
      if (row.product_id) {
         transactionsMap[row.transaction_id].details.push({
           nama_produk: row.nama_produk,
           jumlah: row.jumlah,
           subtotal: row.subtotal
         });
      }
    });

    const mappedResult = Object.values(transactionsMap).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    res.status(200).json({
      success: true,
      message: "Data riwayat transaksi berhasil diambil",
      data: mappedResult
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
      COALESCE(SUM(profit), 0) AS total_profit
    FROM transactions
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