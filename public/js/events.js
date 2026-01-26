document.addEventListener("DOMContentLoaded", async function () {
  const pathParts = window.location.pathname.split("/");
  const eventId = pathParts[pathParts.length - 1];

    await loadEvents();
});

async function loadEvents() {
  try {
    const response = await fetch('/api/events/upcoming?limit=100');
    const events = await response.json();

    const container = document.getElementById("eventContainer");
    container.innerHTML = '';

    if (events && events.length > 0) {
      const eventsList = document.createElement('div');
      eventsList.className = 'events-list';
      
      events.forEach(event => {
        const eventDate = new Date(event.event_datetime);
        const formattedDate = eventDate.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.style.cursor = 'pointer';
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
          </div>
        `;
        eventsList.appendChild(eventElement);
      });
      
      container.appendChild(eventsList);
    } else {
      container.innerHTML = '<p class="loading">No events available</p>';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    document.getElementById('eventContainer').innerHTML = '<p class="error">Could not load events</p>';
  }
}

