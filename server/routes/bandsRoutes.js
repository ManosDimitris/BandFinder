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

router.post("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, review, rating } = req.body;

    if (!sender || !review || !rating) {
      return res
        .status(400)
        .json({ error: "Missing required fields: sender, review, rating" });
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

module.exports = router;