const pool = require("../config/db");

const getAllBlogs = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blogs ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM blogs WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// CREATE BLOG (ADMIN)
const createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.id;

    await pool.query(
      "INSERT INTO blogs (title, content, author_id) VALUES ($1, $2, $3)",
      [title, content, authorId]
    );

    res.status(201).json({ message: "Blog created" });
  } catch (err) {
    next(err);
  }
};

// UPDATE BLOG (ADMIN)
const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const authorId = req.user.id;

    const result = await pool.query(
      "UPDATE blogs SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND author_id = $4 RETURNING *",
      [title, content, id, authorId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.status(200).json({ message: "Blog updated" });
  } catch (err) {
    next(err);
  }
};

// DELETE BLOG (ADMIN)
const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    const result = await pool.query(
      "DELETE FROM blogs WHERE id = $1 AND author_id = $2 RETURNING *",
      [id, authorId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};


const getMyBlogs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM blogs WHERE author_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getAllCommentsByBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         id,
         username,
         content,
         created_at
       FROM comments
       WHERE blog_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    // 1. Get blog_id from the URL parameter (:id)
    const { id } = req.params; 
    
    // 2. Get content from the request body
    const { content } = req.body;
    
    // 3. Get user_id from the authMiddleware (assumed attached to req.user)
    const userId = req.user.id;

    // 4. Validate input
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // 5. Insert into database
    const newComment = await pool.query(
      `INSERT INTO comments (blog_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, content, created_at, (SELECT username FROM users WHERE id = $2) as username`,
      [id, userId, content]
    );

    // 6. Return the newly created comment (with username included for immediate display)
    res.status(201).json(newComment.rows[0]);

  } catch (err) {
    console.error(err.message);
    next(err); // Pass to your error handling middleware
  }
};
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId || req.user?.id || req.user?.userId;

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
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    return res.sendStatus(204);
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  getAllCommentsByBlog, 
  addComment,
  deleteComment
};