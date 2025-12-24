require("dotenv").config();

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
app.delete('/api/blogs/:blogId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id; // From your JWT token

        // 1. Check if the Blog exists and belongs to the requesting user
        const blogResult = await pool.query(
            "SELECT * FROM blogs WHERE id = $1", 
            [blogId]
        );

        if (blogResult.rows.length === 0) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const blog = blogResult.rows[0];

        // 2. Security Check: Is the requester the AUTHOR of the blog?
        if (blog.author_id !== userId) {
            return res.status(403).json({ message: "Only the blog author can delete comments here." });
        }

        // 3. Delete the comment
        await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

        res.sendStatus(204); // Success, no content
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
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

