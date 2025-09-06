const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/hackdb';

const pool = new Pool({
  connectionString,
});

async function initDB() {
  const maxRetries = 10;
  const retryDelay = 3000; // 3 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Connecting to the database...`);
      await pool.query('SELECT 1'); // Test connection
      console.log('Database connection successful!');
      return pool; // Return the pool once connected
    } catch (err) {
      console.error(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1); // Exit the process if all retries fail
      }
      console.log(`Waiting ${retryDelay / 1000} seconds before retrying...`);
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }
}

// Optional: function to close the pool gracefully
async function closeDB() {
  await pool.end();
  console.log('Database connection closed.');
}

module.exports = {
  pool,
  initDB,
  closeDB,
};
