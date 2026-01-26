const express = require("express");
const path = require("path");
const database = require("./config/database");
const session = require('express-session');
const { isAdmin, isAuthenticated } = require('./Authentication/auth');
require('dotenv').config();


const app = express();
const PORT = 3000; 
const HOST = 'localhost'; 

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//SESION
app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey123!@#',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));


app.use(express.static(path.join(__dirname, "../public")));

const adminRoutes = require('./routes/adminRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api', require('./routes/main'));
app.use('/api/bands', require('./routes/bandsRoutes'));
app.use('/api/event', require('./routes/eventsRoutes'));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", "index.html"));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'login_admin.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'admin_dashboard.html'));
});

app.get('/user-login', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'login_user.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'user_dashboard.html'));
});


app.get('/band/:id', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'bandDetails.html'));
});


app.get('/event/:id', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'eventDetails.html'));
});

app.get('/events.html', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'events.html'));
});

app.get('/bands.html', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'bands.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Admin login: http://${HOST}:${PORT}/admin-login`);
  console.log(`User login: http://${HOST}:${PORT}/user-login`);
});

