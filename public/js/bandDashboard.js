// BAND DASHBOARD 
document.addEventListener('DOMContentLoaded', () => {
    const bandDashboard = document.getElementById("bandDashboard");
    if (bandDashboard) {
      checkBandAuth();
      setupTabSwitching();
      setupLogout();
      setupProfileForm();
      setupAvailability();
      loadProfilePrivateEvents();
      loadProfilePublicEvents();
      loadMessages();
      loadReviews();
    }
});


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

async function checkBandAuth() {
    try {
      const response = await fetch("/api/bands/profile");
      const data = await response.json();
  
      if (!response.ok || !data.authenticated) {
        window.location.href = "/band-login";
      } else {
        console.log("Band authenticated:", data.user.username);
        document.getElementById("usernameDisplay").textContent =
          data.user.username;
        document.getElementById("userNameSidebar").textContent =
          data.user.username;
  
        const firstLetter = data.user.username.charAt(0).toUpperCase();
        document.getElementById("userAvatar").textContent = firstLetter;
  
        loadProfileData(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      window.location.href = "/band-login";
    }
}

function loadProfileData(band) {
    document.getElementById("profileName").value = band.username || "";
    document.getElementById("profileEmail").value = band.email || "";
    document.getElementById("profileBandName").value = band.band_name || "";
    document.getElementById("profileMusicGenre").value = band.music_genres || "";
    document.getElementById("profileDescription").value = band.band_description || "";
    document.getElementById("profileMemberNumber").value = band.members_number || "";
    document.getElementById("foundedYear").value = band.foundedYear || "";
    document.getElementById("profileCity").value = band.band_city || "";
    document.getElementById("profileTelephone").value = band.telephone || "";
    document.getElementById("profileWebsite").value = band.webpage || "";
}