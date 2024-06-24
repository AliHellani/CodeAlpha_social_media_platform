const sql = require("mssql");
const pool = require("../configuration/db");

//Like a Post
async function likePost(likeData) {
  try {
    await pool.connect();

    const query = `INSERT INTO likes (created_at, post_id, user_id)
    VALUES(GETDATE(), @post_id, @user_id)`;

    const result = await pool
      .request()
      .input("post_id", sql.Int, likeData.post_id)
      .input("user_id", sql.Int, likeData.user_id)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Like created successfully" };
    } else {
      return { success: false, message: "Failed to create Like" };
    }
  } catch (error) {
    console.error("Error creating like:", error.message);

    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Unlike a Post
async function unlikePost(unlikeData) {
  try {
    await pool.connect();

    const query = `DELETE FROM likes WHERE post_id = @post_id AND user_id = @user_id`;

    const result = await pool
      .request()
      .input("post_id", sql.Int, unlikeData.post_id)
      .input("user_id", sql.Int, unlikeData.user_id)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Like removed successfully" };
    } else {
      return { success: false, message: "Failed to remove Like" };
    }
  } catch (error) {
    console.error("Error removing like:", error.message);

    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

// Get Like Count for a Post
async function getLikeCount(postId) {
  try {
    await pool.connect();
    const query = `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = @post_id`;
    const result = await pool
      .request()
      .input("post_id", sql.Int, postId)
      .query(query);

    return result.recordset[0].like_count;
  } catch (error) {
    console.error("Error getting like count:", error.message);
    return null;
  }
}

module.exports = {
  likePost,
  unlikePost,
  getLikeCount,
};
