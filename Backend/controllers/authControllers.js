const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;

    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0)
                return res.status(400).json({ message: 'User not found' });

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({ message: 'Wrong password' });

            const token = jwt.sign(
                {
                    id: user.id,
                    store_id: user.store_id
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                message: 'Login success',
                token
            });
        }
    );
};