// Configure environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Set's our port to the PORT environment variable, or 3000 by default if the env is not configured.
const PORT = process.env.PORT ?? 3000;

// Creates the express server
const app = express();

// Configure middleware (logging, CORS support, JSON parsing support,
// static files support, cookie parser)
app.use(morgan("dev"));
app.use(cookieParser());

// Configure CORS
app.use(
  cors({
    origin: [
      `http://localhost:${PORT}`,
      process.env.FRONTEND_ORIGIN,
      'http://localhost:5173' // Development server
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Parse JSON bodies
app.use(express.json());

// Configure static file serving
app.use('/upload', express.static('public/upload'));
app.use(express.static("public"));

// Import and use our application routes
import routes from "./routes/routes.js";
app.use("/", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Make sure our database is up and running
import { getDatabase } from "./data/database.js";
await getDatabase();

// Start the server running
app.listen(PORT, () => {
  console.log(`PGCIT Final Project server listening on port ${PORT}`);
});