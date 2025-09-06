import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";
import { generateToken, validateEmail, validatePassword } from "../utils/authUtils.js";

// Register new user
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json(
        formatResponse("bad_request", "Username, email, and password are required")
      );
    }

    if (!validateEmail(email)) {
      return res.status(400).json(
        formatResponse("bad_request", "Invalid email format")
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json(
        formatResponse("bad_request", passwordValidation.message)
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(409).json(
        formatResponse("conflict", "User with this email or username already exists")
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
        }
      ])
      .select("id, username, email, created_at")
      .single();

    if (error) {
      console.error("Registration error:", error);
      return res.status(500).json(
        formatResponse("error", "Failed to create user")
      );
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    res.status(201).json(
      formatResponse("success", "User registered successfully", {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          created_at: newUser.created_at
        },
        token
      })
    );
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json(
        formatResponse("bad_request", "Email and password are required")
      );
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, password, created_at")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json(
        formatResponse("unauthorized", "Invalid email or password")
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatResponse("unauthorized", "Invalid email or password")
      );
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json(
      formatResponse("success", "Login successful", {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        token
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    // User is already available from auth middleware
    res.status(200).json(
      formatResponse("success", "Profile retrieved successfully", {
        user: req.user
      })
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json(
        formatResponse("bad_request", "Username is required")
      );
    }

    // Check if username is already taken by another user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", userId)
      .single();

    if (existingUser) {
      return res.status(409).json(
        formatResponse("conflict", "Username already taken")
      );
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ username })
      .eq("id", userId)
      .select("id, username, email, created_at")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return res.status(500).json(
        formatResponse("error", "Failed to update profile")
      );
    }

    res.status(200).json(
      formatResponse("success", "Profile updated successfully", {
        user: updatedUser
      })
    );
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        formatResponse("bad_request", "Current password and new password are required")
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json(
        formatResponse("bad_request", passwordValidation.message)
      );
    }

    // Get current user with password
    const { data: user, error } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json(
        formatResponse("not_found", "User not found")
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json(
        formatResponse("unauthorized", "Current password is incorrect")
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedNewPassword })
      .eq("id", userId);

    if (updateError) {
      console.error("Password change error:", updateError);
      return res.status(500).json(
        formatResponse("error", "Failed to change password")
      );
    }

    res.status(200).json(
      formatResponse("success", "Password changed successfully")
    );
  } catch (error) {
    next(error);
  }
};