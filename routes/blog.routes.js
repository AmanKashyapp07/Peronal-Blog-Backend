const express = require("express");
const router = express.Router();

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

// PUBLIC ROUTES
router.get("/", getAllBlogs);
router.get("/my", authMiddleware, getMyBlogs);

router.get("/:id", getBlogById);
router.get("/:id/comments", getAllCommentsByBlog);

// AUTH ROUTES (COMMENTS)
router.post("/:id/comments", authMiddleware, addComment);

// ADMIN ROUTES
router.post("/", authMiddleware, adminMiddleware, createBlog);
router.put("/:id", authMiddleware, adminMiddleware, updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);

module.exports = router;