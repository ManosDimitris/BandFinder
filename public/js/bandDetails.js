document.addEventListener('DOMContentLoaded', () => {
  const id = getIdFromPath();
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
  } catch (err) {
    console.error('Load band error:', err);
    return;
  }
}
