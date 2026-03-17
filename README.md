# BandFinder

> A web application for connecting musicians and finding bands, built as part of the **HY359 — Internet & Web Technologies** course at the **Computer Science Department, University of Crete**.

---

## Overview

**BandFinder** is a full-stack web platform that helps musicians find each other and form bands. Users can create profiles, list their instruments and music preferences, and discover other musicians looking to collaborate.

**Stack:** Node.js · JavaScript · HTML · CSS · MySQL · Apache (XAMPP)

---

## Project Structure

```
BandFinder/
├── public/         # Frontend — HTML, CSS, client-side JavaScript
├── server/         # Backend — Node.js server & API routes
├── package.json    # Project dependencies & scripts
└── package-lock.json
```

---

## Features

- Browse and search for musicians
- Create and manage a musician profile
- Filter by instrument, genre, or location
- Connect with other artists looking to form a band
- Responsive web interface

--

## Requirements

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- [XAMPP](https://www.apachefriends.org/) — for Apache and MySQL

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ManosDimitris/BandFinder.git
cd BandFinder
```

### 2. Start XAMPP

- Open the **XAMPP Control Panel**
- Start **Apache** and **MySQL**

### 3. Set up the database

- Open **phpMyAdmin** at `http://localhost/phpmyadmin`
- Create a new database (e.g. `bandfinder`)
- Import the provided SQL schema file if available, or create the tables manually

### 4. Configure the database connection

Edit the database configuration in the `server/` folder to match your XAMPP setup:

```js
host: 'localhost',
user: 'root',
password: '',       // default XAMPP password is empty
database: 'bandfinder'
```

### 5. Install Node.js dependencies

```bash
npm install
```

### 6. Start the server

```bash
npm start
```

### 7. Open in your browser

```
http://localhost:3000
```

---

## Course Information

| Field       | Details                                              |
|-------------|------------------------------------------------------|
| Course      | HY359 — Internet & Web Technologies                  |
| Department  | Computer Science, University of Crete                |
| Website     | [www.csd.uoc.gr](http://www.csd.uoc.gr)              |

---

## Author

**Manos Dimitris**
- Heraklion, Crete, Greece
- [LinkedIn](https://www.linkedin.com/in/manos-dimitris-442330273/)
- [GitHub](https://github.com/ManosDimitris)

---
This project was developed for academic purposes as part of the HY359 course at the University of Crete.
