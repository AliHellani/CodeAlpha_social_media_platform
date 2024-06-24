const postRepository = require("../repositories/post_repository");

// Create Post
async function createPost(req, res) {
  try {
    const postData = {
      content: req.body.content,
      user_id: req.user.id,
    };

    const result = await postRepository.savePost(postData);

    if (result.success) {
      res.status(201).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Find All Posts
async function findAllPost(req, res) {
  try {
    const posts = await postRepository.findAllPost();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Find Post By ID
async function findPostById(req, res) {
  try {
    const postId = req.params.id;
    const post = await postRepository.findPostById(postId);

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ error: "Post Not Found" });
    }
  } catch (error) {
    console.error("Error retrieving Post:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Update Post
async function updatePost(req, res) {
  try {
    const postId = req.params.id;
    const postData = req.body;
    const result = await postRepository.updatePost(postId, postData);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else if (result.message === "Post not found") {
      res.status(404).json({ error: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Delete Post
async function deletePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await postRepository.findPostById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the logged-in user is the creator of the post
    if (post.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await postRepository.deletePost(postId, userId);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(404).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error Deleting Post:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createPost,
  findAllPost,
  findPostById,
  updatePost,
  deletePost,
};
