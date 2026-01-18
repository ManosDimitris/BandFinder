document.addEventListener('DOMContentLoaded', async function() {
  await checkAuthentication();
  await loadUpcomingEvents();
  await loadBestBands();
});

async function checkAuthentication() {
  try {
    const response = await fetch('/api/user/profile');
    const data = await response.json();

    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const userFeatures = document.getElementById('userFeatures');

    if (data.authenticated && data.user) {
      
      if (guestNav) guestNav.style.display = 'none';
      if (userNav) {
        userNav.style.display = 'flex';
      }
      if (userFeatures) userFeatures.style.display = 'block';
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (userFeatures) userFeatures.style.display = 'none';
    }
  } catch (error) {
    console.error('Authentication check error:', error);
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const userFeatures = document.getElementById('userFeatures');
    if (guestNav) guestNav.style.display = 'flex';
    if (userNav) userNav.style.display = 'none';
    if (userFeatures) userFeatures.style.display = 'none';
  }
}

async function loadUpcomingEvents() {
  try {
    const response = await fetch('/api/events/upcoming?limit=4');
    const events = await response.json();

    const eventsList = document.getElementById('upcomingEventsList');
    eventsList.innerHTML = '';

    if (events && events.length > 0) {
      events.forEach(event => {
        const eventDate = new Date(event.event_datetime);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
          <div class="event-image">
            <img src = "../assets/images/audience.jpg" alt="${event.event_name || 'Event'}">
          </div>
          <div class="event-content">
            <div class = "info-section">
              <div class="event-name">${event.event_name || 'Unnamed Event'}</div>
              <div class="event-date">${formattedDate}</div>
              <div class="event-location">${event.location || 'Location TBA'}</div>
            </div>
            <div class="EventDetails">
              <a href="/event-details.html?id=${event.public_event_id}">Show Event</a>
            </div>
          </div>
        `;
        eventsList.appendChild(eventElement);
      });
    } else {
      eventsList.innerHTML = '<p class="loading">No upcoming events at the moment</p>';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    const eventsList = document.getElementById('upcomingEventsList');
    eventsList.innerHTML = '<p class="loading">Could not load events</p>';
  }
}

async function loadBestBands() {
  try {
    const response = await fetch('/api/bands/new?limit=3');
    const bands = await response.json();

    const bandsList = document.getElementById('bestBandsList');
    bandsList.innerHTML = '';

    if (bands && bands.length > 0) {
      bands.forEach(band => {
        const rating = (band.average_rating || 0).toFixed(1);
        const bandElement = document.createElement('div');
        bandElement.className = 'band-item';
        bandElement.innerHTML = `
          <div class="band-image">
            <img src="../assets/images/audience.jpg" alt="${band.band_name || 'Band'}">
          </div>
          <div class="band-content">
            <div class="band-name">${band.band_name || 'Unknown Band'}</div>
            <div class="band-rating">${rating}/5 (${band.review_count || 0} reviews)</div>
            ${band.genre ? `<div style="font-size: 0.9em; color: #aaa;">Genre: ${band.genre}</div>` : ''}

          </div>
        `;
        bandsList.appendChild(bandElement);
      });
    } else {
      bandsList.innerHTML = '<p class="loading">No bands with ratings yet</p>';
    }
  } catch (error) {
    console.error('Error loading bands:', error);
    const bandsList = document.getElementById('bestBandsList');
    bandsList.innerHTML = '<p class="loading">Could not load bands</p>';
  }
}

