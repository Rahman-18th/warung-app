const db = require('./config/db');

async function migrate() {
    console.log("Memulai proses migrasi database untuk Keranjang Belanja...");

    const executeDDL = (query) => {
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    // Ignore duplicate column/table errors
                    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                        resolve(true); 
                    } else {
                        console.error('Error:', err.message);
                        reject(err);
                    }
                } else {
                    resolve(true);
                }
            });
        });
    };

    try {
        // 1. Buat tabel transactions jika belum ada (Header)
        await executeDDL(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                total_harga DECIMAL(10, 2) NOT NULL,
                profit DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Buat tabel transaction_details (Detail Item)
        await executeDDL(`
            CREATE TABLE IF NOT EXISTS transaction_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT NOT NULL,
                product_id INT NOT NULL,
                jumlah INT NOT NULL,
                harga_beli DECIMAL(10, 2) NOT NULL,
                harga_jual DECIMAL(10, 2) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                profit DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        console.log("Migrasi database berhasil! Tabel transactions dan transaction_details siap digunakan.");
    } catch (error) {
        console.error("Migrasi gagal:", error);
    } finally {
        db.end();
    }
}

migrate();
