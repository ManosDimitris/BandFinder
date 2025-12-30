document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    handleAdminLogin();
  }

  const dashboardContent = document.getElementById('adminDashboard');
  if (dashboardContent) {
    checkAdminAuth();
    setupTabSwitching();
    loadStatistics();
    renderUserManagement();
    RefreshReviews();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

function handleAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  const errorMessage = document.getElementById('errorMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    errorMessage.style.display = 'none';

    if (!username || !password) {
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/admin-dashboard';
      } else {
        showError(data.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      showError('Network error. Try again!');
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
}

async function checkAdminAuth() {
  try {
    const response = await fetch('/api/admin/profile');
    const data = await response.json();

    if (!data.authenticated) {
      window.location.href = '/admin-login';
    } else {
      const usernameDisplay = document.getElementById('adminUsername');
      if (usernameDisplay) {
        usernameDisplay.textContent = data.admin.username;
      }
      console.log('Admin authenticated!!!!AIDA', data.admin.username);
    }
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '/admin-login';
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    fetch('/api/admin/logout', {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/admin-login';
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
  }
}

//HANDLE THE TABS IN DASHBOARD
function setupTabSwitching() {
  const menu = document.querySelectorAll('.menu-link');
  menu.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tabName = link.getAttribute('data-tab');
      
      
      menu.forEach(item => item.classList.remove('active'));
      
      link.classList.add('active');
      
      const sections = document.querySelectorAll('.dashboard-section');
      sections.forEach(section => section.classList.remove('active-tab'));
      
      const selectedSection = document.getElementById(tabName);
      if (selectedSection) {
        selectedSection.classList.add('active-tab');
      }
    });
  });
}

async function loadStatistics() {
  try {
    
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawCharts);

    async function drawCharts() {
      
      const response = await fetch('/api/admin/statistics');
      const stats = await response.json();

      
      document.getElementById('totalUsers').textContent = stats.totalUsers;
      document.getElementById('totalBands').textContent = stats.totalBands;
      document.getElementById('totalEvents').textContent = stats.totalEvents;
      const revenue = Number(stats.siteRevenue) || 0;
      document.getElementById('siteRevenue').textContent = '€' + revenue.toFixed(2);

      
      const bandsByCityData = google.visualization.arrayToDataTable([
        ['City', 'Number of Bands'],
        ...stats.bandsByCity
      ]);
      const optionsBandsCity = {
        title: 'Bands by City',
        pieHole: 0.4,
        //I GOT THIS FROM https://stackoverflow.com/questions/32131668/from-where-can-i-get-list-of-all-color-patterns-used-by-google-charts
        colors: ['#264c99', '#a52a0d', '#bf7200',
            '#0c7012', '#720072', '#007294',
            '#b72153', '#4c7f00', '#8a2222',
            '#244a6f', '#723372', '#197f72',
            '#7f7f0c', '#4c2699', '#ac5600',
            '#680505', '#4b0c4d', '#256d49',
            '#3f577c', '#2c2e81', '#895619',
            '#10a017', '#8a0e62', '#d30b79',
            '#754227', '#7e930e', '#1f5969',
            '#4c6914', '#8e7b0e', '#084219',
            '#57270c'
        ],
        height: 300,
        chartArea: {
          width: '55%',
          height: '75%'
        }
      };
      new google.visualization.PieChart(document.getElementById('chart_bands_city')).draw(bandsByCityData, optionsBandsCity);

      
      const usersBandsData = google.visualization.arrayToDataTable([
        ['Category', 'Count'],
        ['Users', stats.totalUsers],
        ['Bands', stats.totalBands]
      ]);
      const optionsUsersBands = {
        title: 'Users vs Bands',
        colors: ['#264c99', '#a52a0d'],
        hAxis: {
          title: 'Type'
        },
        vAxis: {
          title: 'Count'
        }
      };
      new google.visualization.BarChart(document.getElementById('chart_users_bands')).draw(usersBandsData, optionsUsersBands);

      
      const eventsData = google.visualization.arrayToDataTable([
        ['Event Type', 'Count'],
        ['Public Events', stats.publicEvents],
        ['Private Events', stats.privateEvents]
      ]);
      const optionsEvents = {
        title: 'Public vs Private Events',
        colors: ['#4CAF50', '#FF9800'],
        pieHole: 0.4
      };
      new google.visualization.PieChart(document.getElementById('chart_events')).draw(eventsData, optionsEvents);
    }
  } catch (error) {
    console.error('Error loading thestatistics ', error);
  }
}


async function renderUserManagement() {
  try {
    const response = await fetch('/api/admin/UserManagement');
    const info = await response.json();
    
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = ''; 

    tbody.innerHTML = info.usersResult.map(user => `
      <tr id="user-row-${user.username}">
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.city || 'N/A'}</td>
        <td><button class="btn-small" onclick="DeleteUser('${user.username}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading user management ', error);
  }
}

async function DeleteUser(username) {
  if (confirm(`Are you sure you want to delete user: ${username}? This action cannot be undone.`)) {
    try {
      const response = await fetch(`/api/admin/UserManagement/${username}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (response.ok) {
        const row = document.getElementById(`user-row-${username}`);
        if (row) {
          row.remove();
        }
        alert(`${username} deleted successfully!!`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while deleting.');
    }
  }
}

async function RefreshReviews() {
  try {
    const response = await fetch('/api/admin/reviews');
    const info = await response.json();

    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = '';

    reviewsContainer.innerHTML = info.reviewsResult.map(review => `
      <div class="review-item">
        <h4>Review from ${review.sender} about ${review.band_name}</h4>
        <p><strong>Rating:</strong> ${review.rating}/5</p>
        <p><strong>Status:</strong> <span class="badge pending">${review.status}</span></p>
        <p>"${review.review}"</p>
        <div class="review-actions">
          <button class="btn-approve" onclick="ApproveReview(${review.review_id})">Approve</button>
          <button class="btn-reject" onclick="RejectReview(${review.review_id})">Reject</button>
        </div>
      </div>`).join('');

  }catch (error) {
    console.error('Error refreshing reviews ', error);
  } 
}

async function ApproveReview(reviewId) {
  try {
    const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
      method: 'PUT'
    });
    
    const result = await response.json();
    if (response.ok) {
      alert('Review approved successfully!');
      RefreshReviews();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error approving review ', error);
    alert('Something went wrong while approving.');
  }
}

async function RejectReview(reviewId) {
  try {
    if (confirm('Are you sure you want to delete this review?')) {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (response.ok) {
        alert('Review deleted successfully!');
        RefreshReviews();
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  } catch (error) { 
    console.error('Error rejecting review ', error);
    alert('Something went wrong while deleting.');
  }
}