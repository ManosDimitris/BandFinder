document.addEventListener('DOMContentLoaded', async () => {
  const id = getIdFromPath();
  await checkUserAuth();
  if (!id){
    console.error('No band id found in URL');
    return;
  } 
  loadBand(id);
});

function getIdFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  return last && !isNaN(Number(last)) ? last : null;
}

let isUserAuthenticated = false;
let currentUsername = '';

async function checkUserAuth() {
  try {
    const response = await fetch("/api/user/profile");
    const data = await response.json();
    isUserAuthenticated = data.authenticated || false;
    currentUsername = data.user?.username || '';
  } catch (error) {
    isUserAuthenticated = false;
  }
}

async function loadBand(id) {
  try {
    const res = await fetch(`/api/bands/${id}`);
    if (!res.ok) {
      if (res.status === 404) return showError('Band not found');
      throw new Error('Failed to fetch band');
    }
    const band = await res.json();

    document.getElementById('bandName').textContent = band.band_name ;
    document.getElementById('bandGenre').textContent = band.genre || '-';
    document.getElementById('bandFounded').textContent = band.foundedYear || '-';
    document.getElementById('bandMembers').textContent = band.members_number || '-';
    document.getElementById('bandCity').textContent = band.band_city || '-';
    document.getElementById('bandDescription').textContent = band.band_description;
    
    // Fetch and display events
    await loadBandEvents(id);
    
    if(isUserAuthenticated){
      const reviews = document.getElementById('reviewsSection');
      const reviewForm = document.createElement('div');
      reviewForm.innerHTML = `
       <h3>Leave a Review</h3>
        <form id="reviewForm">
          <label for="rating">Rating:</label>
          <select id="rating" name="rating" required>
            <option value="">Select rating</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          <br />
          <label for="reviewInput">reviewInput:</label>
          <textarea id="reviewInput" name="reviewInput" rows="4" required></textarea>
          <br />
          <button type="submit" class="btn-submit-review">Submit Review</button>
        </form>
      `;
      reviews.appendChild(reviewForm);

      document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitReview(id, currentUsername);
      });
      const requestEventSection = document.getElementById('requestEventSection');
      const requestEventForm = document.createElement('div');
      requestEventForm.innerHTML = `
        <h3>Request a Private Event</h3>
        <form id="requestEventForm">
          <label for="eventType">Event Type:</label>
          <select id="eventType" name="eventType" required>
            <option value="">Select event type</option>
            <option value="Wedding">Wedding</option>
            <option value="Baptism">Baptism</option>
            <option value="Party">Party</option>
          </select>
          <br />
          <label for="eventDate">Event Date:</label>
          <input type="datetime-local" id="eventDate" name="eventDate" required />
          <br />
          <label for="eventLocation">Location:</label>
          <input type="text" id="eventLocation" name="eventLocation" placeholder="City, Address" required />
          <br />
          <label for="eventDescription">Description:</label>
          <textarea id="eventDescription" name="eventDescription" rows="4" placeholder="Tell us about your event..." required></textarea>
          <br />
          <br />
          <button type="submit" class="btn-submit-request">Submit Request</button>
        </form>
      `;
      requestEventSection.appendChild(requestEventForm);

      document.getElementById('requestEventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEventRequest(id);
      });
    }

  } catch (err) {
    console.error('Load band error:', err);
    return;
  }
}

async function loadBandEvents(bandId) {
  try {
    const res = await fetch(`/api/bands/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    
    const events = await res.json();
    const now = new Date();
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.event_datetime);
      return eventDate > now && event.band_id == bandId;
    });
    
    const pastEvents = events.filter(event => {
      const eventDate = new Date(event.event_datetime);
      return eventDate <= now && event.band_id == bandId;
    });
    
    const upcomingContainer = document.getElementById('upcoming-events');
    const pastContainer = document.getElementById('past-events');
    
    if (upcomingEvents.length > 0) {
      upcomingContainer.innerHTML = upcomingEvents.map(event => `
        <div class="event-item">
          <h4>${event.event_type}</h4>
          <p><strong>Date:</strong> ${new Date(event.event_datetime).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(event.event_datetime).toLocaleTimeString()}</p>
          <p><strong>Location:</strong> ${event.event_city}</p>
          <p><strong>Price:</strong> $${event.participants_price}</p>
        </div>
      `).join('');
    } else {
      upcomingContainer.textContent = 'No upcoming events';
    }
    
    if (pastEvents.length > 0) {
      pastContainer.innerHTML = pastEvents.map(event => `
        <div class="event-item">
          <h4>${event.event_type}</h4>
          <p><strong>Date:</strong> ${new Date(event.event_datetime).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(event.event_datetime).toLocaleTimeString()}</p>
          <p><strong>Location:</strong> ${event.event_city}</p>
          <p><strong>Price:</strong> $${event.participants_price}</p>
        </div>
      `).join('');
    } else {
      pastContainer.textContent = 'No past events';
    }
  } catch (err) {
    console.error('Load events error:', err);
    document.getElementById('upcoming-events').textContent = 'Unable to load events';
    document.getElementById('past-events').textContent = 'Unable to load events';
  }
}

async function submitReview(bandId, sender) {
  try {
    const rating = document.getElementById('rating').value;
    const reviewInput = document.getElementById('reviewInput').value;

    const response = await fetch(`/api/bands/${bandId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender,
        review: reviewInput,
        rating: parseInt(rating)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    const data = await response.json();
    showSuccessMessage("Review submitted successfully!");
    document.getElementById('reviewForm').reset();
  } catch (err) {
    console.error('Submit review error:', err);
    alert('Error submitting review');
  }
}

async function submitEventRequest(bandId) {
  try {
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const eventDescription = document.getElementById('eventDescription').value;
    let eventPrice;

    if(eventType === 'Baptism'){
      eventPrice = 700.0;
    }else if(eventType === 'Party'){
      eventPrice = 500.0;
    }else{
      eventPrice = 1000.0;
    }

    const locationParts = eventLocation.split(',').map(part => part.trim());
    const eventCity = locationParts[0] || '';
    const eventAddress = locationParts[1] || '';

    const location = await getCoordinates(eventLocation);
    
    if(!location){
      alert('Invalid location. Please enter a valid city and address.');
      return;
    }

    const response = await fetch(`/api/bands/private-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: eventType,
        eventDate: eventDate.split('T')[0],
        eventTime: eventDate.split('T')[1],
        eventLocation: eventLocation,
        eventCity: eventCity,
        eventAddress: eventAddress,
        eventDescription: eventDescription,
        eventBudget: parseFloat(eventPrice),
        eventLat: location.lat,
        eventLon: location.lng
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit event request');
    }

    const data = await response.json();
    showSuccessMessage("Event request submitted successfully!");
    document.getElementById('requestEventForm').reset();
  } catch (err) {
    console.error('Submit event request error:', err);
    alert('Error submitting event request');
  }
}

async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}


function showSuccessMessage(message) {
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}