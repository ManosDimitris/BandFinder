const express = require('express');
const router = express.Router();
const database = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [bands] = await database.query(
      `SELECT 
        band_id,
        band_name,
        music_genres,
        foundedYear,
        city,
        band_description,
        available,
        review_count,
        average_rating
      FROM bands
      ORDER BY band_name ASC`
    );
    
    res.json(bands);
  } catch (err) {
    console.error('Error fetching bands:', err);
    res.status(500).json({ error: 'Failed to fetch bands' });
  }
});

router.get('/:bandId', async (req, res) => {
  try {
    const { bandId } = req.params;
    const [bands] = await database.query(
      `SELECT 
        band_id,
        band_name,
        music_genres,
        foundedYear,
        city,
        band_description,
        available,
        members_count,
        review_count,
        average_rating
      FROM bands
      WHERE band_id = ?`,
      [bandId]
    );
    
    if (bands.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }
    
    res.json(bands[0]);
  } catch (err) {
    console.error('Error fetching band details:', err);
    res.status(500).json({ error: 'Failed to fetch band details' });
  }
});

module.exports = router;
