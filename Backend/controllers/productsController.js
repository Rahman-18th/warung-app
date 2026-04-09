const db = require('../config/db');

// ===============================
// GET ALL PRODUCTS
// ===============================
exports.getProducts = (req, res) => {

  const sql = `
    SELECT id, nama_produk, harga_beli, harga_jual, stok
    FROM products
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false, // ✅ UPDATE: response format konsisten
        message: "Gagal mengambil data produk",
        error: err.message
      });
    }

    res.status(200).json({
      success: true, // ✅ UPDATE
      message: "Data produk berhasil diambil",
      data: results // ✅ UPDATE
    });

  });
};



// ===============================
// ADD PRODUCT
// ===============================
exports.addProduct = (req, res) => {

  const { nama_produk, harga_beli, harga_jual, stok } = req.body;

  const store_id = 1;

  // ✅ UPDATE: validasi input
  if (!nama_produk || !harga_beli || !harga_jual || !stok) {
    return res.status(400).json({
      success: false,
      message: "Data produk tidak lengkap"
    });
  }

  const sql = `
    INSERT INTO products 
    (nama_produk, harga_beli, harga_jual, stok, store_id) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nama_produk, harga_beli, harga_jual, stok, store_id], 
    (err, result) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: "Gagal menambahkan produk",
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        product_id: result.insertId // ✅ UPDATE: kirim id produk baru
      });

  });
};



// ===============================
// UPDATE PRODUCT
// ===============================
exports.updateProduct = (req, res) => {

  const { id } = req.params;
  const { nama_produk, harga_beli, harga_jual, stok } = req.body;

  const sql = `
    UPDATE products 
    SET nama_produk=?, harga_beli=?, harga_jual=?, stok=? 
    WHERE id=?
  `;

  db.query(sql, [nama_produk, harga_beli, harga_jual, stok, id], (err, result) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal update produk",
        error: err.message
      });
    }

    res.json({
      success: true,
      message: "Produk berhasil diupdate"
    });

  });
};



// ===============================
// DELETE PRODUCT
// ===============================
exports.deleteProduct = (req, res) => {

  const { id } = req.params;

  db.query('DELETE FROM products WHERE id=?', [id], (err) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus produk",
        error: err.message
      });
    }

    res.json({
      success: true,
      message: "Produk berhasil dihapus"
    });

  });

};