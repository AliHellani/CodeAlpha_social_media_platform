CREATE TABLE likes (
    like_id INT PRIMARY KEY IDENTITY(1,1),
    created_at DATETIME DEFAULT GETDATE(),
    post_id INT FOREIGN KEY REFERENCES posts(post_id),
    user_id INT FOREIGN KEY REFERENCES users(user_id)
);