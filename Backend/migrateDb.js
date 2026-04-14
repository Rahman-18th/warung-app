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
        // 1. Buat tabel users
        await executeDDL(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                store_id INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Buat tabel products
        await executeDDL(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama_produk VARCHAR(100) NOT NULL,
                harga_beli DECIMAL(10, 2) NOT NULL,
                harga_jual DECIMAL(10, 2) NOT NULL,
                stok INT NOT NULL,
                store_id INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Buat tabel transactions jika belum ada (Header)
        await executeDDL(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                total_harga DECIMAL(10, 2) NOT NULL,
                profit DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Buat tabel transaction_details (Detail Item)
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

        // 5. Seed Admin User
        const bcrypt = require('bcryptjs');
        const userCount = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM users', (err, results) => {
                if (err) reject(err); else resolve(results[0].count);
            });
        });

        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await new Promise((resolve, reject) => {
                db.query('INSERT INTO users (username, password, store_id) VALUES (?, ?, ?)', ['admin', hashedPassword, 1], (err) => {
                    if (err) reject(err); else resolve();
                });
            });
            console.log("✅ Admin user berhasil dibuat (Username: admin, Password: admin123)");
        } else {
            console.log("✅ Admin user sudah ada, melewati proses seeding.");
        }

        console.log("Migrasi database berhasil! Semua tabel dan initial data siap digunakan.");
    } catch (error) {
        console.error("Migrasi gagal:", error);
    } finally {
        db.end();
    }
}

migrate();
