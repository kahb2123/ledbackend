const { verifyClerkToken, getUserFromClerk } = require('../config/clerk');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('\n🔐 AUTH MIDDLEWARE - Request received');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('✅ Token extracted, length:', token.length);
    
    // Verify Clerk token with better error handling
    console.log('Verifying token...');
    const decoded = await verifyClerkToken(token);
    
    if (!decoded) {
      console.log('❌ Token verification failed');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('✅ Token verified successfully');
    console.log('Decoded token - sub:', decoded.sub);
    console.log('Decoded token - email:', decoded.email);
    
    const clerkId = decoded.sub;
    
    // Get or create user in our database
    console.log('Looking up user in database with clerkId:', clerkId);
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      console.log('👤 User not found in database, creating new user...');
      
      // Fetch user details from Clerk
      console.log('Fetching user details from Clerk...');
      const clerkUser = await getUserFromClerk(clerkId);
      
      if (!clerkUser) {
        console.log('❌ Could not fetch user from Clerk');
        return res.status(401).json({ error: 'User not found in Clerk' });
      }

      const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
      console.log('Clerk user email:', userEmail);
      
      // Check if this is your admin email
      const isAdminEmail = userEmail === 'kahb2123@gmail.com';
      const userRole = isAdminEmail ? 'admin' : 'customer';
      
      console.log(`Setting user role to: ${userRole} (Admin: ${isAdminEmail})`);

      // Create new user in our database
      user = await User.create({
        clerkId: clerkId,
        email: userEmail,
        firstName: clerkUser.firstName || 'User',
        lastName: clerkUser.lastName || '',
        profileImage: clerkUser.imageUrl,
        role: userRole,
        isActive: true
      });
      
      console.log('✅ New user created in database with ID:', user._id);
      console.log('User role set to:', user.role);
    } else {
      console.log('✅ User found in database with role:', user.role);
      
      // Double-check if this is your admin email and update role if needed
      if (user.email === 'kahb2123@gmail.com' && user.role !== 'admin') {
        console.log('⚠️ Updating user role to admin...');
        user.role = 'admin';
        await user.save();
        console.log('✅ User role updated to admin');
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    req.userId = user._id;
    req.clerkId = clerkId;
    
    console.log('🎉 Authentication successful for:', user.email);
    console.log('Final user role:', user.role);
    console.log('--- End of auth middleware ---\n');
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

module.exports = { authenticate };