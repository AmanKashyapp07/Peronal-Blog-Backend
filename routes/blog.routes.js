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
  addComment, deleteComment
} = require("../controllers/blog.controller");
const { getLikeStatus, likeBlog, unlikeBlog } = require("../controllers/like.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");



router.get("/my", authMiddleware, getMyBlogs);
router.delete("/:id/comments/:commentId", authMiddleware, deleteComment);
router.get("/:id/like-status", authMiddleware, getLikeStatus);
router.post("/:id/like", authMiddleware, likeBlog);
router.delete("/:id/like", authMiddleware, unlikeBlog);
router.get("/:id/comments", getAllCommentsByBlog);
router.post("/:id/comments", authMiddleware, addComment);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", authMiddleware, adminMiddleware, createBlog);
router.put("/:id", authMiddleware, adminMiddleware, updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);

module.exports = router;