import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'pizzanest_super_secret_jwt_key_level3_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '36500d',
    }
  );
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check duplicate
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Create user (always defaults to role: 'user')
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: 'user',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate customer or admin
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your account email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success anyway for security timing protection, but inform user
      return res.json({
        success: true,
        message: 'If an account matches that email, a password reset link has been sent.',
      });
    }

    // Generate random raw reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Invalidate existing tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    // Store in DB with 1 hour expiration
    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const originUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, originUrl);

    res.json({
      success: true,
      message: 'Password reset link sent to your email address',
      ...(emailResult.previewUrl && { previewUrl: emailResult.previewUrl }),
      // Also return token in dev mode for easy local verification
      ...(process.env.NODE_ENV === 'development' && { devResetToken: resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using received token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is invalid or has expired. Please request a new link.',
      });
    }

    const user = await User.findById(resetRecord.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with this reset request was not found',
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    res.json({
      success: true,
      message: 'Password has been successfully reset! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile & delivery address
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        zipCode: address.zipCode || user.address?.zipCode || '',
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};
