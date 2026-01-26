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

    document.getElementById('eventName').textContent = event.event_name ;
    document.getElementById('eventDate').textContent = event.event_datetime ? new Date(event.event_datetime).toLocaleString() : '-';
    document.getElementById('eventLocation').textContent = event.location ;
    document.getElementById('eventCity').textContent = event.event_city ;
    document.getElementById('eventPrice').textContent = event.participants_price != null ? `$${event.participants_price}` : '-';
  } catch (err) {
    console.error('Load event error:', err);
    return;
  }
}


