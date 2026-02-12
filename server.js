const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json()); // This MUST be above your routes!
app.use(express.json()); 

// Debugging middleware: This will print every request to your terminal
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});// Add this line too, just to be safe

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "mansoothi_db"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err.message);
    return;
  }
  console.log("✅ MySQL connected");
  
  // Manually ensure the database is being used
  db.query("USE mansoothi_db", (err) => {
    if (err) console.error("❌ Could not find database 'mansoothi_db'. Please create it in MySQL Workbench.");
  });
});

// ANALYTICS
db.query(`
  CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// RESOURCES
db.query(`
  CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// ANNOUNCEMENTS
db.query(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// QUIZ RESULTS
db.query(`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
// Serve HTML & CSS files
app.use(express.static(__dirname));

// Root route → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// ======================
// AUTH ROUTES
// ======================

app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || "user";

  const sql = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
  db.query(sql, [email, hashedPassword, userRole], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Registration successful" });
  });
});


// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      return res.json({ message: "Login successful", userId: user.id });
    } catch (error) {
      return res.status(500).json({ message: "Bcrypt comparison failed" });
    }
  });
});

// ======================
// ANALYTICS
// ======================
app.post("/analytics", (req, res) => {
  const { page } = req.body;

  const sql = "INSERT INTO analytics (page) VALUES (?)";
  db.query(sql, [page], err => {
    if (err) return res.status(500).json({ message: "Error saving analytics" });
    res.json({ message: "Analytics saved" });
  });
});

app.get("/admin/analytics", (req, res) => {
  db.query("SELECT * FROM analytics", (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
});

// ======================
// RESOURCES
// ======================
app.post("/admin/resources", (req, res) => {
  const { title, content } = req.body;

  const sql = "INSERT INTO resources (title, content) VALUES (?, ?)";
  db.query(sql, [title, content], err => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ message: "Resource added" });
  });
});

app.get("/resources", (req, res) => {
  db.query("SELECT * FROM resources", (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
});

// ======================
// ANNOUNCEMENTS
// ======================
app.post("/admin/announcements", (req, res) => {
  const { message } = req.body;

  const sql = "INSERT INTO announcements (message) VALUES (?)";
  db.query(sql, [message], err => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ message: "Announcement sent" });
  });
});

app.get("/announcements", (req, res) => {
  db.query("SELECT * FROM announcements", (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
});

// ======================
// QUIZ RESULTS
// ======================
app.post("/quiz-result", (req, res) => {
  const { user_id, score } = req.body;

  const sql = "INSERT INTO quiz_results (user_id, score) VALUES (?, ?)";
  db.query(sql, [user_id, score], err => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ message: "Quiz result saved" });
  });
});

app.get("/admin/quiz-results", (req, res) => {
  db.query("SELECT * FROM quiz_results", (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
});

// ======================
// START SERVER
// ======================
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
// Serve HTML & CSS files
app.use(express.static(__dirname));

// Root route → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

