import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { Pool } from 'pg';
import giftData from '../data/gifts.js';

// Create a pool with SSL for Render
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false }
});

// Function to create the gifts table
const createGiftsTable = async () => {
  const createTableQuery = `
    DROP TABLE IF EXISTS gifts;
    CREATE TABLE IF NOT EXISTS gifts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      health VARCHAR(10) NOT NULL,
      image VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
    );
  `;

  

  try {
    await pool.query(createTableQuery);
    console.log('🎉 gifts table created successfully');
  } catch (err) {
    console.error('⚠️ error creating gifts table', err);
    throw err; // stop execution if table creation fails
  }
};

// Function to seed gifts table
const seedGiftsTable = async () => {
  await createGiftsTable();

  for (const gift of giftData) {
    const insertQuery = `
      INSERT INTO gifts
      (name, health, image, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
      gift.name,
      gift.health,
      gift.image,
      gift.description      
    ];

    try {
      await pool.query(insertQuery, values);
      console.log(`✅ ${gift.name} added successfully`);
    } catch (err) {
      console.error('⚠️ error inserting gift', err);
    }
  }

  await pool.end(); // close the pool when done
  console.log('🎉 All gifts seeded successfully');
};

// Run the seeding
seedGiftsTable().catch(err => {
  console.error('❌ Seeding failed', err);
  pool.end();
});
