document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  loadBandProfile();
  setupEventListeners();
  setupPasswordToggle();
  setupTabSwitching();
  setupAvailabilityListeners();
  setupPrivateEventsListeners();
  setupPublicEventsListeners();
  loadMessages();
  setupReviewsListeners();
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

function setupAvailabilityListeners() {
  const saveAvailabilityBtn = document.getElementById("saveAvailabilityBtn");
  
  if (saveAvailabilityBtn) {
    saveAvailabilityBtn.addEventListener("click", handleSaveAvailability);
  }

  loadAvailability();
}

function loadAvailability() {
  const savedAvailability = localStorage.getItem("bandAvailability");
  
  if (savedAvailability) {
    const availability = JSON.parse(savedAvailability);
    
    const statusSelect = document.getElementById("availabilityStatus");
    if (statusSelect) statusSelect.value = availability.status || "available";
    
    const notesTextarea = document.getElementById("availabilityNotes");
    if (notesTextarea) notesTextarea.value = availability.notes || "";
  }

  displayAvailabilityStatus();
}

function displayAvailabilityStatus() {
  const savedAvailability = localStorage.getItem("bandAvailability");
  const statusText = document.getElementById("statusText");
  const periodText = document.getElementById("availabilityPeriod");
  const noteDisplay = document.getElementById("availabilityNoteDisplay");

  if (!savedAvailability) {
    if (statusText) statusText.textContent = "No availability status set";
    if (periodText) periodText.textContent = "";
    if (noteDisplay) noteDisplay.textContent = "";
    return;
  }

  const availability = JSON.parse(savedAvailability);
  const status = availability.status;
  const notes = availability.notes;

  if (statusText) {
    switch (status) {
      case "available":
        statusText.textContent = "Currently Available";
        statusText.style.color = "#28a745";
        break;
      case "unavailable":
        statusText.textContent = "Not Available";
        statusText.style.color = "#dc3545";
        break;
      default:
        statusText.textContent = "Unknown Status";
    }
  }

  if (periodText) {
    periodText.textContent = "";
  }

  if (noteDisplay) {
    if (notes) {
      noteDisplay.textContent = `${notes}`;
    } else {
      noteDisplay.textContent = "";
    }
  }
}

async function handleSaveAvailability() {
  const availabilityData = {
    status: document.getElementById("availabilityStatus").value,
    notes: document.getElementById("availabilityNotes").value.trim(),
  };

  if (!availabilityData.status) {
    showNotification("Please select an availability status", "error");
    return;
  }

  try {
    localStorage.setItem("bandAvailability", JSON.stringify(availabilityData));
    showSuccessMessage("Availability saved successfully");
    displayAvailabilityStatus();
  } catch (error) {
    console.error("Error saving availability:", error);
    showNotification("Error saving availability", "error");
  }
}

function setupPrivateEventsListeners() {

  const eventForm = document.getElementById("privateEventForm");

  if (eventForm) {
    eventForm.addEventListener("submit", handleAddPrivateEvent);
  }

  loadPrivateEvents();
}



async function handleAddPrivateEvent(e) {
  e.preventDefault();

  const eventData = {
    eventName: document.getElementById("eventName").value.trim(),
    eventDate: document.getElementById("eventDate").value,
    eventTime: document.getElementById("eventTime").value,
    eventLocation: document.getElementById("eventLocation").value.trim(),
    eventDescription: document.getElementById("eventDescription").value.trim(),
    eventBudget: document.getElementById("eventBudget").value || 0,
  };

  if (!eventData.eventName || !eventData.eventDate || !eventData.eventTime || !eventData.eventLocation) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  try {
    const response = await fetch("/api/bands/private-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Private event created successfully");
    
      loadPrivateEvents();
    } else {
      showNotification(data.error || "Error creating event", "error");
    }
  } catch (error) {
    console.error("Error creating event:", error);
    showNotification("Error creating private event", "error");
  }
}

async function loadPrivateEvents() {
  try {
    const response = await fetch("/api/bands/private-events", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.events) {
      displayPrivateEvents(data.events);
    }
  } catch (error) {
    console.error("Error loading private events:", error);
  }
}

