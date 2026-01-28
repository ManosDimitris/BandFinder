let allEvents = [];

document.addEventListener("DOMContentLoaded", async function () {
  await loadEvents();
  setupFilterListeners();
});

function setupFilterListeners() {
  const applyBtn = document.getElementById('applyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const searchInput = document.getElementById('searchEvents');
  const cityInput = document.getElementById('filterCity');
  const priceInput = document.getElementById('filterPrice');

  applyBtn.addEventListener('click', filterEvents);
  resetBtn.addEventListener('click', resetFilters);
  
  // Real-time search as user types
  searchInput.addEventListener('input', filterEvents);
  cityInput.addEventListener('input', filterEvents);
  priceInput.addEventListener('input', filterEvents);
}

function filterEvents() {
  const searchTerm = document.getElementById('searchEvents').value.toLowerCase();
  const cityTerm = document.getElementById('filterCity').value.toLowerCase();
  const maxPrice = parseFloat(document.getElementById('filterPrice').value) || Infinity;

  const filtered = allEvents.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm);
    const matchesCity = event.event_city.toLowerCase().includes(cityTerm);
    const matchesPrice = (event.participants_price || 0) <= maxPrice;
    
    return matchesSearch && matchesCity && matchesPrice;
  });

  displayEvents(filtered);
}

function resetFilters() {
  document.getElementById('searchEvents').value = '';
  document.getElementById('filterCity').value = '';
  document.getElementById('filterPrice').value = '';
  displayEvents(allEvents);
}

async function loadEvents() {
  try {
    const response = await fetch('/api/events/upcoming?limit=100');
    allEvents = await response.json();
    displayEvents(allEvents);
  } catch (error) {
    console.error('Error loading events:', error);
    document.getElementById('eventContainer').innerHTML = '<p class="error">Could not load events</p>';
  }
}

function displayEvents(events) {
  const container = document.getElementById("eventContainer");
  container.innerHTML = '';

  if (events && events.length > 0) {
    events.forEach(event => {
      const eventDate = new Date(event.event_datetime);
      const formattedDate = eventDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const eventElement = document.createElement('div');
      eventElement.className = 'event-item';
      eventElement.onclick = () => window.location.href = `/event/${event.public_event_id}`;
      eventElement.innerHTML = `
        <div class="event-image">
          <img src="../assets/images/audience.jpg" alt="${event.event_name || 'Event'}">
        </div>
        <div class="event-content">
          <div class="event-name">${event.event_name || 'Unnamed Event'}</div>
          <div class="event-date">${formattedDate}</div>
          <div class="event-location">${event.location || 'Location TBA'}</div>
          <div class="event-city">${event.event_city || 'City TBA'}</div>
          <div class="event-price">$${event.participants_price || '0'}</div>
          <button class="event-btn-view">Show Event</button>
        </div>
      `;
      container.appendChild(eventElement);
    });
  } else {
    container.innerHTML = '<p class="loading">No events found matching your criteria</p>';
  }
}
