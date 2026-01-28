document.addEventListener("DOMContentLoaded", () => {
    setupLoginTabs();
    handleBandLogin();
    handleBandRegister();
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
        const email = prompt('Enter your email:');
        if (email) {
          alert('Password reset link will be sent to: ' + email);
        }
      });
    }
  }
  
  // 2. BAND LOGIN
  
  async function handleBandLogin() {
    const form = document.getElementById("bandLoginForm");
    if (!form) return;
    
    const errorMessage = document.getElementById("errorMessage");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
  
      if (!email || !password) {
        showError(errorMessage, "Email and password required");
        return;
      }
  
      if (errorMessage) {
        errorMessage.style.display = "none";
      }
  
      try {
        const response = await fetch("/api/bands/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (response.ok && data.success) {
          sessionStorage.setItem("bandId", data.band.band_id);
          sessionStorage.setItem("bandName", data.band.band_name);
          sessionStorage.setItem("bandEmail", data.band.email);
          
          window.location.href = "/band-dashboard";
        } else {
          showError(errorMessage, data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        showError(errorMessage, "Error occurred");
      }
    });
  }

  
  async function handleBandRegister() {
    const form = document.getElementById("bandRegisterForm");
    if (!form) return;
    
    const errorMessage = document.getElementById("signupErrorMessage");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const bandName = document.getElementById("bandName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const musicGenre = document.getElementById("musicGenre").value;
      const bandDescription = document.getElementById("bandDescription").value.trim();
      
      const otherGenres = document.getElementById("otherGenres").value.trim();
      const country = document.getElementById("bandCountry").value.trim();
      const city = document.getElementById("bandCity").value.trim();
      const yearFormed = document.getElementById("yearFormed").value || null;
      const memberCount = document.getElementById("memberCount").value || null;
      const contactPhone = document.getElementById("contactPhone").value.trim();
      const website = document.getElementById("website").value.trim();
      const socialMedia = document.getElementById("socialMedia").value.trim();
      const instrumentsNeeded = document.getElementById("instrumentsNeeded").value.trim();
      
      const lookingForCheckboxes = document.querySelectorAll('input[name="lookingFor"]:checked');
      const lookingFor = Array.from(lookingForCheckboxes).map(cb => cb.value).join(',');
  
      if (!bandName || !email || !password || !confirmPassword || !musicGenre || !bandDescription) {
        showError(errorMessage, "Fill in required fields");
        return;
      }
  
      if (password.length < 6) {
        showError(errorMessage, "Password min 6 characters");
        return;
      }
  
      if (password !== confirmPassword) {
        showError(errorMessage, "Passwords don't match");
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError(errorMessage, "Invalid email");
        return;
      }
  
      if (errorMessage) {
        errorMessage.style.display = "none";
      }
  
      try {
        const response = await fetch("/api/bands/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            band_name: bandName,
            email,
            password,
            music_genre: musicGenre,
            band_description: bandDescription,
            other_genres: otherGenres,
            country,
            city,
            year_formed: yearFormed,
            members_number: memberCount,
            contact_phone: contactPhone,
            website,
            social_media: socialMedia,
            looking_for: lookingFor,
            instruments_needed: instrumentsNeeded
          }),
        });
  
        const data = await response.json();
  
        if (response.ok && data.success) {
          alert("Registration successful!");
          document.querySelector('[data-tab="login"]').click();
          form.reset();
        } else {
          showError(errorMessage, data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showError(errorMessage, "Error during registration");
      }
    });
  }

  function showError(errorElement, message) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }