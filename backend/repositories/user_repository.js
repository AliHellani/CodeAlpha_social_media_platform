const sql = require("mssql");
const bcrypt = require("bcrypt");
const validator = require("validator");
const pool = require("../configuration/db");
const fs = require("fs");
const path = require("path");

//Create User
async function saveUser(userData, profilePicture) {
  try {
    await pool.connect();

    //Validate Email
    if (!validator.isEmail(userData.email)) {
      return { success: false, message: "Invalid email format" };
    }

    //Check Username and Email if Exists
    const checkQuery = `
        SELECT * FROM users WHERE username = @username OR email = @email        
        `;

    const resultCheck = await pool
      .request()
      .input("username", sql.VarChar, userData.username)
      .input("email", sql.VarChar, userData.email)
      .query(checkQuery);

    if (resultCheck.recordset.length > 0) {
      const existingUser = resultCheck.recordset[0];
      if (
        existingUser.username === userData.username &&
        existingUser.email === userData.email
      ) {
        return { success: false, message: "Username and Email already exist" };
      } else if (existingUser.username === userData.username) {
        return { success: false, message: "Username already exists" };
      } else if (existingUser.email === userData.email) {
        return { success: false, message: "Email already exists" };
      }
    }

    //Hashed Password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    //save profilePicture
    let profilePicturePath = null;

    if (profilePicture && profilePicture.originalname && profilePicture.path) {
      const picturePath = path.join(
        __dirname,
        "../../frontend/images/profile-picture/",
        profilePicture.originalname
      );
      fs.writeFileSync(picturePath, fs.readFileSync(profilePicture.path));
      profilePicturePath = profilePicture.originalname;
    }

    const query = `
        INSERT INTO users (username, email, password, profile_picture, bio, created_at, updated_at)
        VALUES(@username, @email, @password, @profile_picture, @bio, GETDATE(), GETDATE())
        `;
    const result = await pool
      .request()
      .input("username", sql.VarChar, userData.username)
      .input("email", sql.VarChar, userData.email)
      .input("password", sql.VarChar, hashedPassword)
      .input("profile_picture", sql.VarChar, profilePicturePath)
      .input("bio", sql.VarChar, userData.bio)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "User created successfully" };
    } else {
      return { success: false, message: "Failed to create user" };
    }
  } catch (error) {
    console.error("Error creating User:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

//Find User By ID
async function findUserById(id) {
  try {
    await pool.connect();

    const query = ` SELECT * FROM users WHERE user_id = @id`;

    const result = await pool.request().input("id", sql.Int, id).query(query);

    if (result.recordset.length > 0) {
      return result.recordset[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    throw new Error("Internal Server Error");
  } finally {
    pool.close();
  }
}

//Update User
async function updateUser(id, userData, profilePicture) {
  try {
    await pool.connect();

    // Check if the new username or email already exists for another user
    const checkQuery = `
            SELECT * FROM users WHERE (username = @username OR email = @email) AND user_id != @id
        `;

    const resultCheck = await pool
      .request()
      .input("username", sql.VarChar, userData.username)
      .input("email", sql.VarChar, userData.email)
      .input("id", sql.Int, id)
      .query(checkQuery);

    if (resultCheck.recordset.length > 0) {
      const existingUser = resultCheck.recordset[0];
      if (
        existingUser.username === userData.username &&
        existingUser.email === userData.email
      ) {
        return { success: false, message: "Username and Email already exist" };
      } else if (existingUser.username === userData.username) {
        return { success: false, message: "Username already exists" };
      } else if (existingUser.email === userData.email) {
        return { success: false, message: "Email already exists" };
      }
    }

    // Construct the update query dynamically based on provided fields
    const fieldsToUpdate = [];
    if (userData.username) fieldsToUpdate.push("username = @username");
    if (userData.email) fieldsToUpdate.push("email = @email");
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      fieldsToUpdate.push("password = @password");
      userData.password = hashedPassword;
    }
    if (profilePicture) {
      const picturePath = path.join(
        __dirname,
        "../../frontend/images/profile-picture/",
        profilePicture.originalname
      );
      fs.writeFileSync(picturePath, fs.readFileSync(profilePicture.path));
      userData.profile_picture = profilePicture.originalname;
      fieldsToUpdate.push("profile_picture = @profile_picture");
    }
    if (userData.bio) fieldsToUpdate.push("bio = @bio");

    if (fieldsToUpdate.length === 0) {
      return { success: false, message: "No fields to update" };
    }

    const query = `
            UPDATE users SET ${fieldsToUpdate.join(
              ", "
            )}, updated_at = GETDATE()
            WHERE user_id = @id
        `;

    const request = pool.request().input("id", sql.Int, id);
    if (userData.username)
      request.input("username", sql.VarChar, userData.username);
    if (userData.email) request.input("email", sql.VarChar, userData.email);
    if (userData.password)
      request.input("password", sql.VarChar, userData.password);
    if (userData.profile_picture)
      request.input("profile_picture", sql.VarChar, userData.profile_picture);
    if (userData.bio) request.input("bio", sql.VarChar, userData.bio);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "User updated successfully" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    console.error("Error updating user:", error.message);
    return { success: false, message: "Internal Server Error" };
  } finally {
    pool.close();
  }
}

module.exports = {
  saveUser,
  findUserById,
  updateUser,
};
