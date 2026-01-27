document.addEventListener("DOMContentLoaded", () => {
  // LOGIN/SIGNUP 
  setupLoginTabs();
  handleUserLogin();
  handleUserSignup();
  
  //DASHBOARD
  const userDashboard = document.getElementById("userDashboard");
  if (userDashboard) {
    checkUserAuth();
    setupTabSwitching();
    setupLogout();
    setupProfileForm();
    loadProfileEvents();
    loadMessages();
    loadReviews();
  }
});

// 1. LOGIN TABS FUNCTIONALITY

function setupLoginTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const goToSignup = document.getElementById('goToSignup');
  const goToLogin = document.getElementById('goToLogin');
  
  if (tabBtns.length === 0) return;
  
  function switchTab(tabName) {
   
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
 
    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
    
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
  }
  
 
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  if (goToSignup) {
    goToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('signup');
    });
  }
  
  if (goToLogin) {
    goToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('login');
    });
  }
  
  
  const forgotPassword = document.querySelector('.forgot-password');
  if (forgotPassword) {
    forgotPassword.addEventListener('click', function(e) {
      e.preventDefault();
      const email = prompt('Please enter your email to reset password:');
      if (email) {
        alert(`Password reset link will be sent to: ${email}\n(Feature not implemented)`);
      }
    });
  }
}


// 2. USER LOGIN

async function handleUserLogin() {
  const form = document.getElementById("userLoginForm");
  if (!form) return;
  
  const errorMessage = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail") || document.getElementById("email");
    const passwordInput = document.getElementById("loginPassword") || document.getElementById("password");
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (errorMessage) {
      errorMessage.style.display = "none";
    }

    if (!email || !password) {
      if (errorMessage) {
        errorMessage.textContent = "Please fill in all fields";
        errorMessage.style.display = "block";
      }
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
        window.location.href = "/";
      } else {
        if (errorMessage) {
          errorMessage.textContent = data.message || "Login failed";
          errorMessage.style.display = "block";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (errorMessage) {
        errorMessage.textContent = "Network error. Try again!";
        errorMessage.style.display = "block";
      }
    }
  });
}

// 3. USER SIGNUP

async function handleUserSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;
  
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Get values, handling missing elements gracefully
    const getFieldValue = (id) => {
      const element = document.getElementById(id);
      return element ? element.value.trim() : '';
    };
    
    const username = getFieldValue("signupUsername");
    const email = getFieldValue("signupEmail");
    const password = getFieldValue("signupPassword");
    const confirmPassword = getFieldValue("confirmPassword");
    const firstname = getFieldValue("firstName");
    const lastname = getFieldValue("lastName");
    const birthdate = getFieldValue("birthdate");
    const gender = getFieldValue("gender");
    const country = getFieldValue("country");
    const city = getFieldValue("userCity");
    const address = getFieldValue("userAddress");
    const telephone = getFieldValue("userPhone");
    
    const errorMessage = document.getElementById("signupErrorMessage");

    if (errorMessage) {
      errorMessage.style.display = "none";
      errorMessage.textContent = "";
    }
    
    // Only validate required fields: username, email, password, confirmPassword
    if (!username || !email || !password || !confirmPassword) {
      showSignupError("Please fill in all required fields (*): Username, Email, Password, Confirm Password");
      return;
    }
    
    if (password !== confirmPassword) {
      showSignupError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      showSignupError("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSignupError("Please enter a valid email address");
      return;
    }

    const submitBtn = form.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
    
      let lat = null;
      let lon = null;
      if (address) {
        const coords = await getCoordinates(address);
        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
        }
      }
    
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username,
          email, 
          password,
          firstname: firstname || null,
          lastname: lastname || null,
          birthdate: birthdate || null,
          gender: gender || null,
          country: country || null,
          city: city || null,
          address: address || null,
          telephone: telephone || null,
          lat,
          lon
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
       
        if (errorMessage) {
          errorMessage.style.display = "block";
          errorMessage.style.background = "#e8f5e9";
          errorMessage.style.color = "#2e7d32";
          errorMessage.style.borderLeft = "4px solid #2e7d32";
          errorMessage.textContent = 'Account created successfully! Redirecting to login...';
        }
        
        setTimeout(() => {
          const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
          if (loginTab) {
            loginTab.click();
          
            const loginEmail = document.getElementById("loginEmail");
            if (loginEmail) loginEmail.value = email;
          }
        }, 2000);
        
      } else {
        showSignupError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showSignupError('Network error. Please try again.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  function showSignupError(message) {
    const errorMessage = document.getElementById("signupErrorMessage");
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      errorMessage.style.background = "#fee";
      errorMessage.style.color = "#c33";
      errorMessage.style.borderLeft = "4px solid #c33";
    }
  }
}

