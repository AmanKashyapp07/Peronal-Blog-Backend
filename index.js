require("dotenv").config();
const pool = require("/Users/amankashyap/Documents/blog_backend/config/db.js");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();

/* =========================
   CORS CONFIG (MUST BE FIRST)
   ========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://personal-blog-frontend-tau.vercel.app", // optional, can keep
  "https://amankashyap.site",
  "https://www.amankashyap.site"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // IMPORTANT: do NOT throw error
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);



/* =========================
   MIDDLEWARES
   ========================= */
app.use(express.json());

/* =========================
   ROUTES
   ========================= */
app.use("/api", routes);
// DELETE comment route
// DELETE a comment
app.delete(
  "/api/blogs/:id/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const commentResult = await pool.query(
        "SELECT id, blog_id, user_id FROM comments WHERE id = $1",
        [commentId]
      );

      if (commentResult.rows.length === 0) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const comment = commentResult.rows[0];

      const blogResult = await pool.query(
        "SELECT author_id FROM blogs WHERE id = $1",
        [comment.blog_id]
      );

      if (blogResult.rows.length === 0) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const blog = blogResult.rows[0];

      if (
        Number(blog.author_id) !== Number(userId) &&
        Number(comment.user_id) !== Number(userId)
      ) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment" });
      }

      await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

      return res.sendStatus(204);
    } catch (err) {
      console.error("DELETE COMMENT ERROR:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get("/api/test-auth", authMiddleware, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});
/* =========================
   ERROR HANDLER (LAST)
   ========================= */
app.use(errorMiddleware);

/* =========================
   SERVER START
   ========================= */
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});

