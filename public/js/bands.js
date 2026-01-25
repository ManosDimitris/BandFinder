document.addEventListener("DOMContentLoaded", async () => {
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (pathParts.length === 1) {
    await loadBands();
  } else if (pathParts.length === 2) {
    await loadBandDetails(pathParts[1]);
  }
});

async function loadBandDetails(bandId) {
  try {
    const response = await fetch(`/api/bands/${bandId}`);
    const band = await response.json();

    const container = document.getElementById("bandContainer");

    if (!band || band.error) {
      container.innerHTML = '<p class="error">Band not found</p>';
      return;
    }

    container.innerHTML = `
      <div class="band-detail">
        <h1>${band.band_name || "Unknown Band"}</h1>
        <img src="../assets/images/bands.jpg" alt="${band.band_name || "Band"
      }" class="band-detail-image">
        <div class="band-detail-info">
          <p><strong>Genre:</strong> ${band.genre || "TBA"}</p>
          <p><strong>Founded:</strong> ${band.foundedYear || "TBA"}</p>
          <p><strong>Members:</strong> ${band.members_number || "TBA"}</p>
          <p><strong>City:</strong> ${band.band_city || "TBA"}</p>
          <p><strong>Description:</strong> ${band.band_description || "No description available"
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


async function loadBands() {
  try {
    // API is mounted under /api/band in server (routes/bandsRoutes.js)
    const response = await fetch("/api/bands");
    const bands = await response.json();

    if (bands && bands.length > 0) {
      const container = document.getElementById("bandContainer");
      if (!container) {
        console.error('bandContainer element not found in DOM');
        return;
      }
      container.innerHTML = "";
      const bandsList = document.createElement("div");

      bandsList.className = 'band-list';
      bands.forEach((band) => {
        const bandElement = document.createElement("div");
        bandElement.className = 'band-item';
        bandElement.innerHTML = `
          <h3>${band.band_name || 'Unnamed Band'}</h3>
          <p><strong>Genre:</strong> ${band.genre || 'TBA'}</p>
          <p><strong>City:</strong> ${band.band_city || 'TBA'}</p>
          <a class="details-link" onClick="window.location.href='/band/${band.band_id}'" style="cursor:pointer;">View Details</a>
        `;
        bandsList.appendChild(bandElement);
      });

      container.appendChild(bandsList);

    } else {
      document.getElementById("bandContainer").innerHTML = "No bands found right now!";
    }

  } catch (error) {
    console.error("Error loading bands:", error);
    document.getElementById("bandContainer").innerHTML =
      '<p class="error">Could not load bands</p>';
  }
}
