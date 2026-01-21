const User = require('../models/User');
const ActivityHistory = require('../models/ActivityHistory');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.create({ username, password, role });
    
    await ActivityHistory.create({
      userId: user.id,
      action: 'REGISTER',
      details: `Người dùng ${username} đã đăng ký tài khoản.`
    });

    res.status(201).json({ message: 'Đăng ký thành công', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'Đăng ký thất bại: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    await ActivityHistory.create({
      userId: user.id,
      action: 'LOGIN',
      details: `Người dùng ${username} đã đăng nhập.`
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Đăng nhập thất bại: ' + error.message });
  }
};

module.exports = { register, login };
