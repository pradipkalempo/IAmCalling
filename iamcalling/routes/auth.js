import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gkckyyyaoqsaouemjnxl.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple registration endpoint
router.post('/register', (req, res, next) => {
  console.log('🔍 Content-Type:', req.headers['content-type']);
  next();
}, upload.single('profilePhoto'), async (req, res) => {
  console.log('🔍 Request body keys:', req.body ? Object.keys(req.body) : 'BODY IS NULL');
  console.log('🔥 Registration request body:', req.body);
  console.log('📸 File received:', req.file ? 'YES' : 'NO');
  if (req.file) {
    console.log('📸 File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  }
  
  const { email, phone, password, firstName, lastName, registerMode } = req.body;
  const profilePhoto = req.file ? req.file.path : null;
  
  console.log('📸 Profile photo URL:', profilePhoto || 'NULL');
  
  if (!password || !firstName || !lastName) {
    return res.status(400).json({ 
      success: false,
      message: 'Name and password are required'
    });
  }
  
  if (!email && !phone) {
    return res.status(400).json({ 
      success: false,
      message: 'Email or phone number is required'
    });
  }
  
  try {
    // Check if user exists by email or phone
    let existingUser = null;
    
    if (email) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      existingUser = data;
    }
    
    if (!existingUser && phone) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single();
      existingUser = data;
    }
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: registerMode === 'phone' ? 'Phone number already registered. Please login instead.' : 'Email already registered. Please login instead.'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user with Cloudinary URL
    const insertData = {
      first_name: firstName,
      last_name: lastName,
      password: hashedPassword,
      profile_photo: profilePhoto
    };
    
    console.log('💾 Saving to Supabase:', {
      firstName,
      lastName,
      email: email || phone,
      profilePhoto: profilePhoto ? 'URL EXISTS' : 'NULL',
      profilePhotoLength: profilePhoto ? profilePhoto.length : 0
    });
    
    if (profilePhoto) {
      console.log('📸 Profile photo URL to save:', profilePhoto);
    } else {
      console.log('⚠️ WARNING: No profile photo to save!');
    }
    
    if (email) insertData.email = email;
    if (phone) insertData.phone = phone;
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }
    
    console.log('✅ User created in Supabase:', {
      id: newUser.id,
      email: newUser.email,
      profile_photo: newUser.profile_photo ? 'SAVED' : 'NULL'
    });

    // Generate token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        phone: newUser.phone,
        firstName: newUser.first_name, 
        lastName: newUser.last_name 
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '24h' }
    );

    console.log('✅ User registered:', email || phone);

    res.json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
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
  const { email, phone, password, username } = req.body;
  
  if ((!email && !username && !phone) || !password) {
    return res.status(400).json({ error: 'Email/phone/username and password are required' });
  }
  
  const loginField = email || username || phone;
  
  try {
    let user = null;
    
    // Try to find user by email first
    if (email || username) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginField)
        .single();
      user = data;
    }
    
    // If not found and phone provided, try phone
    if (!user && phone) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('phone', loginField)
        .single();
      user = data;
    }

    if (!user) {
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