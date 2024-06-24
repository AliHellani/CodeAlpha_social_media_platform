const likeRepository = require("../repositories/like_repository");

//Like a Post
async function likePost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const result = await likeRepository.likePost({
      post_id: postId,
      user_id: userId,
    });

    if (result.success) {
      res.status(201).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error liking post:", error.message);
    res.status(500).json({ error: "An error occurred while liking the post" });
  }
}

//Unlike a Post
async function unlikePost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const result = await likeRepository.unlikePost({
      post_id: postId,
      user_id: userId,
    });

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error Unlike post:", error.message);
    res.status(500).json({ error: "An error occurred while Unlike the post" });
  }
}

// Get the number of likes for a post
async function getLikes(req, res) {
  try {
    const { postId } = req.params;
    const likeCount = await likeRepository.getLikeCount(postId);

    if (likeCount !== null) {
      res.status(200).json({ like_count: likeCount });
    } else {
      res
        .status(500)
        .json({ error: "An error occurred while getting the like count" });
    }
  } catch (error) {
    console.error("Error getting like count:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while getting the like count" });
  }
}

module.exports = {
  likePost,
  unlikePost,
  getLikes,
};
