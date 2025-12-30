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

/* =========================================================
   1. SPECIFIC ROUTES (MUST BE AT THE TOP)
   ========================================================= */

// Get My Blogs (MUST be before /:id, otherwise "my" is treated as an ID)
router.get("/my", authMiddleware, getMyBlogs);

// Like Status
router.get("/:id/like-status", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.userId || (req.user && req.user.id) || (req.user && req.user.userId);

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

// ==========================================
// LIKE A BLOG (Fixed ID Extraction)
// ==========================================
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;

    // --- FIX: CHECK ALL POSSIBLE LOCATIONS FOR USER ID ---
    // different middlewares attach it differently (req.user.id vs req.userId)
    const userId = req.userId || (req.user && req.user.id) || (req.user && req.user.userId);

    // DEBUGGING LOG (Check your Render logs if this fails!)
    console.log(`[LIKE ATTEMPT] Blog: ${blogId}, User: ${userId}`);

    if (!userId) {
      console.error("CRITICAL: User ID is missing from request object.");
      return res.status(500).json({ message: "Server Error: User ID not found" });
    }

    // 1. Try to insert
    const insertResult = await pool.query(
      `INSERT INTO blog_likes (blog_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (blog_id, user_id) DO NOTHING`,
      [blogId, userId]
    );

    // 2. Increment count if inserted
    if (insertResult.rowCount > 0) {
      await pool.query(
        "UPDATE blogs SET like_count = like_count + 1 WHERE id = $1",
        [blogId]
      );
    }

    // 3. Return updated count
    const { rows } = await pool.query(
      "SELECT like_count FROM blogs WHERE id = $1",
      [blogId]
    );

    res.json({ liked: true, likeCount: rows[0].like_count });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Failed to like blog" });
  }
});

// ==========================================
// UNLIKE A BLOG (Fixed ID Extraction)
// ==========================================
router.delete("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    
    // --- FIX: SAME CHECK HERE ---
    const userId = req.userId || (req.user && req.user.id) || (req.user && req.user.userId);

    if (!userId) {
      return res.status(500).json({ message: "Server Error: User ID not found" });
    }

    // 1. Try to delete
    const deleteResult = await pool.query(
      `DELETE FROM blog_likes
       WHERE blog_id = $1 AND user_id = $2`,
      [blogId, userId]
    );

    // 2. Decrement count if deleted
    if (deleteResult.rowCount > 0) {
      await pool.query(
        "UPDATE blogs SET like_count = like_count - 1 WHERE id = $1",
        [blogId]
      );
    }

    // 3. Return updated count
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

// Comments (Get & Post)
router.get("/:id/comments", getAllCommentsByBlog);
router.post("/:id/comments", authMiddleware, addComment);

/* =========================================================
   2. GENERIC ROUTES (MUST BE AT THE BOTTOM)
   ========================================================= */

// Get All Blogs
router.get("/", getAllBlogs);

// Get Single Blog by ID (This captures ANYTHING, so it must be last of the GETs)
router.get("/:id", getBlogById);

/* =========================================================
   3. ADMIN ROUTES
   ========================================================= */
router.post("/", authMiddleware, adminMiddleware, createBlog);
router.put("/:id", authMiddleware, adminMiddleware, updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);

module.exports = router;