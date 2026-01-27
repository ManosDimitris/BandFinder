const express = require('express');
const router = express.Router();
const database = require('../config/database');
const { isAdmin } = require('../Authentication/auth');



router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [rows] = await database.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const admin = rows[0];

    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.userId = admin.admin_id;
    req.session.username = admin.username;
    req.session.userType = 'admin';
    req.session.admin = {
      admin_id: admin.admin_id,
      username: admin.username,
      email: admin.email
    };

    res.json({ success: true, message: 'Login successful', admin: req.session.admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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

router.get('/profile', isAdmin, (req, res) => {
  res.json({ 
    authenticated: true,
    admin: req.session.admin 
  });
});



router.get('/statistics', isAdmin, async (req, res) => {
  try {
    // Users
    const [usersResult] = await database.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult[0].count;

    // Bands
    const [bandsResult] = await database.query('SELECT COUNT(*) as count FROM bands');
    const totalBands = bandsResult[0].count;

    // Events
    const [publicEventsResult] = await database.query('SELECT COUNT(*) as count FROM public_events');
    const publicEvents = publicEventsResult[0].count;

    const [privateEventsResult] = await database.query('SELECT COUNT(*) as count FROM private_events');
    const privateEvents = privateEventsResult[0].count;

    const totalEvents = publicEvents + privateEvents;

    // Bands
    const [bandsByCityResult] = await database.query(
      'SELECT band_city, COUNT(*) as count FROM bands GROUP BY band_city ORDER BY count DESC'
    );
    const bandsByCity = bandsByCityResult.map(row => [row.band_city, row.count]);

    // CALCULATE REVENUE
    const [revenueResult] = await database.query(
      'SELECT SUM(price * 0.15) as revenue FROM private_events WHERE status = "done"'
    );
    const siteRevenue = revenueResult[0].revenue || 0;

    res.json({
      totalUsers,
      totalBands,
      totalEvents,
      publicEvents,
      privateEvents,
      bandsByCity,
      siteRevenue
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/UserManagement', isAdmin, async (req, res) => {
  try {
    const [usersResult] = await database.query(
      'SELECT username, email, city FROM users'
    );

    res.json({ usersResult });
  } catch (err) {
    console.error('User Management error ', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/UserManagement/:username', isAdmin, async (req, res) => {
  const { username } = req.params;
  try {
    await database.query('DELETE FROM users WHERE username = ?', [username]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/reviews', isAdmin, async (req, res) => {
  try {
    const [reviewsResult] = await database.query(
      `SELECT *
        FROM reviews
        WHERE status = 'pending';`
    );

    res.json({ reviewsResult });
  }catch (err) {
    console.error('Reviews retrieval error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/reviews/:reviewId/approve', isAdmin, async (req, res) => {
  const { reviewId } = req.params;
  try {
    await database.query(
      'UPDATE reviews SET status = ? WHERE review_id = ?',
      ['published', reviewId]
    );
    res.json({ message: 'Review approved successfully' });
  } catch (err) {
    console.error('Approve review error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reviews/:reviewId', isAdmin, async (req, res) => {
  const { reviewId } = req.params;
  try {
    await database.query(
      'DELETE FROM reviews WHERE review_id = ?',
      [reviewId]
    );
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;