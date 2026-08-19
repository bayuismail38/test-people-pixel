import type { QueryResult } from "pg";
import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432")
});

export const db = {
  // Method query dengan return value bertipe Promise bawaan pg library
  query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
  pool
};