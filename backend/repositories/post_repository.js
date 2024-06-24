const sql = require("mssql");
const pool = require("../configuration/db");

//Create Post
async function savePost(postData) {
  try {
    await pool.connect();
    const query = `
        INSERT INTO posts (content, created_at, updated_at, user_id)
        VALUES(@content, GETDATE(), GETDATE(), @user_id)
        `;
    const result = await pool
      .request()
      .input("content", sql.Text, postData.content)
      .input("user_id", sql.Int, postData.user_id)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Post created successfully" };
    } else {
      return { success: false, message: "Failed to create post" };
    }
  } catch (error) {
    console.error("Error creating post:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Find All Post
async function findAllPost() {
  try {
    await pool.connect();

    const query = `SELECT posts.post_id, posts.content, posts.created_at, posts.updated_at, users.user_id, users.username, users.profile_picture
    FROM posts
    INNER JOIN users ON posts.user_id = users.user_id`;

    const result = await pool.request().query(query);

    return result.recordset;
  } catch (error) {
    console.error("Error retrieving Posts:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Find Post By ID
async function findPostById(id) {
  try {
    await pool.connect();
    const query = `SELECT * FROM posts WHERE post_id = @id`;
    const result = await pool.request().input("id", sql.Int, id).query(query);

    if (result.recordset.length > 0) {
      return result.recordset[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving Post By ID:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Update Post
async function updatePost(id, postData) {
  try {
    await pool.connect();

    const fieldsToUpdate = [];
    if (postData.content) fieldsToUpdate.push("content = @content");

    if (fieldsToUpdate.length === 0) {
      return { success: false, message: "No fields to update" };
    }

    const query = `
        UPDATE posts SET ${fieldsToUpdate.join(", ")}, updated_at = GETDATE()
        WHERE post_id = @post_id
        `;

    const request = await pool.request().input("post_id", sql.Int, id);
    if (postData.content) request.input("content", sql.Text, postData.content);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Post updated successfully" };
    } else {
      return { success: false, message: "Post not found" };
    }
  } catch (error) {
    console.error("Error updating post:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Delete Post
async function deletePost(postId, userId) {
  try {
    await pool.connect();

    const deleteLikesQuery = `DELETE FROM likes WHERE post_id = @postId`;
    await pool
      .request()
      .input("postId", sql.Int, postId)
      .query(deleteLikesQuery);

    const deleteCommentQuery = `DELETE FROM comments WHERE post_id = @postId`;
    await pool
      .request()
      .input("postId", sql.Int, postId)
      .query(deleteCommentQuery);

    const query = `DELETE FROM posts WHERE post_id = @postId AND user_id = @userId`;
    const result = await pool
      .request()
      .input("postId", sql.Int, postId)
      .input("userId", sql.Int, userId)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Post Deleted Successfully" };
    } else {
      return { success: false, message: "Post Not Found" };
    }
  } catch (error) {
    console.error("Error Deleting Post:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

module.exports = {
  savePost,
  findAllPost,
  findPostById,
  updatePost,
  deletePost,
};
