const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./userKeys.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS userKeys (
    wallet TEXT PRIMARY KEY,
    salt TEXT NOT NULL,
    iv TEXT NOT NULL,
    ciphertext TEXT NOT NULL
  )`);
});

module.exports = db;
