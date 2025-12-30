
const { createConnection } = require("mysql2/promise");

let db;

(async () => {
  try {
    db = await createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "hy359_2025",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(30) NOT NULL UNIQUE,
          email VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(32) NOT NULL,
          firstname VARCHAR(30) NOT NULL,
          lastname VARCHAR(30) NOT NULL,
          birthdate DATE NOT NULL,
          gender VARCHAR(10) NOT NULL,
          country VARCHAR(30) NOT NULL,
          city VARCHAR(30),
          address VARCHAR(100) NOT NULL,
          telephone VARCHAR(20) NOT NULL,
          lat DOUBLE,
          lon DOUBLE,
          role VARCHAR(20) NOT NULL DEFAULT 'user'
       )
      `;

    const createBandsTableQuery = `
          CREATE TABLE IF NOT EXISTS bands (
    band_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    band_name VARCHAR(100) NOT NULL UNIQUE,
    music_genres VARCHAR(100) NOT NULL,
    band_description VARCHAR(500) NOT NULL,
    members_number INT NOT NULL,
    foundedYear INT NOT NULL,
    band_city VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    webpage VARCHAR(255) ,
    photo VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'band'
      )`;
    const createAdminsTableQuery = `
    CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE
  )
    `;

    const createReviewsTableQuery = `
    CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    band_name VARCHAR(100) NOT NULL,
    sender VARCHAR(100) NOT NULL,
    review VARCHAR(800) NOT NULL,
    rating INT NOT NULL,
    date_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (band_name) REFERENCES bands(band_name)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  )
    `;

    const createMessagesTableQuery = `
  CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    private_event_id INT NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    recipient VARCHAR(50) NOT NULL,
    date_time DATETIME NOT NULL,
    FOREIGN KEY (private_event_id) REFERENCES private_events(private_event_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  )`;

    const createPublicEventsTableQuery = `
  CREATE TABLE IF NOT EXISTS public_events (
    public_event_id INT AUTO_INCREMENT PRIMARY KEY,
    band_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_datetime DATETIME NOT NULL,
    event_description VARCHAR(800) NOT NULL,
    participants_price DECIMAL(10,2) NOT NULL,
    event_city VARCHAR(100) NOT NULL,
    event_address VARCHAR(255) NOT NULL,
    event_lat DOUBLE,
    event_lon DOUBLE,
    FOREIGN KEY (band_id) REFERENCES bands(band_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  )`;

    const createPrivateEventsTableQuery = `
  CREATE TABLE IF NOT EXISTS private_events (
    private_event_id INT AUTO_INCREMENT PRIMARY KEY,
    band_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    band_decision VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_datetime DATETIME NOT NULL,
    event_description VARCHAR(800) NOT NULL,
    event_city VARCHAR(100) NOT NULL,
    event_address VARCHAR(255) NOT NULL,
    event_lat DOUBLE,
    event_lon DOUBLE,
    FOREIGN KEY (band_id) REFERENCES bands(band_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  )
  `;

    await db.query(createUsersTableQuery);
    await db.query(createBandsTableQuery);
    await db.query(createAdminsTableQuery);
    await db.query(createPrivateEventsTableQuery);
    await db.query(createPublicEventsTableQuery);
    await db.query(createReviewsTableQuery);
    await db.query(createMessagesTableQuery);
    //Create a default admin if not exists
    const insertAdminQuery = `INSERT IGNORE INTO admins (username, password, email) VALUES (?, ?, ?)`;
    await db.query(insertAdminQuery, ['admin', 'admiN12@*', 'admin2004@gmail.com']);
  } catch (err) {
    console.error("Database initialization error:", err);
    process.exit(1);
  }
})();

module.exports = {
  query: async (sql, params) => {
    if (!db) {
      throw new Error("Database not initialized yet");
    }
    return db.query(sql, params);
  },
};