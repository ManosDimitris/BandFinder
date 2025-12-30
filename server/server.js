const express = require("express");
const path = require("path");
const database = require("./config/database");
const session = require('express-session');
require('dotenv').config();


const app = express();
const PORT = 3000; 
const HOST = '0.0.0.0'; 

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

const adminRoutes = require('./routes/admin');

app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", "index.html"));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'login_admin.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "pages", 'admin_dashboard.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Admin login: http://${HOST}:${PORT}/admin-login`);

});

  