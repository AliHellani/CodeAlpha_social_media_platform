const sql = require("mssql");
const pool = require("../configuration/db");

//Create comment
async function saveComment(commentData) {
  try {
    if (!commentData.content.trim()) {
      return { success: false, message: "Comment content cannot be empty" };
    }

    await pool.connect();

    const query = `
            INSERT INTO comments (content, created_at, updated_at, post_id, user_id)
            VALUES (@content, GETDATE(), GETDATE(), @post_id, @user_id)
        `;

    const result = await pool
      .request()
      .input("content", sql.Text, commentData.content)
      .input("post_id", sql.Int, commentData.post_id)
      .input("user_id", sql.Int, commentData.user_id)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Comment created successfully" };
    } else {
      return { success: false, message: "Failed to create comment" };
    }
  } catch (error) {
    console.error("Error creating comment:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Find All Comments
async function findAllComments() {
  try {
    await pool.connect();
    const query = ` SELECT * FROM comments ORDER BY created_at DESC`;
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error retrieving Comments:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Find comment By ID
async function findCommentById(id) {
  try {
    await pool.connect();
    const query = `SELECT * FROM comments WHERE comment_id = @id`;
    const result = await pool.request().input("id", sql.Int, id).query(query);
    if (result.recordset.length > 0) {
      return result.recordset[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving Comment By ID:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//find Comments by PostId
async function findCommentsByPostId(postId) {
  try {
    await pool.connect();

    const query = `SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.user_id WHERE post_id = @postId ORDER BY created_at DESC`;

    const result = await pool
      .request()
      .input("postId", sql.Int, postId)
      .query(query);

    return result.recordset || [];
  } catch (error) {
    console.error("Error retrieving Comments:", error.message);
    return [];
  } finally {
    pool.close();
  }
}

// Update Comment
async function updateComment(commentId, commentData) {
  try {
    await pool.connect();

    const fieldsToUpdate = [];
    if (commentData.content) fieldsToUpdate.push("content = @content");

    if (fieldsToUpdate.length === 0) {
      return { success: false, message: "No fields to update" };
    }

    const query = `
            UPDATE comments SET ${fieldsToUpdate.join(
              ", "
            )}, updated_at = GETDATE()
            WHERE comment_id = @comment_id
        `;

    const request = pool.request().input("comment_id", sql.Int, commentId);
    if (commentData.content)
      request.input("content", sql.Text, commentData.content);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Comment updated successfully" };
    } else {
      return { success: false, message: "Comment not found" };
    }
  } catch (error) {
    console.error("Error updating comment:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Delete Comments
async function deleteComment(id) {
  try {
    await pool.connect();
    const query = `DELETE FROM comments WHERE comment_id = @id`;

    const result = await pool.request().input("id", sql.Int, id).query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Comment Deleted Successfully" };
    } else {
      return { success: false, message: "Comment Not Found" };
    }
  } catch (error) {
    console.error("Error Deleting Comment:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

module.exports = {
  saveComment,
  findAllComments,
  findCommentById,
  findCommentsByPostId,
  updateComment,
  deleteComment,
};
