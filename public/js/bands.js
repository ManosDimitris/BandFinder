document.addEventListener("DOMContentLoaded", async () => {
  await checkUserAuth();
  setupFilters();
  
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (pathParts.length === 1 || pathParts[pathParts.length - 1] === "bands.html") {
    await loadBands();
  } else if (pathParts.length === 2) {
    await loadBandDetails(pathParts[1]);
  }
});

let isUserAuthenticated = false;

async function checkUserAuth() {
  try {
    const response = await fetch("/api/user/profile");
    const data = await response.json();
    isUserAuthenticated = data.authenticated || false;
  } catch (error) {
    isUserAuthenticated = false;
  }
}

// THE IMPLIMENTATION FOR THE FITLERS IN ORDER TO WORK
function setupFilters() {
  const applyBtn = document.getElementById("applyBtn");
  const resetBtn = document.getElementById("resetBtn");
  
  if (applyBtn) applyBtn.addEventListener("click", applyFilters);
  if (resetBtn) resetBtn.addEventListener("click", resetFilters);
}
// ACTUALLY APPLYING THE FILTERS
function applyFilters() {
  const genre = document.getElementById("musicGenre").value.toLowerCase();
  const year = document.getElementById("foundedYear").value;
  const city = document.getElementById("city").value.toLowerCase();

  
  loadBands(genre, year, city);
}
// RESET IF NEEDED
function resetFilters() {
  document.getElementById("musicGenre").value = "";
  document.getElementById("foundedYear").value = "";
  document.getElementById("city").value = "";
  loadBands();
}

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
        <img src="../assets/images/bands.jpg" alt="${
          band.band_name || "Band"
        }" class="band-detail-image">
        <div class="band-detail-info">
          <p><strong>Genre:</strong> ${band.music_genres}</p>
          <p><strong>Founded:</strong> ${band.foundedYear}</p>
          <p><strong>Members:</strong> ${band.members_number }</p>
          <p><strong>City:</strong> ${band.band_city}</p>
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
      '<p class="error">Can\'t load band details</p>';
  }
}

async function loadBands(filterGenre = "", filterYear = "", filterCity = "") {
  try {
    const bandsGrid = document.getElementById("bandsGrid");

    const response = await fetch("/api/bands");
    let bands = await response.json();

    if (filterGenre || filterYear || filterCity) {
      bands = bands.filter(band => {
        const genreMatch = !filterGenre || (band.music_genre && band.music_genre.toLowerCase().includes(filterGenre));
        const yearMatch = !filterYear || band.foundedYear === parseInt(filterYear);
        const cityMatch = !filterCity || (band.city && band.city.toLowerCase().includes(filterCity));
        return genreMatch && yearMatch && cityMatch;
      });
    }

    if (bands && bands.length > 0) {
      bandsGrid.innerHTML = "";
      bandsGrid.className = "bands-grid";

      bands.forEach((band) => {
        const rating = (band.average_rating || 0).toFixed(1);
        const isAvailable = band.available === 1 || band.available === true;

        let actionButtons = `
          <button class="band-btn-view" onclick="openBandDetail('${band.band_id}')">View Band</button>`;

        if (isUserAuthenticated) {
          actionButtons += `
            <button class="band-btn-request" onclick="requestPrivateEvent('${band.band_id}')" ${!isAvailable ? "disabled" : ""}>Request Event</button>`;
        } else {
          actionButtons += `<button class="band-btn-login" onclick="window.location.href='/user-login'">Login to Request</button>`;
        }

        const bandElement = document.createElement("div");
        bandElement.className = "band-item";
        bandElement.innerHTML = `
          <div class="band-image">
            <img src="../assets/images/bands.jpg" alt="${ 
              band.band_name || "Band"
            }">
          </div>
          <div class="band-content">
            <div class="band-name">${band.band_name }</div>
            <div class="band-genre">${band.genre}</div>
            <div class="band-description">
              ${band.band_description}
            </div>
            <div class="band-stats">
              <div class="stat-item">
                <div class="stat-number">${rating}</div>
                <div class="stat-label">Rating</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${band.review_count || 0}</div>
                <div class="stat-label">Reviews</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${band.foundedYear || "-"}</div>
                <div class="stat-label">Year Founded</div>
              </div>
            </div>
            </div>
            <div class="band-actions">
              ${actionButtons}
            </div>
        `;
        bandsGrid.appendChild(bandElement);
      });
    } else {
      bandsGrid.innerHTML = "<p>No bands found!!</p>";
    }
  } catch (error) {
    console.error("Error loading the bands", error);
    const bandsGrid = document.getElementById("bandsGrid");
    if (bandsGrid) {
      bandsGrid.innerHTML = '<p class="error">Could not load bands</p>';
    }
  }
}

function openBandDetail(bandId) {
  window.location.href = `/band/${bandId}`;
}

function requestPrivateEvent(bandId) {
  if (!isUserAuthenticated) {
    window.location.href = "/user-login";
    return;
  }
}
