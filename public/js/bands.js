document.addEventListener("DOMContentLoaded", async function () {
  const pathParts = window.location.pathname.split("/");
  const bandId = pathParts[pathParts.length - 1];

  if (!bandId || bandId === "band") {
    document.getElementById("bandContainer").innerHTML =
      '<p class="error">Band not found</p>';
    return;
  }
  await loadBandDetails(bandId);
});

async function loadBandDetails(bandId) {
  try {
    const response = await fetch(`/api/band/${bandId}`);
    const band = await response.json();

    const container = document.getElementById("bandContainer");

    if (!band || band.error) {
      container.innerHTML = '<p class="error">Band not found</p>';
      return;
    }

    container.innerHTML = `
      <div class="band-detail">
        <h1>${band.band_name || "Unknown Band"}</h1>
        <img src="../assets/images/bands.jpg" alt="${
          band.band_name || "Band"
        }" class="band-detail-image">
        <div class="band-detail-info">
          <p><strong>Genre:</strong> ${band.genre || "TBA"}</p>
          <p><strong>Founded:</strong> ${band.foundedYear || "TBA"}</p>
          <p><strong>Members:</strong> ${band.members_number || "TBA"}</p>
          <p><strong>City:</strong> ${band.band_city || "TBA"}</p>
          <p><strong>Description:</strong> ${
            band.band_description || "No description available"
          }</p>
          <a href="/" class="back-link">Home</a>
        </div>
    </div>
    `;
  } catch (error) {
    console.error("Error loading band details:", error);
    document.getElementById("bandContainer").innerHTML =
      '<p class="error">CAnt load band details</p>';
  }
}
