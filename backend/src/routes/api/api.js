import express from "express";

const router = express.Router();

// import child routes
import blogRoutes from "./api-blog.js";
import adminRoutes from "./admin-api.js";

router.use("/posts", blogRoutes);
router.use("/", adminRoutes);

export default router;