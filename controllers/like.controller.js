const pool = require("../config/db");
const getUserId = (req) => req.userId || req.user?.id || req.user?.userId;

const getLikeStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const { rows } = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM blog_likes WHERE blog_id = $1 AND user_id = $2) AS liked",
      [id, userId]
    );

    res.json({ liked: rows[0].liked });
  } catch (err) {
    console.error("Error fetching like status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const likeBlog = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) return res.status(500).json({ message: "User ID not found" });
    await pool.query(
      "INSERT INTO blog_likes (blog_id, user_id) VALUES ($1, $2) ON CONFLICT (blog_id, user_id) DO NOTHING",
      [id, userId]
    );
    const { rows } = await pool.query("SELECT like_count FROM blogs WHERE id = $1", [id]);
    
    res.json({ liked: true, likeCount: rows[0].like_count });
  } catch (err) {
    console.error("Error liking blog:", err);
    res.status(500).json({ message: "Failed to like blog" });
  }
};

const unlikeBlog = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) return res.status(500).json({ message: "User ID not found" });

    await pool.query(
      "DELETE FROM blog_likes WHERE blog_id = $1 AND user_id = $2",
      [id, userId]
    );

    const { rows } = await pool.query("SELECT like_count FROM blogs WHERE id = $1", [id]);

    res.json({ liked: false, likeCount: rows[0].like_count });
  } catch (err) {
    console.error("Error unliking blog:", err);
    res.status(500).json({ message: "Failed to unlike blog" });
  }
};

module.exports = {
  getLikeStatus,
  likeBlog,
  unlikeBlog,
};