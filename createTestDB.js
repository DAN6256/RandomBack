// createTestDB.js
require('dotenv').config();
const { Client } = require('pg');

// We'll read from environment variables for superuser connection
const {
  PG_SUPERUSER_DB = 'postgres',    // Typically "postgres"
  PG_SUPERUSER_USER = 'postgres',  // The DB user that can create DBs
  PG_SUPERUSER_PASSWORD = '',
  PG_SUPERUSER_HOST = 'localhost',
  PG_SUPERUSER_PORT = 5432,

  TEST_DB_NAME = 'fabtrack_test'
} = process.env;

(async () => {
  let client;
  try {
    // 1) Connect as superuser (or a user with CREATE DB)
    client = new Client({
      host: PG_SUPERUSER_HOST,
      port: PG_SUPERUSER_PORT,
      user: PG_SUPERUSER_USER,
      password: PG_SUPERUSER_PASSWORD,
      database: PG_SUPERUSER_DB
    });
    await client.connect();

    // 2) Check if DB already exists
    const checkDB = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1;`, [TEST_DB_NAME]);
    if (checkDB.rows.length > 0) {
      console.log(`Database "${TEST_DB_NAME}" already exists.`);
    } else {
      // 3) Create the database
      await client.query(`CREATE DATABASE "${TEST_DB_NAME}";`);
      console.log(`Database "${TEST_DB_NAME}" created successfully.`);
    }
  } catch (err) {
    console.error('Error creating test DB:', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
})();
