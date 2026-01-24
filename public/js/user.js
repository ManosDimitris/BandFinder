document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("userLoginForm");
  if (loginForm) {
    handleUserLogin();
  }

  const userDashboard = document.getElementById("userDashboard");
  if (userDashboard) {
    checkUserAuth();
    setupTabSwitching();
    Logout();
    setupProfileForm();
    loadProfileEvents();
  }
});

async function handleUserLogin() {
  const form = document.getElementById("userLoginForm");
  const errorMessage = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    errorMessage.style.display = "none";

    if (!email || !password) {
      return;
    }

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/"; //GO TO HOME PAGE
      } else {
        showError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Network error. Try again!");
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
}

async function checkUserAuth() {
  try {
    const response = await fetch("/api/user/profile");
    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      window.location.href = "/user-login";
    } else {
      console.log("User authenticated!!!!AIDA", data.user.username);
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
    window.location.href = "/user-login";
  }
}

function loadProfileData(user) {
  document.getElementById("profileName").value = user.username || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePassword").value = user.password || "";
  document.getElementById("profileFirstName").value = user.firstname || "";
  document.getElementById("profileLastName").value = user.lastname || "";
  document.getElementById("profileAddress").value = user.address || "";
  document.getElementById("profilePhone").value = user.telephone || "";
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

function Logout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("/api/user/logout", {
          method: "POST",
        });

        if (response.ok) {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed");
      }
    });
  }
}

function setupProfileForm() {
  setupPasswordToggle();

  const applyBtn = document.getElementById("applyProfileBtn");
  if (applyBtn) {
    applyBtn.addEventListener("click", async () => {
      const username = document.getElementById("profileName").value.trim();
      const email = document.getElementById("profileEmail").value.trim();
      const password = document.getElementById("profilePassword").value.trim();
      const firstName = document
        .getElementById("profileFirstName")
        .value.trim();
      const lastName = document.getElementById("profileLastName").value.trim();
      const address = document.getElementById("profileAddress").value.trim();
      const phone = document.getElementById("profilePhone").value.trim();

      if (!username) {
        alert("Username is required");
        return;
      }

      try {
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            firstName,
            lastName,
            address,
            phone,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          showSuccessMessage("Profile updated successfully!");
          document.getElementById("userNameSidebar").textContent = username;
          document.getElementById("usernameDisplay").textContent = username;
          const firstLetter = username.charAt(0).toUpperCase();
          document.getElementById("userAvatar").textContent = firstLetter;
        } else {
          alert(`Error: ${result.error || "Failed to update profile"}`);
        }
      } catch (error) {
        console.error("Profile update error:", error);
        alert("Something went wrong while updating profile");
      }
    });
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

async function loadProfileEvents() {
  const eventsContainer = document.getElementById("events");
  if (eventsContainer) {
    try {
      const response = await fetch("/api/user/events");
      const data = await response.json();

      if (data.length === 0) {
        eventsContainer.innerHTML = "<p>No upcoming events.</p>";
        return;
      }
      eventsContainer.innerHTML = "";
      data.forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event-item");
        eventDiv.innerHTML = `
          <div class="event-card">
            <div class="event-header">
                <div class="type">
                <h3>${event.event_type}</h3>
                </div>
               <div class="event-status">
                <p class="info status" data-status="${event.status}">
                  <strong>Status:</strong> ${event.status}
                </p>
              </div>
            </div>
            <div class="event-details">
              <p class = "info"><strong>Date:</strong> ${new Date(
                event.event_datetime
              ).toLocaleDateString()}</p>
              <p class = "info"><strong>Location:</strong> ${
                event.event_city
              }, ${event.event_address}</p>
              <p class = "info"><strong>Description:</strong> ${
                event.event_description
              }</p>
            </div>
            <div class="event-price">
              <p class = "info"><strong>Price:</strong> <span class="price-amount">$${event.price}</p>
            </div>
          </div>   `;
        eventsContainer.appendChild(eventDiv);
      });
    } catch (error) {
      console.error("Load events error:", error);
      eventsContainer.innerHTML = "<p>Failed to load events.</p>";
    }
  }
}
