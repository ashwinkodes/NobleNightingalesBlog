import jwt from 'jsonwebtoken';
import { getDatabase } from '../../data/database.js';

export const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM Users WHERE id = ?', decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM Users WHERE id = ?', decoded.userId);

    if (!user || !user.administrator) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const is_authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM Users WHERE id = ?', decoded.userId);

    if (user) {
      req.user = user;
    }

  } catch (error) {
  }
  next();
};