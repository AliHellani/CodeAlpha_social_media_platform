const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const sql = require("mssql");

const db = require("./configuration/db");

const postController = require("./controllers/post_controller");
const commentController = require("./controllers/comment_controller");
const likeController = require("./controllers/like_controller");
const loginController = require("./controllers/login_controller");
const userController = require("./controllers/user_controller");
const authenticatedToken = require("./auth/auth");

require("dotenv").config({ path: "./secret.env" });

const app = express();
const PORT = process.env.PORT || 3001;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, "../frontend/images/profile-picture/");
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//static file
app.use(
  "/images/profile-picture",
  express.static(path.join(__dirname, "../frontend/images/profile-picture"))
);

app.use(express.json());

//Users
app.post(
  "/register",
  upload.single("profilePicture"),
  userController.createUser
);
app.put(
  "/updateUser/:id",
  authenticatedToken,
  upload.single("profilePicture"),
  userController.updateUser
);

//Posts
app.post("/post", authenticatedToken, postController.createPost);
app.get("/findAllPost", authenticatedToken, postController.findAllPost);
app.get("/findPostById/:id", authenticatedToken, postController.findPostById);
app.put("/updatePost/:id", authenticatedToken, postController.updatePost);
app.delete("/deletePost/:id", authenticatedToken, postController.deletePost);

//Like
app.post("/like/:postId", authenticatedToken, likeController.likePost);
app.get("/likes/:postId", authenticatedToken, likeController.getLikes);
app.delete("/unlike/:postId", authenticatedToken, likeController.unlikePost);

//Comments
app.post("/comment", authenticatedToken, commentController.createComment);
app.get(
  "/findAllComment",
  authenticatedToken,
  commentController.findAllComments
);
app.get(
  "/findCommentById/:id",
  authenticatedToken,
  commentController.findCommentById
);
app.get(
  "/findCommentByPostId/:id",
  authenticatedToken,
  commentController.findCommentsByPostId
);
app.put(
  "/updateComment/:id",
  authenticatedToken,
  commentController.updateComment
);
app.delete(
  "/deleteComment/:id",
  authenticatedToken,
  commentController.deleteComment
);

//Login
app.post("/login", loginController.loginUser);

//Route to get user profile
app.get("/profile", authenticatedToken, async (req, res) => {
  try {
    await pool.connect();
    const user = await pool
      .request()
      .input("Id", sql.Int, req.user.id)
      .query("SELECT * FROM users WHERE user_id = @Id");

    if (!user.recordset || user.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: user.recordset[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    pool.close();
  }
});

app.get("/test", async (req, res) => {
  try {
    await db.connect();
    res.status(200).json({ message: "Database connection is Active" });
  } catch (error) {
    console.error("Error connection to the database:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    db.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
