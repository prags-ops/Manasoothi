const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",       // your MySQL password
  database: "mansoothi_db"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL connected");
  }
});

module.exports = db;
