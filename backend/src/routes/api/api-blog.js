import express from "express";
import multer from 'multer';
import path from 'path';
import fs from "fs";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from 'url';
import { updateBlogPostImage, getmyposts, getPosts, addPost, updatePost, deletePost, likePost, searchPosts, addComment, updateComment, deleteComment, updatePostImage, addBlogPostImage, getBlogPostImages, deleteBlogPostImage, getPostById } from "../../data/blog-dao.js";
import { authenticateUser, is_authenticateUser } from "./auth-middleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for file uploads with the correct destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Navigate up one more level to get to the backend root directory
    const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'upload', 'blogposts');

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Upload directory:', uploadDir); // Debug log
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// POST /api/posts
router.post("/", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl } = req.body;
    const newPost = await addPost(title, content, excerpt, req.user.id);

    if (imageUrl) {
      // Add the image to the BlogPostImages table
      await addBlogPostImage(newPost.id, imageUrl);
    }
    // Fetch the updated post with the image
    const updatedPost = await getPostById(req.user.id, newPost.id);
    return res.status(201).location(`/api/posts/${newPost.id}`).json(updatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// GET /api/posts
router.get("/", is_authenticateUser, async (req, res) => {
  let user_id = null
  try {
    user_id = req.user.id
  } catch (e) {
  }
  try {
    const posts = await getPosts(user_id);
    return res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Error fetching posts' });
  }
});

// GET /api/posts/search
router.get("/search", is_authenticateUser, async (req, res) => {
  try {
    let userId = null
    try {
      userId = req.user.id;
    } catch (e) {
    }
    const { query, sortBy } = req.query;
    const posts = await searchPosts(query, sortBy, userId);
    return res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    return res.status(500).json({ message: 'Error searching posts' });
  }
});

router.get("/getmyposts", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getmyposts(userId)
    res.json(user);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});


// GET /api/posts/:id
router.get("/:id", is_authenticateUser, async (req, res) => {
  let user_id = null
  try {
    user_id = req.user.id
  } catch (e) {
  }
  console.log(user_id);

  try {
    const postId = req.params.id;
    const post = await getPostById(user_id, postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ message: 'Error fetching post' });
  }
});

// PUT /api/posts/:id
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl } = req.body;
    const postId = req.params.id;
    if (imageUrl) {
      await updateBlogPostImage(postId, imageUrl);
    }
    const updatedPost = await updatePost(postId, title, content, excerpt, req.user.id);
    // Add the image to the BlogPostImages table
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found or you\'re not authorized to edit it' });
    }
    return res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ message: 'Error updating post' });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await deletePost(postId, req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'Post not found or you\'re not authorized to delete it' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Error deleting post' });
  }
});

// POST /api/posts/:id/like
router.post("/:id/like", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await likePost(postId, req.user.id);
    if (result === 'liked') {
      return res.json({ message: 'Post liked successfully' });
    } else if (result === 'unliked') {
      return res.json({ message: 'Post unliked successfully' });
    } else {
      return res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return res.status(500).json({ message: 'Error liking/unliking post' });
  }
});


// POST /api/posts/:id/comments
router.post("/:id/comments", authenticateUser, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const postId = req.params.id;
    const newComment = await addComment(postId, req.user.id, content, parentCommentId);
    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Error adding comment' });
  }
});

// PUT /api/posts/comments/:id
router.put("/comments/:id", authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;
    const updatedComment = await updateComment(commentId, content, req.user.id);
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found or you\'re not authorized to edit it' });
    }
    return res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ message: 'Error updating comment' });
  }
});

// DELETE /api/posts/comments/:id
router.delete("/comments/:id", authenticateUser, async (req, res) => {
  try {
    const commentId = req.params.id;
    const result = await deleteComment(commentId, req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'Comment not found or you\'re not authorized to delete it' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Error deleting comment' });
  }
});

// POST /api/posts/:id/image
router.post("/:id/image", authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const postId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/blogposts/${req.file.filename}`;
    const imageId = await addBlogPostImage(postId, imageUrl);
    return res.json({ message: 'Image uploaded successfully', imageId, imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Error uploading image' });
  }
});

router.get("/:id/images", async (req, res) => {
  try {
    const postId = req.params.id;
    const images = await getBlogPostImages(postId);
    return res.json(images);
  } catch (error) {
    console.error('Error retrieving images:', error);
    return res.status(500).json({ message: 'Error retrieving images' });
  }
});

router.delete("/:postId/images/:imageId", authenticateUser, async (req, res) => {
  try {
    const { postId, imageId } = req.params;
    const success = await deleteBlogPostImage(imageId, postId);
    if (success) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: 'Image not found or not authorized to delete' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Error deleting image' });
  }
});

// 上传头像的路由
router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // 返回头像的 URL
  const imageUrl = `/upload/blogposts/${req.file.filename}`;
  res.status(200).json({ message: 'image uploaded successfully', imageUrl: imageUrl });
});



export default router;