function displayPrivateEvents(events) {
  const eventsList = document.getElementById("privateEventsList");
  
  if (!eventsList) return;

  if (events.length === 0) {
    eventsList.innerHTML = "<p>No private events yet. Create one to get started!</p>";
    return;
  }

  eventsList.innerHTML = events.map((event) => {
    const eventDate = new Date(event.event_datetime);
    const isRequested = event.status === 'requested';
    
    return `
      <div class="event-card">
        <div class="event-header">
          <h4>${event.event_type || "Unnamed Event"}</h4>
          <span class="event-status ${event.status}">${event.status}</span>
        </div>
        <p><strong>Date:</strong> ${eventDate.toLocaleDateString()} ${eventDate.toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${event.event_city}, ${event.event_address}</p>
        <p><strong>Description:</strong> ${event.event_description || "No description"}</p>
       <p><strong>Price:</strong><span class="price">$${parseFloat(event.price || 0).toFixed(2)}</span></p>
        ${event.user_id ? `<p><strong>User ID:</strong> ${event.user_id}</p>` : ''}
        ${event.band_decision ? `<p><strong>Band Decision:</strong> ${event.band_decision}</p>` : ''}
        
        ${isRequested ? `
          <div class="event-actions">
            <button class="btn-approve" onclick="handleApproveEvent(${event.id})">Approve</button>
            <button class="btn-reject" onclick="handleRejectEvent(${event.id})">Reject</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

async function handleApproveEvent(eventId) {
  try {
    const response = await fetch(`/api/bands/private-events/${eventId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status: "to_be_done",
        band_decision: "approved"
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Event approved successfully");
      loadPrivateEvents();
    } else {
      showNotification(data.error || "Error approving event", "error");
    }
  } catch (error) {
    console.error("Error approving event:", error);
    showNotification("Error approving event", "error");
  }
}

async function handleRejectEvent(eventId) {
  const reason = prompt("Please provide a reason for rejection:");
  
  if (reason === null) return; 

  try {
    const response = await fetch(`/api/bands/private-events/${eventId}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status: "rejected",
        band_decision: reason || "Event rejected"
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Event rejected successfully");
      loadPrivateEvents();
    } else {
      showNotification(data.error || "Error rejecting event", "error");
    }
  } catch (error) {
    console.error("Error rejecting event:", error);
    showNotification("Error rejecting event", "error");
  }
}

async function handleDeleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) {
    return;
  }

  try {
    const response = await fetch(`/api/bands/private-events/${eventId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Event deleted successfully");
      loadPrivateEvents();
    } else {
      showNotification(data.error || "Error deleting event", "error");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    showNotification("Error deleting event", "error");
  }
}

function setupPublicEventsListeners() {
  const addEventBtn = document.getElementById("addPublicEventBtn");
  const modal = document.getElementById("eventFormModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const publicEventForm = document.getElementById("publicEventForm");

  if (addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (publicEventForm) {
    publicEventForm.addEventListener("submit", handleAddPublicEvent);
  }

  loadPublicEvents();
}

async function handleAddPublicEvent(e) {
  e.preventDefault();

  const eventData = {
    eventName: document.getElementById("eventName").value.trim(),
    eventDate: document.getElementById("eventDate").value,
    eventTime: document.getElementById("eventTime").value,
    eventLocation: document.getElementById("eventLocation").value.trim(),
    eventDescription: document.getElementById("eventDescription").value.trim(),
    eventBudget: document.getElementById("eventBudget").value || 0,
  };

  if (!eventData.eventName || !eventData.eventDate || !eventData.eventTime || !eventData.eventLocation) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  try {
    const response = await fetch("/api/bands/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Public event created successfully");
      document.getElementById("publicEventForm").reset();
      document.getElementById("eventFormModal").classList.add("hidden");
      loadPublicEvents();
    } else {
      showNotification(data.error || "Error creating event", "error");
    }
  } catch (error) {
    console.error("Error creating event:", error);
    showNotification("Error creating public event", "error");
  }
}

async function loadPublicEvents() {
  try {
    const response = await fetch("/api/bands/events", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (Array.isArray(data)) {
      displayPublicEvents(data);
    } else {
      showNotification("Error loading public events", "error");
    }
  } catch (error) {
    console.error("Error loading public events:", error);
    showNotification("Error loading public events", "error");
  }
}

function displayPublicEvents(events) {
  const publicEventsList = document.getElementById("publicEventsList");
  
  if (!publicEventsList) return;

  if (events.length === 0) {
    publicEventsList.innerHTML = "<p>No public events available at the moment.</p>";
  } else {
    publicEventsList.innerHTML = '<div class="events-grid">' + 
      events.map((event) => {
        const eventDate = new Date(event.event_datetime);
        return `
          <div class="event-card">
            <div class="event-header">
              <h4>${event.event_type || "Unnamed Event"}</h4>
            </div>
            <p><strong>Date: </strong> ${eventDate.toLocaleDateString()} ${eventDate.toLocaleTimeString()}</p>
            <p><strong>Location: </strong> ${event.event_city}, ${event.event_address}</p>
            <p><strong>Description: </strong> ${event.event_description || "No description"}</p>
            <p><strong>Price: </strong><span class="price">$${parseFloat(event.participants_price || 0).toFixed(2)}</span></p>
          </div>
        `;
      }).join("") + 
      '</div>';
  }
}

async function loadMessages() {
  try {
    const response = await fetch("/api/bands/messages", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.messages) {
      displayMessages(data.messages);
    }
  } catch (error) {
    console.error("Error loading messages:", error);
    showNotification("Error loading messages", "error");
  }
}

function displayMessages(messages) {
  const messagesContainer = document.getElementById("messagesContainer");
  
  if (!messagesContainer) return;

  if (messages.length === 0) {
    messagesContainer.innerHTML = "<p>No messages yet.</p>";
    return;
  }


  const groupedMessages = {};
  messages.forEach(msg => {
    if (!groupedMessages[msg.private_event_id]) {
      groupedMessages[msg.private_event_id] = [];
    }
    groupedMessages[msg.private_event_id].push(msg);
  });

  messagesContainer.innerHTML = Object.entries(groupedMessages).map(([eventId, msgs]) => {
    const chatMessages = msgs.map((msg) => {
      const msgDate = new Date(msg.date_time);
      const isFromBand = msg.sender === 'band';
      const senderName = isFromBand ? 'You' : (msg.username || msg.sender);
      
      return `
        <div class="chat-message ${isFromBand ? 'sent' : 'received'}">
          <div class="message-sender">${senderName}</div>
          <div class="message-content">${msg.message}</div>
          <div class="message-time">${formatTime(msgDate)}</div>
        </div>
      `;
    }).join("");

    return `
      <div class="conversation-thread">
        <div class="thread-header">
          <h4>Event ID: ${eventId}</h4>
        </div>
        <div class="chat-messages" id="chat-${eventId}">
          ${chatMessages}
        </div>
        </div>
        <div class="chat-input-area">
          <textarea id="reply-${eventId}" class="chat-input" placeholder="Type your reply..."></textarea>
          <button class="btn-send-message" onclick="handleSendReply(${eventId})">Send</button>
        </div>
    `;
  }).join("");

 
  Object.keys(groupedMessages).forEach(eventId => {
    const chatContainer = document.getElementById(`chat-${eventId}`);
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
}

async function handleSendReply(eventId) {
  const replyText = document.getElementById(`reply-${eventId}`).value.trim();

  if (!replyText) {
    showNotification("Please enter a message", "error");
    return;
  }

  try {
    const response = await fetch("/api/bands/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        privateEventId: eventId,
        message: replyText,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage("Reply sent successfully");
      document.getElementById(`reply-${eventId}`).value = '';
      loadMessages();
      // THE TIMOUT IS FOR THE MESSAGE TO GO BEFORE THE OTHERR
      setTimeout(() => {
        const chatContainer = document.getElementById(`chat-${eventId}`);
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } else {
      showNotification(data.error || "Error sending reply", "error");
    }
  } catch (error) {
    console.error("Error sending reply:", error);
    showNotification("Error sending reply", "error");
  }
}

function setupReviewsListeners() {
  loadReviews();
}

async function loadReviews() {
  try {
    const response = await fetch("/api/bands/reviews", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.reviews) {
      displayReviews(data.reviews);
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
    showNotification("Error loading reviews", "error");
  }
}

function displayReviews(reviews) {
  const reviewsContainer = document.getElementById("reviewsContainer");
  
  if (!reviewsContainer) return;

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  reviewsContainer.innerHTML = `
    <div class="reviews-list">
      ${reviews.map((review) => {
        const reviewDate = new Date(review.date_time);
        return `
          <div class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <strong>${review.sender}</strong>
                <span class="review-status ${review.status}">${review.status}</span>
              </div>
              <div class="review-rating">${generateStars(review.rating)}</div>
            </div>
            <p class="review-text">${review.review}</p>
            <small class="review-date">${formatDateTime(reviewDate)}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '<img src="../assets/images/star.png" alt="star" class="star" />';
  }

  if (hasHalfStar) {
    stars += '<img src="../assets/images/half-star.png" alt="half star" class="star" />';
  }

  return stars;
}

// Helper functions for time formatting
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function formatDateTime(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}