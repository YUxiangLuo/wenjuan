import { serve } from "bun";
import { Database } from "bun:sqlite";
import index from "./index.html";

const db = new Database("todos.sqlite");
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

const server = serve({
  port: process.env.PORT || 3000,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/todos": {
      GET(req) {
        const todos = db.query("SELECT * FROM todos ORDER BY id DESC").all();
        return Response.json(todos);
      },
      async POST(req) {
        const body = await req.json();
        if (!body.text) {
          return new Response("Missing text", { status: 400 });
        }
        const insert = db.prepare("INSERT INTO todos (text) VALUES (?)");
        const info = insert.run(body.text);
        return Response.json({ id: info.lastInsertRowid, text: body.text, completed: 0 });
      },
    },

    "/api/todos/:id": {
      async PATCH(req) {
        const id = req.params.id;
        const body = await req.json();
        const update = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
        update.run(body.completed ? 1 : 0, id);
        return Response.json({ success: true });
      },
      DELETE(req) {
        const id = req.params.id;
        db.run("DELETE FROM todos WHERE id = ?", [id]);
        return Response.json({ success: true });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" ? {
    hmr: true,
    console: true,
  } : undefined,
});

console.log(`🚀 Server running at ${server.url}`);
