import { serve } from "bun";
import { db, type User, type Class, type Subject, type Question } from "./db";
import { signToken, getAuthUser, type JWTPayload } from "./auth";
import index from "./index.html";

// Auth middleware helpers
async function requireAuth(req: Request): Promise<JWTPayload | Response> {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

async function requireAdmin(req: Request): Promise<JWTPayload | Response> {
  const result = await requireAuth(req);
  if (result instanceof Response) return result;
  if (result.role !== "admin") {
    return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  return result;
}

async function requireTeacher(req: Request): Promise<JWTPayload | Response> {
  const result = await requireAuth(req);
  if (result instanceof Response) return result;
  // Allow admin to act as teacher? Or strictly teacher? Let's be strict for now or allow admin.
  // Common practice: Admin > User. But here let's require 'teacher'.
  if (result.role !== "teacher") {
    return Response.json({ error: "Forbidden: Teacher access required" }, { status: 403 });
  }
  return result;
}

const server = serve({
  port: parseInt(process.env.PORT || "3000"),
  routes: {
    "/*": index,

    // --- Authentication ---
    "/api/admin/stats": {
      async GET(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const counts = db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM classes) as classes,
                    (SELECT COUNT(*) FROM users WHERE role = 'teacher') as teachers,
                    (SELECT COUNT(*) FROM users WHERE role = 'student' AND class_id IS NOT NULL) as students
            `).get() as any;
        return Response.json(counts);
      }
    },
    "/api/login": {
      async POST(req) {
        const { username, password } = await req.json() as any;
        const user = db.query("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as User | undefined;
        if (user) {
          const token = await signToken({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
          });
          return Response.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, role: user.role, name: user.name }
          });
        }
        return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
      }
    },

    "/api/me": {
      async GET(req) {
        const user = await getAuthUser(req);
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        return Response.json({ user });
      }
    },

    // --- User Management (Admin) ---
    "/api/admin/users": {
      async GET(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        // Filter by role?
        const url = new URL(req.url);
        const role = url.searchParams.get("role");
        let query = "SELECT id, username, role, name, email, class_id FROM users";
        let params: any[] = [];
        if (role) {
          query += " WHERE role = ?";
          params.push(role);
        }
        query += " ORDER BY id DESC";
        const users = db.query(query).all(...params) as User[];

        // Enrich with class name if needed, or join
        if (role === 'student') {
          const usersWithClass = db.query(`
                    SELECT u.id, u.username, u.role, u.name, u.email, u.class_id, c.name as class_name 
                    FROM users u 
                    LEFT JOIN classes c ON u.class_id = c.id 
                    WHERE u.role = 'student'
                    ORDER BY u.id DESC
                 `).all();
          return Response.json(usersWithClass);
        }
        return Response.json(users);
      },
      async POST(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        try {
          const insert = db.prepare("INSERT INTO users (username, password, role, name, email, class_id) VALUES (?, ?, ?, ?, ?, ?)");
          insert.run(body.username, body.password || "123456", body.role, body.name, body.email || null, body.class_id || null);
          return Response.json({ success: true });
        } catch (e) {
          return Response.json({ success: false, message: "Username likely exists" }, { status: 400 });
        }
      },
      async PUT(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        const update = db.prepare("UPDATE users SET name = ?, email = ?, password = ?, class_id = ? WHERE id = ?");
        update.run(body.name, body.email || null, body.password, body.class_id, body.id);
        return Response.json({ success: true });
      }
    },
    "/api/admin/users/:id": {
      async PUT(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        const update = db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        update.run(body.name, body.email || null, req.params.id);
        return Response.json({ success: true });
      },
      async DELETE(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        db.run("DELETE FROM users WHERE id = ?", [req.params.id]);
        return Response.json({ success: true });
      }
    },

    // --- Teacher Portal ---
    "/api/teacher/classes": {
      async GET(req) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        const url = new URL(req.url);
        const teacherId = url.searchParams.get("teacher_id");
        if (!teacherId) return Response.json([]);

        const classes = db.query(`
                SELECT c.*, (SELECT COUNT(*) FROM users u WHERE u.class_id = c.id AND u.role = 'student') as student_count
                FROM classes c 
                WHERE c.teacher_id = ?
                ORDER BY c.id DESC
            `).all(teacherId) as any[];
        return Response.json(classes);
      }
    },

    // --- Subject Management ---
    "/api/teacher/subjects": {
      async GET(req) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        const url = new URL(req.url);
        const teacherId = url.searchParams.get("teacher_id");
        let query = "SELECT * FROM subjects";
        let params: any[] = [];
        if (teacherId) {
          query += " WHERE teacher_id = ?";
          params.push(teacherId);
        }
        query += " ORDER BY id DESC";
        return Response.json(db.query(query).all(...params) as Subject[]);
      },
      async POST(req) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        const insert = db.prepare(`
                INSERT INTO subjects (name, description, background, teacher_id, status) 
                VALUES (?, ?, ?, ?, ?)
            `);
        insert.run(body.name, body.description || null, body.background || null, body.teacher_id, body.status || 'draft');
        return Response.json({ success: true });
      }
    },
    "/api/teacher/subjects/:id": {
      async GET(req: any) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        return Response.json(db.query("SELECT * FROM subjects WHERE id = ?").get(req.params.id));
      },
      async PUT(req: any) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        const update = db.prepare(`
                UPDATE subjects SET name = ?, description = ?, background = ?, status = ? 
                WHERE id = ?
            `);
        update.run(body.name, body.description, body.background, body.status, req.params.id);
        return Response.json({ success: true });
      },
      async DELETE(req: any) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        db.run("DELETE FROM subjects WHERE id = ?", [req.params.id]);
        // Cascade delete questions handled by DB or manually:
        db.run("DELETE FROM questions WHERE subject_id = ?", [req.params.id]);
        return Response.json({ success: true });
      }
    },

    // --- Question Management ---
    "/api/teacher/subjects/:id/questions": {
      async GET(req: any) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        const questions = db.query("SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC").all(req.params.id) as Question[];
        return Response.json(questions);
      },
      async POST(req: any) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        const insert = db.prepare(`
                INSERT INTO questions (subject_id, text, type, options) 
                VALUES (?, ?, ?, ?)
             `);
        // options should be stringified JSON
        const optionsStr = typeof body.options === 'string' ? body.options : JSON.stringify(body.options || []);
        insert.run(req.params.id, body.text, body.type, optionsStr);
        return Response.json({ success: true });
      }
    },
    "/api/teacher/questions/:id": {
      async DELETE(req: any) {
        const auth = await requireTeacher(req);
        if (auth instanceof Response) return auth;

        db.run("DELETE FROM questions WHERE id = ?", [req.params.id]);
        return Response.json({ success: true });
      }
    },

    // --- Class Management (Admin) ---
    "/api/admin/classes": {
      async GET(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        // Join with teacher name
        const classes = db.query(`
                SELECT c.*, u.name as teacher_name 
                FROM classes c 
                LEFT JOIN users u ON c.teacher_id = u.id
                ORDER BY c.id DESC
            `).all() as Class[];
        return Response.json(classes);
      },
      async POST(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        const insert = db.prepare("INSERT INTO classes (name, description, teacher_id) VALUES (?, ?, ?)");
        const result = insert.run(body.name, body.description || null, body.teacher_id);
        return Response.json({ success: true, id: result.lastInsertRowid });
      },
      async PUT(req) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        db.run("UPDATE classes SET name = ?, description = ?, teacher_id = ? WHERE id = ?", [body.name, body.description || null, body.teacher_id, body.id]);
        return Response.json({ success: true });
      }
    },
    "/api/admin/classes/:id": {
      async GET(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const cls = db.query(`
          SELECT c.*, u.name as teacher_name 
          FROM classes c 
          LEFT JOIN users u ON c.teacher_id = u.id
          WHERE c.id = ?
        `).get(req.params.id);

        if (!cls) {
          return Response.json({ error: "Class not found" }, { status: 404 });
        }
        return Response.json(cls);
      },
      async DELETE(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        db.run("DELETE FROM classes WHERE id = ?", [req.params.id]);
        db.run("UPDATE users SET class_id = NULL WHERE class_id = ?", [req.params.id]);
        return Response.json({ success: true });
      }
    },
    "/api/admin/classes/:id/students": {
      async GET(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const students = db.query(`
          SELECT id, username, name, email 
          FROM users 
          WHERE class_id = ? AND role = 'student'
          ORDER BY id DESC
        `).all(req.params.id);
        return Response.json(students);
      },
      async POST(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const body = await req.json() as any;
        try {
          const insert = db.prepare(
            "INSERT INTO users (username, password, role, name, email, class_id) VALUES (?, ?, 'student', ?, ?, ?)"
          );
          insert.run(body.username, body.password || "123456", body.name, body.email || null, req.params.id);
          return Response.json({ success: true });
        } catch (e) {
          return Response.json({ success: false, message: "Username already exists" }, { status: 400 });
        }
      }
    },
    "/api/admin/classes/:id/students/import": {
      async POST(req: any) {
        const auth = await requireAdmin(req);
        if (auth instanceof Response) return auth;

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
          return Response.json({ error: "No file provided" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.trim().split("\n");

        // Skip header row if it looks like a header
        const startIndex = lines[0]?.toLowerCase().includes("username") ? 1 : 0;

        let imported = 0;
        let errors: string[] = [];

        const insert = db.prepare(
          "INSERT INTO users (username, password, role, name, email, class_id) VALUES (?, ?, 'student', ?, ?, ?)"
        );

        for (let i = startIndex; i < lines.length; i++) {
          const lineContent = lines[i];
          if (!lineContent) continue;
          const line = lineContent.trim();
          if (!line) continue;

          const parts = line.split(",").map(p => p.trim());
          const [username, name, email] = parts;

          if (!username || !name) {
            errors.push(`Line ${i + 1}: Missing username or name`);
            continue;
          }

          try {
            insert.run(username, "123456", name, email || null, req.params.id);
            imported++;
          } catch (e) {
            errors.push(`Line ${i + 1}: Username "${username}" already exists`);
          }
        }

        return Response.json({ success: true, imported, errors });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" ? {
    hmr: true,
    console: true,
  } : undefined,
});

console.log(`🚀 Server running at ${server.url}`);
