// backend/src/routes.js
const bcrypt = require("bcryptjs");

module.exports.attachRoutes = function (app, pool) {
  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // =========================
  // 📂 PROJECT ROUTES
  // =========================
  app.get("/api/projects", async (req, res) => {
    try {
      const r = await pool.query("SELECT * FROM projects ORDER BY id");
      res.json(r.rows.map(normalizeProject));
    } catch (e) {
      console.error("❌ Projects fetch error:", e);
      res.status(500).json({ error: "db error" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const r = await pool.query("SELECT * FROM projects WHERE id=$1", [
        req.params.id,
      ]);
      if (r.rowCount === 0)
        return res.status(404).json({ error: "not found" });
      res.json(normalizeProject(r.rows[0]));
    } catch (e) {
      console.error("❌ Project fetch error:", e);
      res.status(500).json({ error: "db error" });
    }
  });

  // =========================
  // 📂 TASKS
  // =========================
  app.get("/api/tasks", async (req, res) => {
    try {
      const r = await pool.query("SELECT * FROM tasks ORDER BY id");
      res.json(r.rows);
    } catch (e) {
      console.error("❌ Tasks fetch error:", e);
      res.status(500).json({ error: "db error" });
    }
  });

  // =========================
  // 📂 MESSAGES
  // =========================
  app.get("/api/messages", async (req, res) => {
    try {
      const r = await pool.query(
        "SELECT * FROM messages ORDER BY created_at DESC"
      );
      res.json(r.rows);
    } catch (e) {
      console.error("❌ Messages fetch error:", e);
      res.status(500).json({ error: "db error" });
    }
  });

  // =========================
  // 📂 NOTIFICATIONS
  // =========================
  app.get("/api/notifications", async (req, res) => {
    try {
      const r = await pool.query(
        "SELECT * FROM notifications ORDER BY created_at DESC"
      );
      res.json(r.rows);
    } catch (e) {
      console.error("❌ Notifications fetch error:", e);
      res.status(500).json({ error: "db error" });
    }
  });

  // =========================
  // 📂 USERS
  // =========================
  app.get("/api/users", async (req, res) => {
    try {
      const r = await pool.query("SELECT id, name, email, role FROM users ORDER BY id");
      res.json(r.rows);
    } catch (e) {
      console.error("❌ Users fetch error:", e);
      res.status(500).json({ error: "db error" });
    }
  });

  // =========================
  // 🔑 AUTH ROUTES
  // =========================

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (name, initials, role, avatar, email, password) 
         VALUES ($1,$2,$3,$4,$5,$6) 
         RETURNING id, name, email`,
        [
          name,
          name.split(" ").map((n) => n[0]).join(""),
          "User",
          null,
          email,
          hashedPassword,
        ]
      );

      res.json(result.rows[0]);
    } catch (e) {
      console.error("❌ Signup error:", e);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    try {
      const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (e) {
      console.error("❌ Login error:", e);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // =========================
  // 🔧 Helpers
  // =========================
  function normalizeProject(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      progress: row.progress,
      members: row.members,
      tasks_summary: row.tasks_summary,
      due_date: row.due_date ? row.due_date.toISOString().slice(0, 10) : null,
      status: row.status,
      priority: row.priority,
      created_at: row.created_at ? row.created_at.toISOString().slice(0, 10) : null,
    };
  }
};
