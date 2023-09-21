const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS messages (username TEXT, message TEXT, timestamp TEXT)");
});

module.exports = db;
