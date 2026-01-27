const express = require('express');
const router = express.Router();
const database = require('../config/database');

router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const [events] = await database.query(
      `SELECT 
        public_event_id,
        event_type as event_name,
        event_datetime,
        event_address as location,
        event_city,
        participants_price
       FROM public_events 
       WHERE public_event_id = ?`,
      [eventId]
    );
    
    if (events && events.length > 0) {
      res.json(events[0]);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the event' });
  }
});

router.post("/request", async (req, res) => {
  try {
    const { band_id, event_type, event_datetime, event_city, event_address, event_description, price, event_lat, event_lon } = req.body;
    const userId = req.session.user?.user_id;

    if (!band_id || !event_type || !event_datetime || !event_city || !event_address || !event_description || price === undefined || event_lat === undefined || event_lon === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: "User not authenticated" });
    }

    const [bands] = await database.query(
      `SELECT band_id FROM bands WHERE band_id = ?`,
      [band_id]
    );

    if (bands.length === 0) {
      return res.status(404).json({ error: "Band not found" });
    }

    await database.query(
      `INSERT INTO private_events (band_id, user_id, event_type, event_datetime, event_city, event_address, event_description, price, status, band_decision, event_lat, event_lon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [band_id, userId, event_type, event_datetime, event_city, event_address, event_description, price, "requested", "", event_lat, event_lon]
    );

    res.status(201).json({
      message: "Event request submitted successfully",
      event: {
        band_id,
        user_id: userId,
        event_type,
        event_datetime,
        event_city,
        event_address,
        event_description,
        price,
        status: "requested",
        band_decision: "",
        event_lat,
        event_lon
      }
    });
  } catch (err) {
    console.error("Error submitting event request:", err);
    res.status(500).json({ error: "Failed to submit event request" });
  }
});

module.exports = router;