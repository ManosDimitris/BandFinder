document.addEventListener("DOMContentLoaded", async function () {
  const pathParts = window.location.pathname.split("/");
  const eventId = pathParts[pathParts.length - 1];

  // If there's an ID itn the actual url path load it else load all events   
  if (eventId && eventId !== "events.html") {
    await loadEventID(eventId);
  } else {
    await loadEvents();
  }
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
        const formattedDate = eventDate.toLocaleDateString("en-US", {
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

async function loadEventID(eventId) {
  try {
    const response = await fetch(`/api/event/${eventId}`);
    const event = await response.json();

    const container = document.getElementById("eventContainer");

    if (!event || event.error) {
      container.innerHTML = '<p class="error">Event not found</p>';
      return;
    }

    const eventDate = new Date(event.event_datetime);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    container.innerHTML = `
      <div class="event-detail">
        <h1>${event.event_name || "Unnamed Event"}</h1>
        <img src="../assets/images/audience.jpg" alt="${
          event.event_name || "Event"
        }" class="event-detail-image">
        <div class="event-detail-info">
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Location:</strong> ${event.location || "Location TBA"}</p>
          <p><strong>City:</strong> ${event.event_city || "TBA"}</p>
          <p><strong>Price:</strong> $${event.participants_price || "0"}</p>
        </div>
        <a href="/" class="back-link">Home</a>
      </div>
    `;
  } catch (error) {
    console.error("Error loading event details:", error);
    document.getElementById("eventContainer").innerHTML =
      '<p class="error">Could not load event details</p>';
  }
}
