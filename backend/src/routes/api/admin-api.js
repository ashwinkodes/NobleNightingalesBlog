import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { getDatabase } from '../../data/database.js';
import { authenticateUser, authenticateAdmin } from './auth-middleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'upload', 'avatars');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {recursive: true});
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext);
  }
})

const upload = multer({storage: storage});

// POST /api/register
router.post('/register', upload.single('avatar'), async (req, res) => {
  const { fname, lname, username, password, bday, detail, administrator,avatar } = req.body;
  const db = await getDatabase();

  try {
    // Check if username already exists
    const existingUser = await db.get('SELECT * FROM Users WHERE username = ?', username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user
    const result = await db.run(
      'INSERT INTO Users (fname, lname, username, pwd, bday, detail, administrator, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fname, lname, username, hashedPassword, bday, detail, administrator ? 1 : 0, avatar]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.lastID, avatar });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// 上传头像的路由
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // 返回头像的 URL
  const avatarUrl = `/upload/avatars/${req.file.filename}`;
  res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl:avatarUrl });
});


// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM Users WHERE username = ?', username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.pwd) {
      return res.status(500).json({ message: 'User password hash is missing' });
    }

    const isMatch = await bcrypt.compare(password, user.pwd);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

// GET /api/logout (alternative to support both POST and GET)
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

// GET /api/users
router.get('/users', authenticateAdmin, async (req, res) => {
  const db = await getDatabase();
  try {
    const users = await db.all(`
      SELECT Users.*, COUNT(BlogPosts.id) as articleCount 
      FROM Users 
      LEFT JOIN BlogPosts ON Users.id = BlogPosts.authorId 
      GROUP BY Users.id
    `);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// PUT /api/users/:id
router.put('/users/:id', authenticateUser, async (req, res) => {
  const { fname, lname, bday, detail, username, password } = req.body;
  const userId = req.params.id;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to edit this user' });
  }

  const db = await getDatabase();

  try {

    if (username && username !== req.user.username) {
      const existingUser = await db.get('SELECT * FROM Users WHERE username = ? AND id != ?', [username, userId]);
      if (existingUser) {
        return res.status(400).json({message: 'Username already taken'});
      }
    }

    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    await db.run(
      'UPDATE Users SET fname = ?, lname = ?, bday = ?, detail = ?, username = ?, pwd = COALESCE(?, pwd) WHERE id = ?',
      [fname, lname, bday, detail, username, hashedPassword, userId]
    );
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// POST /api/users/:id/avatar
router.post('/users/:id/avatar', authenticateUser, upload.single('avatar'), async (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this user\'s avatar' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
  // Match the path structure of preset users
  const avatarUrl = `/upload/avatars/${req.file.filename}`;
  const db = await getDatabase();

    await db.run('UPDATE Users SET avatarUrl = ? WHERE id = ?', [avatarUrl, userId]);
    res.json({ message: 'Avatar updated successfully', avatarUrl });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error updating avatar' });
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  const db = await getDatabase();
  const userId = req.params.id;

  await db.run('BEGIN TRANSACTION');

  try {
    // Delete user's comments
    await db.run('DELETE FROM Comments WHERE authorId = ?', userId);

    // Delete user's blog posts (this will cascade delete comments on these posts)
    await db.run('DELETE FROM BlogPosts WHERE authorId = ?', userId);

    // Delete the user
    await db.run('DELETE FROM Users WHERE id = ?', userId);

    await db.run('COMMIT');
    res.status(204).end();
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  const db = await getDatabase();
  const user = await db.get('SELECT * FROM Users WHERE username = ?', req.params.username);
  res.json({ available: !user });
});

// GET /api/user/profile
router.get('/user/profile', authenticateUser, async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get(
      `SELECT id, username, fname, lname, bday, detail, avatarUrl, administrator 
       FROM Users 
       WHERE id = ?`,
      req.user.id
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive information
    delete user.pwd;

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

export default router;