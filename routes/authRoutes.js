import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendVerificationEmail from '../utils/sendEmail.js';

const router = express.Router();

// Helper for JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password,
      verificationCode: otp,
      isVerified: false
    });

    if (user) {
      try {
        await sendVerificationEmail(email, otp);
        console.log(`✅ Verification email sent to ${email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${email}:`, emailError.message);
      }

      res.status(201).json({
        _id: user._id,
        email: user.email,
        message: 'Registration successful. Check your email for the verification code.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode === otp) {
      user.isVerified = true;
      user.verificationCode = null; // clear OTP once used
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        // Option to trigger new code here:
        // const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // user.verificationCode = otp; await user.save();
        return res.status(401).json({ message: 'Email not verified', requiresVerification: true });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;
