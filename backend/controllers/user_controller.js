const userRepository = require("../repositories/user_repository");

//Create User
async function createUser(req, res) {
  try {
    const userData = req.body;
    const profilePicture = req.file;
    const result = await userRepository.saveUser(userData, profilePicture);

    if (result.success) {
      res.status(201).json({ message: result.message });
    } else if (result.message === "Username already exists") {
      res.status(400).json({ error: result.message });
    } else if (result.message === "Email already exists") {
      res.status(400).json({ error: result.message });
    } else if (result.message === "Username and Email already exist") {
      res.status(400).json({ error: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error creating User:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Update User
async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const profilePicture = req.file;

    const user = await userRepository.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await userRepository.updateUser(
      userId,
      userData,
      profilePicture
    );

    if (result.success) {
      const profilePicturePath = profilePicture
        ? `/images/profile-picture/${profilePicture.filename}?${Date.now()}`
        : user.profile_picture;
      res
        .status(200)
        .json({
          message: result.message,
          profilePicturePath: profilePicturePath,
        });
    } else if (result.message === "Username already exists") {
      res.status(400).json({ error: result.message });
    } else if (result.message === "Email already exists") {
      res.status(400).json({ error: result.message });
    } else if (result.message === "Username and Email already exist") {
      res.status(400).json({ error: result.message });
    } else {
      res.status(404).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error Updating User:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createUser,
  updateUser,
};
