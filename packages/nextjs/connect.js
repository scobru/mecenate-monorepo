const sqlite3 = require("sqlite3").verbose();

// Connecting to or creating a new SQLite database file
const db = new sqlite3.Database(
  "./collection.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the SQlite database.");
  }
);

// Serialize method ensures that database queries are executed sequentially
db.serialize(() => {
  // Create the items table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY,
        vaultId TEXT,
        address TEXT,
        encryptedPK TEXT
      )`,
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Created items table.");

      // Clear the existing data in the products table
      db.run(`DELETE FROM items`, (err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log("All rows deleted from items");

        // Insert new data into the products table
        const values1 = [
          "0x00",
          "0x00",
          "0x00",
        ];

        const insertSql = `INSERT INTO items(vaultId, address, encryptedPK) VALUES(?, ?, ?)`;

        db.run(insertSql, values1, function (err) {
          if (err) {
            return console.error(err.message);
          }
          const id = this.lastID; // get the id of the last inserted row
          console.log(`Rows inserted, ID ${id}`);
        });

        //   Close the database connection after all insertions are done
        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log("Closed the database connection.");
        });
      });
    }
  );
});
