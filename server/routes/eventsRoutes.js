const express = require('express');
const router = express.Router();
const database = require('../config/database');


router.get('/events', async (req, res) => {

});

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

module.exports = router;