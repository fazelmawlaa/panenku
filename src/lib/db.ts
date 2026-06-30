import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST || "localhost",
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME || "panenku",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: true }
          : undefined,
    });
  }
  return pool;
}

export async function query<T = unknown>(
  sql: string,
  params?: unknown[],
): Promise<T> {
  const db = getPool();
  const [rows] = await db.execute(sql, params as any[]);
  return rows as T;
}

export async function initDatabase(): Promise<void> {
  const db = getPool();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('customer', 'farmer') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_id INT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}
