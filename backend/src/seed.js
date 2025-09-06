// backend/src/seed.js
const { Client } = require("pg");

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@db:5432/hackdb";

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to database for seeding...");

    // Create users table with email + password
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar TEXT,
        initials VARCHAR(10),
        role VARCHAR(50),
        email VARCHAR(100) UNIQUE,
        password TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert sample users (ignore if already exists)
    await client.query(`
      INSERT INTO users (name, avatar, initials, role, email, password) VALUES
        ('John Doe', '/placeholder.svg?height=32&width=32', 'JD', 'Admin', 'john@example.com', 'secret'),
        ('Mike Johnson', '/placeholder.svg?height=32&width=32', 'MJ', 'Developer', 'mike@example.com', 'secret'),
        ('Alex Rivera', '/placeholder.svg?height=32&width=32', 'AR', 'Designer', 'alex@example.com', 'secret')
      ON CONFLICT (email) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO projects (id, name, description) VALUES
        (1, 'AI Assistant', 'AI-powered assistant for productivity'),
        (2, 'Flood Relief App', 'App to coordinate flood relief resources'),
        (3, 'Health Tracker', 'Track health and fitness goals'),
        (4, 'E-commerce Store', 'Simple online shopping platform'),
        (5, 'Learning Platform', 'Online courses and tutorials platform')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("🌱 Seeding complete!");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    await client.end();
  }
}

// 👉 Export the function (DO NOT call it here)
module.exports = seed;
