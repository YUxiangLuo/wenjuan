import { Database } from "bun:sqlite";

export const db = new Database("db.sqlite");

// Initialize Schema
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
    name TEXT NOT NULL,
    email TEXT,
    class_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    teacher_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    background TEXT,
    teacher_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('single', 'multi', 'text', 'scale')),
    options TEXT, -- JSON string for options
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )
`);

// Add default admin if not exists
const adminExists = db.query("SELECT id FROM users WHERE username = 'admin'").get();
if (!adminExists) {
  db.run(
    "INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)",
    ["admin", "admin", "admin", "Administrator"]
  );
  console.log("Created default admin user: admin/admin");
}

export type User = {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  name: string;
  email?: string;
  class_id: number | null;
};

export type Class = {
  id: number;
  name: string;
  description?: string;
  teacher_id: number | null;
};

export type Subject = {
  id: number;
  name: string;
  description?: string;
  background?: string;
  teacher_id: number;
  status: 'draft' | 'published';
};

export type Question = {
  id: number;
  subject_id: number;
  text: string;
  type: 'single' | 'multi' | 'text' | 'scale';
  options?: string; // JSON
};
