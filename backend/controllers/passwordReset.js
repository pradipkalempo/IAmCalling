import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Request password reset
router.post('/request-reset', async (req, res) => {
    console.log('🔔 Password reset request received:', req.body);
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists in database
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, first_name')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.log('❌ User not found for email:', email, 'Error:', error);
            return res.status(400).json({ 
                success: false, 
                message: 'No account found with this email address' 
            });
        }
        
        console.log('✅ User found:', user.email);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to database
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                reset_token: resetToken,
                reset_token_expiry: resetExpiry.toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to generate reset token' 
            });
        }

        // Send email
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
        
        const mailOptions = {
            from: `"IAMCALLING" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - IAMCALLING',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a3d0a;">Password Reset Request</h2>
                    <p>Hi ${user.first_name || 'there'},</p>
                    <p>We received a request to reset your password for your IAMCALLING account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background: linear-gradient(135deg, #2d5a2d, #d4af37); 
                                  color: white; 
                                  padding: 12px 30px; 
                                  text-decoration: none; 
                                  border-radius: 5px;
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${resetLink}</p>
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">
                        This link will expire in 1 hour.<br>
                        If you didn't request this, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">
                        © 2025 IAMCALLING. All rights reserved.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Password reset link sent to your email' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send reset email. Please try again.' 
        });
    }
});

// Verify reset token
router.get('/verify-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        console.log('🔍 Verifying token:', token);

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, reset_token_expiry')
            .eq('reset_token', token)
            .single();

        if (error || !user) {
            console.log('❌ Token not found or error:', error);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }

        // Check if token expired
        const expiryDate = new Date(user.reset_token_expiry);
        const now = new Date();
        
        console.log('Token expiry:', expiryDate);
        console.log('Current time:', now);
        
        if (expiryDate < now) {
            console.log('❌ Token expired');
            return res.status(400).json({ 
                success: false, 
                message: 'Reset token has expired' 
            });
        }

        console.log('✅ Token valid');
        res.json({ success: true, email: user.email });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify token' 
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        console.log('🔐 Password reset attempt with token:', token);

        if (!token || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token and new password are required' 
            });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Verify token
        const { data: user, error } = await supabase
            .from('users')
            .select('id, reset_token_expiry')
            .eq('reset_token', token)
            .single();

        if (error || !user) {
            console.log('❌ Invalid token');
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }

        // Check if token expired
        if (new Date(user.reset_token_expiry) < new Date()) {
            console.log('❌ Token expired');
            return res.status(400).json({ 
                success: false, 
                message: 'Reset token has expired' 
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('✅ Password hashed');

        // Update password and clear token
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                password: hashedPassword,
                reset_token: null,
                reset_token_expiry: null
            })
            .eq('id', user.id);

        if (updateError) {
            console.log('❌ Update failed:', updateError);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to reset password' 
            });
        }

        console.log('✅ Password reset successfully');
        res.json({ 
            success: true, 
            message: 'Password reset successfully' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reset password' 
        });
    }
});

export default router;
