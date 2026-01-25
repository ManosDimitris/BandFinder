const express = require('express');
const router = express.Router();
const database = require('../config/database');

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
  }catch (error) {
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

module.exports = router;