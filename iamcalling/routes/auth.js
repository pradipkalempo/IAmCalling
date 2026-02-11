import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gkckyyyaoqsaouemjnxl.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: hashedPassword,
        profile_photo: profilePhoto
      }])
      .select()
      .single();
    
    if (error) throw error;

    // Generate token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        firstName: newUser.first_name, 
        lastName: newUser.last_name 
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
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        fullName: `${newUser.first_name} ${newUser.last_name}`,
        profilePhoto: newUser.profile_photo,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginField)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
    
    res.json({ message: 'Login successful', token, user });
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