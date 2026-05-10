const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'shopwave.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// ─── Create Tables ────────────────────────────────────────────────────────────

const createTables = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT    NOT NULL,
        email     TEXT    NOT NULL UNIQUE,
        password  TEXT    NOT NULL,
        created_at TEXT   DEFAULT (datetime('now'))
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        description TEXT    NOT NULL,
        price       REAL    NOT NULL CHECK(price >= 0),
        category    TEXT    NOT NULL,
        image       TEXT    DEFAULT 'https://via.placeholder.com/300x300?text=Product',
        stock       INTEGER DEFAULT 100,
        rating      REAL    DEFAULT 4.0 CHECK(rating >= 0 AND rating <= 5),
        reviews     INTEGER DEFAULT 0,
        created_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS cart (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity   INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
        UNIQUE(user_id, product_id)
      );
    `, () => {
      console.log('SQLite database initialized at:', DB_PATH);
    });
  });
};

createTables();

module.exports = db;
