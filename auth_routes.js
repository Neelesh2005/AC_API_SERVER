import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/authController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public auth routes
router.post("/register", register);
router.post("/login", login);

// Protected auth routes (require authentication)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;