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


router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [users] = await database.query(
      'SELECT user_id, username, email, password, firstname, lastname, address, telephone FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({ 
      authenticated: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        address: user.address,
        telephone: user.telephone
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, address, phone } = req.body;
    const userId = req.session.userId;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let updateQuery = 'UPDATE users SET username = ?';
    let params = [username];

    if (password) {
      updateQuery += ', password = ?';
      params.push(password);
    }

    if (firstName) {
      updateQuery += ', firstname = ?';
      params.push(firstName);
    }

    if (lastName) {
      updateQuery += ', lastname = ?';
      params.push(lastName);
    }

    if (address) {
      updateQuery += ', address = ?';
      params.push(address);
    }

    if (phone) {
      updateQuery += ', telephone = ?';
      params.push(phone);
    }

    updateQuery += ' WHERE user_id = ?';
    params.push(userId);

    await database.query(updateQuery, params);

    req.session.user.username = username;

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: req.session.user
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: err.message });
  }
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

router.get('/events', async (req, res) => {
  try{
    const userId = req.session.userId;
    const [events] = await database.query(
      'SELECT * FROM private_events WHERE user_id = ?',
      [userId]
    );
    res.json(events);
  }catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 