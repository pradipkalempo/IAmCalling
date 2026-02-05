import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple registration endpoint
router.post('/register', async (req, res) => {
  console.log('🔥 Registration request:', req.body);
  
  const { email, password, firstName, lastName, profilePhoto } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields required'
    });
  }
  
  try {
    // Import simple database
    const { default: simpleDB } = await import('../../simple-db.js');
    
    // Create user in database
    const newUser = await simpleDB.createUser({
      email,
      password,
      firstName,
      lastName,
      profilePhoto
    });

    // Generate token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName 
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '24h' }
    );

    console.log('✅ User registered:', email);

    res.json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        profilePhoto: newUser.profilePhoto,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password, username } = req.body;
  
  if ((!email && !username) || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }
  
  const loginField = email || username;
  
  try {
    const { default: simpleDB } = await import('../../simple-db.js');
    const user = simpleDB.findUserByEmail(loginField);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
    
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working', 
    timestamp: new Date().toISOString()
  });
});

// User logout
router.post('/logout', (req, res) => {
  console.log("🚪 Logout request received");
  // For JWT-based auth, we simply send a success response
  // Client-side will handle token removal
  res.json({ message: 'Logout successful' });
});

export default router;