import { getDatabase } from "./database.js";

export async function addBlogPostImage(blogPostId, imageUrl) {
  const db = await getDatabase();
  const result = await db.run(
    "INSERT INTO BlogPostImages (blogPostId, imageUrl) VALUES (?, ?)",
    [blogPostId, imageUrl]
  );
  return result.lastID;
}

export async function updateBlogPostImage(blogPostId, imageUrl) {
  const db = await getDatabase();
  
  // 先尝试更新
  const updateResult = await db.run(
    `UPDATE BlogPostImages SET imageUrl = ? WHERE blogPostId = ?`,
    [imageUrl, blogPostId]
  );
  
  // 如果没有更新到任何行，则插入
  if (updateResult.changes === 0) {
    await db.run(
      `INSERT INTO BlogPostImages (blogPostId, imageUrl) VALUES (?, ?)`,
      [blogPostId, imageUrl]
    );
  }
}


export async function getBlogPostImages(blogPostId) {
  const db = await getDatabase();
  return await db.all(
    "SELECT * FROM BlogPostImages WHERE blogPostId = ?",
    [blogPostId]
  );
}

export async function deleteBlogPostImage(imageId, blogPostId) {
  const db = await getDatabase();
  const result = await db.run(
    "DELETE FROM BlogPostImages WHERE id = ? AND blogPostId = ?",
    [imageId, blogPostId]
  );
  return result.changes > 0;
}

export async function getPosts(userId) {
  const db = await getDatabase();
  console.log(userId);
  
  let posts;
if (userId!=null) {
  posts = await db.all(`
    SELECT 
      BlogPosts.*, 
      Users.fname, 
      Users.lname, 
      Users.username,
      (SELECT COUNT(*) FROM Likes WHERE Likes.blogPostId = BlogPosts.id) AS likeCount,
      CASE 
        WHEN Likes.userId IS NOT NULL THEN 1 
        ELSE 0 
      END AS isLiked
    FROM BlogPosts 
    JOIN Users ON BlogPosts.authorId = Users.id 
    LEFT JOIN Likes ON Likes.blogPostId = BlogPosts.id AND Likes.userId = ?
    ORDER BY BlogPosts.createdAt DESC
  `, [userId]);
} else {
  posts = await db.all(`
    SELECT 
      BlogPosts.*, 
      Users.fname, 
      Users.lname, 
      Users.username,
      (SELECT COUNT(*) FROM Likes WHERE Likes.blogPostId = BlogPosts.id) AS likeCount
    FROM BlogPosts 
    JOIN Users ON BlogPosts.authorId = Users.id 
    ORDER BY BlogPosts.createdAt DESC
  `);
}

  
  for (let post of posts) {
    post.comments = await getCommentsForPost(post.id);
    post.images = await getBlogPostImages(post.id);
    post.author = {
      id: post.authorId,
      fname: post.fname,
      lname: post.lname,
      username: post.username
    };
    // Remove redundant properties
    delete post.fname;
    delete post.lname;
    delete post.username;
  }
  
  return posts;
}

export async function getPostById(userId,postId) {
  const db = await getDatabase();
  let post;
  if (userId!=null) {
    post = await db.get(`
      SELECT 
        BlogPosts.*, 
        Users.fname, 
        Users.lname, 
        Users.username,
        (SELECT COUNT(*) FROM Likes WHERE Likes.blogPostId = BlogPosts.id) AS likeCount,
        CASE 
          WHEN Likes.userId IS NOT NULL THEN 1 
          ELSE 0 
        END AS isLiked
      FROM BlogPosts 
      JOIN Users ON BlogPosts.authorId = Users.id 
      LEFT JOIN Likes ON Likes.blogPostId = BlogPosts.id AND Likes.userId = ?
      WHERE BlogPosts.id = ?
    `, [userId, postId]);
  } else {
    post = await db.get(`
      SELECT 
        BlogPosts.*, 
        Users.fname, 
        Users.lname, 
        Users.username,
        (SELECT COUNT(*) FROM Likes WHERE Likes.blogPostId = BlogPosts.id) AS likeCount
      FROM BlogPosts 
      JOIN Users ON BlogPosts.authorId = Users.id 
      WHERE BlogPosts.id = ?
    `, [postId]);
  }
  

  
  if (post) {
    post.comments = await getCommentsForPost(post.id);
    post.images = await getBlogPostImages(post.id);
    post.author = {
      id: post.authorId,
      fname: post.fname,
      lname: post.lname,
      username: post.username
    };
    // Remove redundant properties
    delete post.fname;
    delete post.lname;
    delete post.username;
  }
  
  return post;
}

