const { Pool } = require("pg");

const pool = new Pool({
  user: "amankashyap",   // change per system
  host: "localhost",
  database: "blog_db",
  port: 5432,
});



module.exports = pool;