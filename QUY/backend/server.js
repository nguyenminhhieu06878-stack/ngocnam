require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const ActivityHistory = require('./models/ActivityHistory');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Helper functions for ElGamal using BigInt
const power = (base, exp, mod) => {
    let res = BigInt(1);
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % mod;
        base = (base * base) % mod;
        exp = exp / 2n;
    }
    return res;
};

const modInverse = (a, m) => {
    let m0 = m, t, q;
    let x0 = 0n, x1 = 1n;
    if (m === 1n) return 0n;
    while (a > 1n) {
        q = a / m;
        t = m;
        m = a % m;
        a = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }
    if (x1 < 0n) x1 += m0;
    return x1;
};

const isPrime = (n, k = 5) => {
    if (n <= 1n || n === 4n) return false;
    if (n <= 3n) return true;
    let d = n - 1n;
    let s = 0n;
    while (d % 2n === 0n) {
        d /= 2n;
        s++;
    }
    for (let i = 0; i < k; i++) {
        let a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)));
        let x = power(a, d, n);
        if (x === 1n || x === n - 1n) continue;
        let composite = true;
        for (let r = 1n; r < s; r++) {
            x = (x * x) % n;
            if (x === n - 1n) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }
    return true;
};

const generatePrime = (bits) => {
    let p;
    do {
        const bytes = crypto.randomBytes(bits / 8);
        p = BigInt('0x' + bytes.toString('hex')) | 1n;
    } while (!isPrime(p));
    return p;
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Existing API Endpoints (Now protected and logged)
app.post('/api/generate-keys', authMiddleware, async (req, res) => {
    const { bits } = req.body;
    const p = generatePrime(bits || 512);
    const g = 2n;
    const x = BigInt('0x' + crypto.randomBytes(32).toString('hex')) % (p - 2n) + 1n;
    const y = power(g, x, p);

    await ActivityHistory.create({
        userId: req.user.id,
        action: 'GENERATE_KEYS',
        details: `Đã tạo cặp khóa ElGamal (${bits || 512} bits).`
    });

    res.json({
        p: p.toString(),
        g: g.toString(),
        x: x.toString(),
        y: y.toString()
    });
});

app.post('/api/encrypt', authMiddleware, async (req, res) => {
    const { p, g, y, message } = req.body;
    const pBI = BigInt(p);
    const gBI = BigInt(g);
    const yBI = BigInt(y);
    const mBI = BigInt('0x' + Buffer.from(message).toString('hex'));

    const k = BigInt('0x' + crypto.randomBytes(32).toString('hex')) % (pBI - 2n) + 1n;
    const a = power(gBI, k, pBI);
    const b = (mBI * power(yBI, k, pBI)) % pBI;

    await ActivityHistory.create({
        userId: req.user.id,
        action: 'ENCRYPT_MESSAGE',
        details: `Đã mã hóa tin nhắn bằng ElGamal.`
    });

    res.json({
        a: a.toString(),
        b: b.toString()
    });
});

app.post('/api/decrypt', authMiddleware, async (req, res) => {
    const { p, x, a, b } = req.body;
    const pBI = BigInt(p);
    const xBI = BigInt(x);
    const aBI = BigInt(a);
    const bBI = BigInt(b);

    const s = power(aBI, xBI, pBI);
    const sInv = modInverse(s, pBI);
    const mBI = (bBI * sInv) % pBI;

    const hexMessage = mBI.toString(16);
    const message = Buffer.from(hexMessage.length % 2 === 0 ? hexMessage : '0' + hexMessage, 'hex').toString();

    await ActivityHistory.create({
        userId: req.user.id,
        action: 'DECRYPT_MESSAGE',
        details: `Đã giải mã tin nhắn bằng ElGamal.`
    });

    res.json({ message });
});

// Database Sync and Server Start
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
