document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  loadBandProfile();
  setupEventListeners();
  setupPasswordToggle();
  setupTabSwitching();
});

async function checkAuthentication() {
  try {
    const response = await fetch("/api/bands/profile", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!data.authenticated) {
      window.location.href = "/band-login";
    }
  } catch (error) {
    console.error("Authentication check error:", error);
    window.location.href = "/band-login";
  }
}

async function loadBandProfile() {
  try {
    const response = await fetch("/api/bands/profile", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (data.authenticated) {
      displayProfile(data.user);
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    showNotification("Error loading profile", "error");
  }
}

function displayProfile(band) {
  const bandNameEl = document.getElementById("bandnameDisplay");
  if (bandNameEl) {
    bandNameEl.textContent = band.band_name || "Band";
  }

  const bandNameSidebar = document.getElementById("bandNameSidebar");
  if (bandNameSidebar) {
    bandNameSidebar.textContent = band.band_name || "band";
  }

  const profileName = document.getElementById("profileName");
  if (profileName) profileName.value = band.username || "";

  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail) profileEmail.value = band.email || "";
  const profilePassword = document.getElementById("profilePassword");
  if (profilePassword) profilePassword.value = band.password || "";

  const profileBandName = document.getElementById("profileBandName");
  if (profileBandName) profileBandName.value = band.band_name || "";

  const profileMusicGenre = document.getElementById("profileMusicGenre");
  if (profileMusicGenre) profileMusicGenre.value = band.music_genres || "";

  const profileDescription = document.getElementById("profileDescription");
  if (profileDescription) profileDescription.value = band.band_description || "";

  const profileMemberNumber = document.getElementById("profileMemberNumber");
  if (profileMemberNumber) profileMemberNumber.value = band.members_number || "";

  const foundedYear = document.getElementById("foundedYear");
  if (foundedYear) foundedYear.value = band.foundedYear || "";

  const profileCity = document.getElementById("profileCity");
  if (profileCity) profileCity.value = band.band_city || "";

  const profileTelephone = document.getElementById("profileTelephone");
  if (profileTelephone) profileTelephone.value = band.telephone || "";

  const profileWebsite = document.getElementById("profileWebsite");
  if (profileWebsite) profileWebsite.value = band.webpage || "";
}

function setupEventListeners() {
  const applyBtn = document.getElementById("applyProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (applyBtn) {
    applyBtn.addEventListener("click", handleProfileUpdate);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();

  const formData = {
    username: document.getElementById("profileName").value.trim(),
    email: document.getElementById("profileEmail").value.trim(),
    password: document.getElementById("profilePassword").value.trim(),
    band_name: document.getElementById("profileBandName").value.trim(),
    music_genres: document.getElementById("profileMusicGenre").value.trim(),
    band_description: document.getElementById("profileDescription").value.trim(),
    members_number: document.getElementById("profileMemberNumber").value || 0,
    foundedYear: document.getElementById("foundedYear").value || new Date().getFullYear(),
    band_city: document.getElementById("profileCity").value.trim(),
    telephone: document.getElementById("profileTelephone").value.trim(),
    webpage: document.getElementById("profileWebsite").value.trim(),
  };

  if (!formData.band_name || !formData.email || !formData.music_genres) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  try {
    const response = await fetch("/api/bands/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Profile updated successfully");
      displayProfile(formData);
      loadBandProfile();
    } else {
      console.error("Update failed:", data.error);
      showNotification("Error updating profile", "error");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    showNotification("Error updating profile", "error");
  }
}

async function handleLogout() {
  try {
    const response = await fetch("/api/bands/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      sessionStorage.removeItem("bandId");
      sessionStorage.removeItem("bandName");
      sessionStorage.removeItem("bandEmail");
      window.location.href = "/band-login";
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function showSuccessMessage(message) {
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

function showNotification(message, type) {
  const notificationDiv = document.createElement("div");
  notificationDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "error" ? "#dc3545" : "#28a745"};
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notificationDiv.textContent = message;
  document.body.appendChild(notificationDiv);

  setTimeout(() => {
    notificationDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notificationDiv.remove(), 300);
  }, 3000);
}


function setupPasswordToggle() {
  const toggleBtn = document.getElementById("togglePasswordBtn");
  const passwordInput = document.getElementById("profilePassword");
  const toggleIcon = document.getElementById("togglePasswordIcon");

  if (toggleBtn && passwordInput && toggleIcon) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const isPassword = passwordInput.type === "password";

      if (isPassword) {
        passwordInput.type = "text";
        toggleIcon.src = "/assets/images/eye.png";
        toggleIcon.alt = "Hide password";
      } else {
        passwordInput.type = "password";
        toggleIcon.src = "/assets/images/hidden.png";
        toggleIcon.alt = "Show password";
      }
    });
  }
}
function setupTabSwitching() {
  const menuLinks = document.querySelectorAll(".menu-link");
  const sections = document.querySelectorAll(".dashboard-section");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const tabName = link.getAttribute("data-tab");

      menuLinks.forEach((l) => l.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active-tab"));

      link.classList.add("active");
      const targetSection = document.getElementById(tabName);
      if (targetSection) {
        targetSection.classList.add("active-tab");
      }
    });
  });
}