async function getCoordinates(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (err) {
    console.error('Coordinate fetch error:', err);
    return null;
  }
}

// 4. DASHBOARD FUNCTIONS

async function checkUserAuth() {
  try {
    const response = await fetch("/api/user/profile");
    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      window.location.href = "/user-login";
    } else {
      console.log("User authenticated:", data.user.username);
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

function setupLogout() {
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
              <p class = "info"><strong>Location:</strong> ${event.event_city
          }, ${event.event_address}</p>
              <p class = "info"><strong>Description:</strong> ${event.event_description
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

async function loadMessages() {
  const messagesContainer = document.getElementById("messagesContainer");
  if (messagesContainer) {
    try {
      const response = await fetch("/api/user/messages");
      if (!response.ok) {
        messagesContainer.innerHTML = "Failed to load messages";
        return;
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        messagesContainer.innerHTML = "No messages";
        return;
      }

      function escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
    
      const messagesByBand = {};
      data.forEach((message) => {
        const bandName = message.band_name || 'Unknown Band';
        if (!messagesByBand[bandName]) {
          messagesByBand[bandName] = [];
        }
        messagesByBand[bandName].push(message);
      });

      messagesContainer.innerHTML = '';

      for (let bandName in messagesByBand) {
        const bandMessages = messagesByBand[bandName];
      
        const bandGroup = document.createElement('div');
        bandGroup.className = 'band-message-group';
      
        const bandHeader = document.createElement('div');
        bandHeader.className = 'band-message-header';
        bandHeader.innerHTML = `
          <span class="band-name">${escapeHtml(bandName)}</span>
          <button class="expand-btn collapsed">Expand</button>
        `;
      
        const bandContent = document.createElement('div');
        bandContent.className = 'band-message-content collapsed';
      
        const messageSection = document.createElement('div');
        messageSection.className = 'message-section';
      
        bandMessages.forEach((message) => {
          const row = document.createElement('div');
          let name = '';
          let color = '';
          if (message.sender === 'band') {
            name = bandName;
            color = '#111';
          } else {
            name = 'You';
            color = '#007fff';
          }
          row.className = 'message-row';
          row.innerHTML = `
            <div class="message-sender">
              <div class="sender-name"><em>${escapeHtml(name)}</em></div>
              <div class="sender-date">${new Date(message.date_time).toLocaleString()}</div>
            </div>
            <div class="message-body">
              <div class="message-bubble" style="color: ${color};">${escapeHtml(message.message)}</div>
            </div>
          `;
          messageSection.appendChild(row);
        });
      
        bandContent.appendChild(messageSection);
        bandGroup.appendChild(bandHeader);
        bandGroup.appendChild(bandContent);
      
        const expandBtn = bandHeader.querySelector('.expand-btn');
        expandBtn.addEventListener('click', (e) => {
          e.preventDefault();
          bandContent.classList.toggle('collapsed');
          expandBtn.classList.toggle('collapsed');
          expandBtn.classList.toggle('expanded');
        });
      
        messagesContainer.appendChild(bandGroup);
      }

    } catch (error) {
      console.error("Load messages error:", error);
      messagesContainer.innerHTML = "<p>Failed to load messages.</p>";
    }
  }
}

async function loadReviews() {
  const reviewsContainer = document.getElementById("reviewsContainer");
  if (reviewsContainer) {
    try {
      const response = await fetch("/api/user/reviews");
      if (!response.ok) {
        reviewsContainer.innerHTML = "Failed to load reviews";
        return;
      }
      const data = await response.json();

      if (!data || data.length === 0) {
        reviewsContainer.innerHTML = "<p>No reviews available.</p>";
        return;
      }
      reviewsContainer.innerHTML = "";
      data.forEach((review) => {
        const reviewDiv = document.createElement("div");
        reviewDiv.classList.add("review-item");
        reviewDiv.innerHTML = `
          <div class="review-card">
            <div class="review-header">
              <h3>${review.band_name || 'Unknown Band'}</h3>  
              <div class="review-rating">
                <p class="info rating">
                  <strong>Rating:</strong> ${review.rating} / 5
                </p>
              </div>
            </div>
            <div class="review-details">
              <p class = "info"><strong>Reviewer:</strong> ${review.sender || 'Unknown'}</p>
              <p class = "info"><strong>Date:</strong> ${new Date(
          review.date_time
        ).toLocaleDateString()}</p>
              <p class = "info"><strong>Review:</strong> ${review.review
          }</p>
            </div>
          </div>   `;
        reviewsContainer.appendChild(reviewDiv);
      });
    }catch (error) {
      console.error("Load reviews error:", error);
      reviewsContainer.innerHTML = "<p>Failed to load reviews.</p>";
    }
  }
}