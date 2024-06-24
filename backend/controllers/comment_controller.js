const commentRepository = require("../repositories/comment_repository");

// Create Comment
async function createComment(req, res) {
  try {
    const commentData = req.body;
    const result = await commentRepository.saveComment(commentData);

    if (result.success) {
      res.status(201).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error creating comment:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Find All Comments
async function findAllComments(req, res) {
  try {
    const comments = await commentRepository.findAllComments();
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error retrieving comments:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Find Comment By ID
async function findCommentById(req, res) {
  try {
    const commentId = req.params.id;
    const comment = await commentRepository.findCommentById(commentId);

    if (comment) {
      res.status(200).json(comment);
    } else {
      res.status(404).json({ error: "Comment Not Found" });
    }
  } catch (error) {
    console.error("Error retrieving Comment:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
//Find Comment by Post Id
async function findCommentsByPostId(req, res) {
  try {
    const postId = req.params.id;
    const comments = await commentRepository.findCommentsByPostId(postId);

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error retrieving comments:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Update Comment
async function updateComment(req, res) {
  try {
    const commentId = req.params.id;
    const commentData = req.body;
    const result = await commentRepository.updateComment(
      commentId,
      commentData
    );

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else if (result.message === "Comment not found") {
      res.status(404).json({ error: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Delete Comment
async function deleteComment(req, res) {
  try {
    const commentId = req.params.id;
    const comment = await commentRepository.deleteComment(commentId);
    if (comment.success) {
      res.status(200).json({ message: comment.message });
    } else {
      res.status(404).json({ error: comment.message });
    }
  } catch (error) {
    console.error("Error Deleting Comment:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createComment,
  findAllComments,
  findCommentById,
  findCommentsByPostId,
  updateComment,
  deleteComment,
};
