import bcrypt from 'bcryptjs';
import supabase from '../../config/supabaseClient.js';
import { formatResponse, successResponse, errorResponse, validationErrorResponse } from '../utils/responseFormatter.js';
import { 
  generateToken, 
  validateEmail, 
  validatePassword, 
  validateUsername,
  createAuthResponse,
  sanitizeInput,
  validateRequiredFields
} from '../utils/auth_utils.js';

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    const fieldValidation = validateRequiredFields(req.body, ['username', 'email', 'password']);
    if (!fieldValidation.isValid) {
      return res.status(400).json(
        validationErrorResponse(fieldValidation.message, fieldValidation.errors)
      );
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json(
        validationErrorResponse('Invalid email format')
      );
    }

    // Validate username
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.isValid) {
      return res.status(400).json(
        validationErrorResponse(usernameValidation.message)
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json(
        validationErrorResponse(passwordValidation.message)
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${sanitizedEmail},username.eq.${usernameValidation.value}`)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return res.status(409).json(
        errorResponse('User already exists with this email or username')
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        username: usernameValidation.value,
        email: sanitizedEmail,
        password: hashedPassword
      }])
      .select('id, username, email, created_at, updated_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    // Generate token
    const token = generateToken(newUser.id);

    // Send response
    res.status(201).json(
      successResponse('User registered successfully', createAuthResponse(newUser, token))
    );

  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const fieldValidation = validateRequiredFields(req.body, ['email', 'password']);
    if (!fieldValidation.isValid) {
      return res.status(400).json(
        validationErrorResponse(fieldValidation.message, fieldValidation.errors)
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password, created_at, updated_at')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    if (!user) {
      return res.status(401).json(
        errorResponse('Invalid credentials')
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(
        errorResponse('Invalid credentials')
      );
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Send response
    res.status(200).json(
      successResponse('Login successful', createAuthResponse(userWithoutPassword, token))
    );

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    // User is attached to req by auth middleware
    res.status(200).json(
      successResponse('Profile retrieved successfully', { user: req.user })
    );
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    // Validate username if provided
    if (username !== undefined) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.isValid) {
        return res.status(400).json(
          validationErrorResponse(usernameValidation.message)
        );
      }

      // Check if username is already taken by another user
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', usernameValidation.value)
        .neq('id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        return res.status(409).json(
          errorResponse('Username already taken')
        );
      }

      // Update user profile
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          username: usernameValidation.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, username, email, created_at, updated_at')
        .single();

      if (updateError) {
        throw updateError;
      }

      res.status(200).json(
        successResponse('Profile updated successfully', { user: updatedUser })
      );
    } else {
      return res.status(400).json(
        validationErrorResponse('No fields provided to update')
      );
    }

  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    const fieldValidation = validateRequiredFields(req.body, ['currentPassword', 'newPassword']);
    if (!fieldValidation.isValid) {
      return res.status(400).json(
        validationErrorResponse(fieldValidation.message, fieldValidation.errors)
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json(
        validationErrorResponse(passwordValidation.message)
      );
    }

    // Get current user password
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json(
        errorResponse('User not found')
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json(
        errorResponse('Current password is incorrect')
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json(
      successResponse('Password changed successfully')
    );

  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
};