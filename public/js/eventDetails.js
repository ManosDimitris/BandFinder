document.addEventListener('DOMContentLoaded', () => {
  const id = getIdFromPath();
  if (!id) {
    console.error('No event id found in URL');
    return;
  }
  loadEvent(id);
});

function getIdFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  return last && !isNaN(Number(last)) ? last : null;
}

async function loadEvent(id) {
  try {
    const res = await fetch(`/api/event/${id}`);
    if (!res.ok) {
      if (res.status === 404) return showError('Event not found');
      throw new Error('Failed to fetch event');
    }
    const event = await res.json();
    console.log('Event loaded:', event);

    document.getElementById('eventName').textContent = event.event_type;
    document.getElementById('eventDate').textContent = event.event_datetime ? new Date(event.event_datetime).toLocaleString() : '-';
    document.getElementById('eventLocation').textContent = event.event_address;
    document.getElementById('eventCity').textContent = event.event_city;
    document.getElementById('eventPrice').textContent = event.participants_price != null ? `$${event.participants_price}` : '-';
    document.getElementById('eventDescription').textContent = event.event_description || 'No description provided';
    
    if (event.band_id) {
      console.log('Band ID found:', event.band_id);
      loadBand(event.band_id);
    } else {
      console.log('No band assigned to this event');
      document.getElementById('bandName').textContent = 'No band assigned';
    }
  } catch (err) {
    console.error('Load event error:', err);
    return;
  }
}

async function loadBand(bandId) {
  try {
    console.log('Fetching band with ID:', bandId);
    const res = await fetch(`/api/bands/${bandId}`);
    if (!res.ok) {
      console.error('Band fetch error:', res.status, res.statusText);
      throw new Error('Failed to fetch band');
    }
    const band = await res.json();
    console.log('Band loaded:', band);

    document.getElementById('bandName').textContent = band.band_name || 'Band name unavailable';
    
    const bandCard = document.getElementById('bandCard');
    bandCard.addEventListener('click', () => {
      window.location.href = `/band/${bandId}`;
    });
  } catch (err) {
    console.error('Load band error:', err);
    document.getElementById('bandName').textContent = 'Failed to load band';
  }
}


