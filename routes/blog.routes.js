const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  getAllCommentsByBlog,
  addComment
} = require("../controllers/blog.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

/* =========================
   PUBLIC ROUTES
   ========================= */
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.get("/:id/comments", getAllCommentsByBlog);

/* =========================
   AUTH ROUTES
   ========================= */
router.get("/my", authMiddleware, getMyBlogs);

// comments
router.post("/:id/comments", authMiddleware, addComment);

/* =========================
   LIKE / UNLIKE (INLINE)
   ========================= */

// LIKE
// LIKE A BLOG
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.userId;

    // 1. Try to insert the like
    const insertResult = await pool.query(
      `INSERT INTO blog_likes (blog_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (blog_id, user_id) DO NOTHING`,
      [blogId, userId]
    );

    // 2. Only increment if a new row was actually inserted
    // (insertResult.rowCount will be 0 if the user already liked it)
    if (insertResult.rowCount > 0) {
      await pool.query(
        "UPDATE blogs SET like_count = like_count + 1 WHERE id = $1",
        [blogId]
      );
    }

    // 3. Return the updated count
    const { rows } = await pool.query(
      "SELECT like_count FROM blogs WHERE id = $1",
      [blogId]
    );

    res.json({ liked: true, likeCount: rows[0].like_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to like blog" });
  }
});

// UNLIKE A BLOG
router.delete("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.userId;

    // 1. Try to delete the like
    const deleteResult = await pool.query(
      `DELETE FROM blog_likes
       WHERE blog_id = $1 AND user_id = $2`,
      [blogId, userId]
    );

    // 2. Only decrement if a row was actually deleted
    if (deleteResult.rowCount > 0) {
      await pool.query(
        "UPDATE blogs SET like_count = like_count - 1 WHERE id = $1",
        [blogId]
      );
    }

    // 3. Return the updated count
    const { rows } = await pool.query(
      "SELECT like_count FROM blogs WHERE id = $1",
      [blogId]
    );

    res.json({ liked: false, likeCount: rows[0].like_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unlike blog" });
  }
});

// LIKE STATUS (Unchanged - this was already correct)
router.get("/:id/like-status", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.userId; // Ensure your authMiddleware sets this

    // Check if a row exists in blog_likes for this user+blog
    const { rows } = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM blog_likes
         WHERE blog_id = $1 AND user_id = $2
       ) AS liked`,
      [blogId, userId]
    );

    res.json({ liked: rows[0].liked });
  } catch (err) {
    console.error("Error fetching like status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ADMIN ROUTES
   ========================= */
router.post("/", authMiddleware, adminMiddleware, createBlog);
router.put("/:id", authMiddleware, adminMiddleware, updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);

module.exports = router;