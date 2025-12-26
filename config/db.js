
console.log("DATABASE_URL =", process.env.DB_URL);
console.log("NODE_ENV =", process.env.NODE_ENV);

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;

