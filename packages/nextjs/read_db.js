// Import the sqlite3 module
const sqlite3 = require("sqlite3").verbose();

// Connect to the database
let db = new sqlite3.Database("./userKeys.db", err => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("Connected to the database.");
});

// Read all data from the table
db.all("SELECT * FROM userKeys", [], (err, rows) => {
  if (err) {
    throw err;
  }
  // Process each row
  rows.forEach(row => {
    console.log(row);
  });
});

// Close the database connection
db.close(err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Closed the database connection.");
});