async function getCommentsForPost(postId, parentId = null) {
  const db = await getDatabase();

  const comments = await db.all(
    `SELECT 
        Comments.*, 
        Users.username, 
        Users.avatarUrl
     FROM Comments 
     JOIN Users ON Comments.authorId = Users.id 
     WHERE Comments.blogPostId = ? AND Comments.parentCommentId IS ? 
     ORDER BY Comments.createdAt ASC`,
    postId, 
    parentId
  );
  
  for (let comment of comments) {
    comment.replies = await getCommentsForPost(postId, comment.id);
  }
  
  return comments;
}

export async function addPost(title, content, excerpt, authorId) {
  const db = await getDatabase();
  const createdAt = new Date().toISOString();
  const response = await db.run(
    "INSERT INTO BlogPosts (title, content, excerpt, authorId, createdAt) VALUES (?, ?, ?, ?, ?)",
    title, content, excerpt, authorId, createdAt
  );
  return {
    id: response.lastID,
    title,
    content,
    excerpt,
    authorId,
    createdAt
  };
}

export async function updatePost(postId, title, content, excerpt, userId) {
  const db = await getDatabase();
  const result = await db.run(
    "UPDATE BlogPosts SET title = ?, content = ?, excerpt = ?  WHERE id = ? AND authorId = ?",
    title, content, excerpt, postId, userId
  );
  if (result.changes > 0) {
    const images = await getBlogPostImages(postId);
    return { id: postId, title, content, excerpt,images:images, };
  }
  return null;
}

export async function deletePost(postId, userId) {
  const db = await getDatabase();
  const result = await db.run(
    "DELETE FROM BlogPosts WHERE id = ? AND authorId = ?",
    postId, userId
  );
  return result.changes > 0;
}

export async function likePost(postId, userId) {
  const db = await getDatabase();
  const existingLike = await db.get(
    "SELECT * FROM Likes WHERE blogPostId = ? AND userId = ?",
    postId, userId
  );
  if (existingLike) {
    await db.run(
      "DELETE FROM Likes WHERE blogPostId = ? AND userId = ?",
      postId, userId
    );
    return 'unliked';
  } else {
    await db.run(
      "INSERT INTO Likes (blogPostId, userId) VALUES (?, ?)",
      postId, userId
    );
    return 'liked';
  }
}

