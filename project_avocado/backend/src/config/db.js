// mysql2/promise를 사용하면 async/await 문법으로 깔끔하게 쿼리를 작성할 수 있습니다.
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("MySQL DB Connection pool created.");

module.exports = pool;