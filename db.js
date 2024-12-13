const { Client } = require('pg');
require('dotenv').config();

/**
 * Creates a new PostgreSQL client and connects to the database.
 * @returns {Client} A connected PostgreSQL client instance.
 */
async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DATABASE_HOST || null,
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USERNAME || null,
    password: process.env.DATABASE_PASSWORD || null,
    database: process.env.DATABASE_NAME || null,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  return client;
}

module.exports = { getClient };