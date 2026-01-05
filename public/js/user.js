document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('userLoginForm');
  if(loginForm) {
    handleUserLogin();
  }

  const userDashboard = document.getElementById('userDashboard');
  if(userDashboard) {  
    checkUserAuth();
  }

});



async function handleUserLogin() {
    const form = document.getElementById('userLoginForm');
  const errorMessage = document.getElementById('errorMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    errorMessage.style.display = 'none';

    if (!email || !password) {
      return;
    }

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/user-dashboard';
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

async function checkUserAuth() {
  try {
    const response = await fetch('/api/user/profile');
    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      window.location.href = '/user-login';
    } else {
      console.log('User authenticated!!!!AIDA', data.user.username);
    }
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '/user-login';
  }
}  