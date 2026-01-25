const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/events/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    
    const [events] = await db.query(
      `SELECT 
        public_event_id,
        event_type as event_name,
        event_datetime,
        event_address as location,
        event_city,
        participants_price
       FROM public_events 
       ORDER BY event_datetime ASC 
       LIMIT ?`,
      [Number(limit)]
    );
    res.json(events || []);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while fetching events' });
  }
});

router.get('/bands/new', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
  
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    
    const [bands] = await db.query(`
      SELECT b.band_id,
        b.band_name,
        b.music_genres as genre,
        b.foundedYear
      FROM bands b
      ORDER BY b.foundedYear DESC
      LIMIT ?`,
      [Number(limit)]
    );
    res.json(bands || []);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while fetching bands' });
  }
});

router.get('/events/map', async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT 
        public_event_id,
        event_type as event_name,
        event_datetime,
        event_address as location,
        event_city,
        participants_price,
        event_lat as lat,
        event_lon as lon
       FROM public_events
       WHERE event_lat IS NOT NULL AND event_lon IS NOT NULL`
    );
    res.json(events || []);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while fetching events for map' });
  }
});

module.exports = router;