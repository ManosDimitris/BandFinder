const express = require('express');
const router = express.Router();
const database = require('../config/database');
const { isAuthenticated } = require('../Authentication/auth');


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await database.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.userId = user.user_id;
    req.session.username = user.username;
    req.session.userType = 'user';
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email
    };

    res.json({ success: true, message: 'Login successful', user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}); 


router.get('/profile', isAuthenticated, (req, res) => {
  res.json({ 
    authenticated: true,
    user: req.session.user 
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

module.exports = router; 