CREATE TABLE posts (
    post_id INT PRIMARY KEY IDENTITY(1,1),
    content TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    user_id INT FOREIGN KEY REFERENCES users(user_id)
);