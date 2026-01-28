const express = require('express');
const router = express.Router();
const database = require('../config/database');

// BAND LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await database.query('SELECT * FROM bands WHERE LOWER(email) = LOWER(?)', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const band = rows[0];

    if (band.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    req.session.userId = band.band_id;
    req.session.username = band.username;
    req.session.userType = 'band';
    req.session.user = {
      band_id: band.band_id,
      username: band.username,
      email: band.email,
      band_name: band.band_name
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      res.json({ 
        success: true, 
        message: 'Login successful', 
        band: {
          band_id: band.band_id,
          band_name: band.band_name,
          email: band.email
        }
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// BAND REGISTER
router.post('/register', async (req, res) => {
  try {
    const { 
      band_name, 
      email, 
      password, 
      music_genre, 
      band_description, 
      other_genres, 
      country, 
      city, 
      year_formed, 
      members_number, 
      contact_phone, 
      website, 
      social_media, 
      looking_for, 
      instruments_needed 
    } = req.body;

    if (!band_name || !email || !password || !music_genre || !band_description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Band name, email, password, genre and description are required' 
      });
    }

    const [existingBands] = await database.query(
      'SELECT * FROM bands WHERE email = ? OR band_name = ?', 
      [email, band_name]
    );
    
    if (existingBands.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or band name already registered' 
      });
    }

    const username = band_name.toLowerCase().replace(/\s+/g, '_');

    await database.query(
      `INSERT INTO bands (
        username, 
        email, 
        password, 
        band_name, 
        music_genres, 
        band_description, 
        members_number, 
        foundedYear, 
        band_city, 
        telephone, 
        webpage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        password,
        band_name,
        music_genre,
        band_description,
        members_number || 0,
        year_formed || new Date().getFullYear(),
        city || '',
        contact_phone || '',
        website || ''
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! You can now login.' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration', 
      error: err.message 
    });
  }
});

router.get('/profile', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'band') {
      return res.status(401).json({ authenticated: false });
    }

    const [bands] = await database.query(
      `SELECT 
        band_id,
        username,
        email,
        password,
        band_name,
        music_genres,
        band_description,
        members_number,
        foundedYear,
        band_city,
        telephone,
        webpage
       FROM bands 
       WHERE band_id = ?`,
      [req.session.userId]
    );

    if (bands.length === 0) {
      return res.status(401).json({ authenticated: false });
    }

    res.json({ 
      authenticated: true, 
      user: bands[0] 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ authenticated: false, error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const bandId = req.session.userId;
    
    if (!bandId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { username, email, password, band_name, music_genres, band_description, members_number, foundedYear, band_city, telephone, webpage } = req.body;

    await database.query(
      `UPDATE bands 
       SET username = ?, email = ?, password = ?,band_name = ?, music_genres = ?, band_description = ?, members_number = ?, foundedYear = ?, band_city = ?, telephone = ?, webpage = ?
       WHERE band_id = ?`,
      [username, email, password, band_name, music_genres, band_description, members_number, foundedYear, band_city, telephone, webpage, bandId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while updating the profile' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [bands] = await database.query(
      `SELECT 
        band_id,
        band_name,
        music_genres as genre,
        foundedYear,
        band_description,
        members_number,
        band_city
       FROM bands`
    );
    res.json(bands);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while getting the bands' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bandId = req.params.id;
    
    const [bands] = await database.query(
      `SELECT 
        band_id,
        band_name,
        music_genres as genre,
        foundedYear,
        band_description,
        members_number,
        band_city
       FROM bands 
       WHERE band_id = ?`,
      [bandId]
    );
    
    if (bands && bands.length > 0) {
      res.json(bands[0]);
    } else {
      res.status(404).json({ error: 'Band not found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the band' });
  }
});

router.post("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, review, rating } = req.body;

    if (!sender || !review || !rating) {
      return res.status(400).json({ error: "Missing required fields: sender, review, rating" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const [bands] = await database.query(
      `SELECT band_name FROM bands WHERE band_id = ?`,
      [id]
    );

    if (bands.length === 0) {
      return res.status(404).json({ error: "Band not found" });
    }

    const bandName = bands[0].band_name;
    const dateTime = new Date().toISOString();

    await database.query(
      `INSERT INTO reviews (band_name, sender, review, rating, date_time, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bandName, sender, review, rating, dateTime, "pending"]
    );

    res.status(201).json({
      message: "Review submitted successfully",
      review: {
        band_name: bandName,
        sender,
        review,
        rating,
        date_time: dateTime,
        status: "pending",
      },
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;