export async function searchPosts(query, sortBy,userId) {
  const db = await getDatabase();
  let sql;
  let params=null
  console.log(userId);
  
  if (userId!=null) {
    // 当有 userId 时，检查用户是否喜欢该帖子
    sql = `
      SELECT 
        BlogPosts.*, 
        Users.fname, 
        Users.lname, 
        Users.username,
        (SELECT COUNT(*) FROM Likes WHERE Likes.blogPostId = BlogPosts.id) AS likeCount,
        CASE 
          WHEN Likes.userId IS NOT NULL THEN 1 
          ELSE 0 
        END AS isLiked
      FROM BlogPosts 
      JOIN Users ON BlogPosts.authorId = Users.id 
      LEFT JOIN Likes ON Likes.blogPostId = BlogPosts.id AND Likes.userId = ?
      WHERE BlogPosts.title LIKE ? OR BlogPosts.content LIKE ?
    `;
    params = [userId, `%${query}%`, `%${query}%`];
  } else {
    // 当没有 userId 时，不加入 isLiked 字段
    sql = `
      SELECT 
        BlogPosts.*, 
        Users.fname, 
        Users.lname, 
        Users.username,
        (SELECT COUNT(*) FROM Likes WHERE Likes.blogPostId = BlogPosts.id) AS likeCount,
        0 AS isLiked
      FROM BlogPosts 
      JOIN Users ON BlogPosts.authorId = Users.id 
      WHERE BlogPosts.title LIKE ? OR BlogPosts.content LIKE ?
    `;
    params = [`%${query}%`, `%${query}%`];
  }

  // 添加排序条件
  if (sortBy === 'date') {
    sql += " ORDER BY BlogPosts.createdAt DESC";
  } else if (sortBy === 'title') {
    sql += " ORDER BY BlogPosts.title ASC";
  } else if (sortBy === 'author') {
    sql += " ORDER BY Users.username ASC";
  } else if (sortBy === 'likes') {
    sql += " ORDER BY likeCount DESC";
  }

  const posts = await db.all(sql, ...params);
  
  for (let post of posts) {
    post.comments = await getCommentsForPost(post.id);
    post.images = await getBlogPostImages(post.id);
    post.author = {
      id: post.authorId,
      fname: post.fname,
      lname: post.lname,
      username: post.username
    };
    // Remove redundant properties
    delete post.fname;
    delete post.lname;
    delete post.username;
  }
  return posts;
}

export async function addComment(postId, authorId, content, parentCommentId) {
  console.log(postId, authorId, content, parentCommentId);
  
  const db = await getDatabase();
  const createdAt = new Date().toISOString();
  const response = await db.run(
    "INSERT INTO Comments (blogPostId, authorId, content, parentCommentId, createdAt) VALUES (?, ?, ?, ?, ?)",
    postId, authorId, content, parentCommentId, createdAt
  );
  return {
    id: response.lastID,
    blogPostId: postId,
    authorId,
    content,
    parentCommentId,
    createdAt
  };
}

export async function updateComment(commentId, content, userId) {
  const db = await getDatabase();
  const result = await db.run(
    "UPDATE Comments SET content = ? WHERE id = ? AND authorId = ?",
    content, commentId, userId
  );
  if (result.changes > 0) {
    return { id: commentId, content };
  }
  return null;
}

export async function deleteComment(commentId, userId) {
  const db = await getDatabase();
  
  const result = await db.run(
    "DELETE FROM Comments WHERE id = ?",
    commentId
  );
  return result.changes > 0;
}

export async function updatePostImage(postId, imageUrl, userId) {
  const db = await getDatabase();
  const result = await db.run(
    "UPDATE BlogPosts SET imageUrl = ? WHERE id = ? AND authorId = ?",
    imageUrl, postId, userId
  );
  if (result.changes > 0) {
    return { id: postId, imageUrl };
  }
  return null;
}

export async function getmyposts(userId) {
  const db = await getDatabase();
    try {
      const posts = await db.all(`
        SELECT bp.*, 
               COUNT(l.id) AS likeCount,
               EXISTS(SELECT 1 FROM Likes l2 WHERE l2.blogPostId = bp.id AND l2.userId = ?) AS isLiked,
               u.username,u.fname,u.lname
        FROM BlogPosts bp
        LEFT JOIN Likes l ON bp.id = l.blogPostId
        LEFT JOIN Users u ON bp.authorId = u.id
        WHERE bp.authorId = ?
        GROUP BY bp.id;
    `, [userId, userId]);
    console.log(posts)

      for (let post of posts) {
  
        
        post.comments = await getCommentsForPost(post.id);
        post.images = await getBlogPostImages(post.id);
        post.author = {
          id: post.authorId,
          fname: post.fname,
          lname: post.lname,
          username: post.username
        };
        // Remove redundant properties
        delete post.fname;
        delete post.lname;
        delete post.username;
      }
      
      return posts
    } catch (error) {
      return null
    }
}
