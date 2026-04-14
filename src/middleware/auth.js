const { verifyClerkToken, getUserFromClerk } = require('../config/clerk');
const User = require('../models/User');

// In-memory cache for authenticated users (TTL: 5 minutes)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const clearUserCache = (clerkId) => {
  userCache.delete(clerkId);
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify Clerk token
    const decoded = await verifyClerkToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const clerkId = decoded.sub;
    
    // Check cache first to avoid DB hit on every request
    const cached = userCache.get(clerkId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      req.user = cached.user;
      req.userId = cached.user._id;
      req.clerkId = clerkId;
      
      // Update lastLogin in background (non-blocking), throttled to once per 5 min
      if (!cached.lastLoginUpdated || (Date.now() - cached.lastLoginUpdated > CACHE_TTL)) {
        User.updateOne({ _id: cached.user._id }, { lastLogin: new Date() }).catch(() => {});
        cached.lastLoginUpdated = Date.now();
      }
      
      return next();
    }
    
    // DB lookup - use lean() for faster read when we just need data
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Fetch user details from Clerk
      const clerkUser = await getUserFromClerk(clerkId);
      
      if (!clerkUser) {
        return res.status(401).json({ error: 'User not found in Clerk' });
      }

      const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
      
      // Check if this is your admin email
      const isAdminEmail = userEmail === 'kahb2123@gmail.com';
      const userRole = isAdminEmail ? 'admin' : 'customer';

      // Create new user in our database
      user = await User.create({
        clerkId: clerkId,
        email: userEmail,
        firstName: clerkUser.firstName || 'User',
        lastName: clerkUser.lastName || '',
        profileImage: clerkUser.imageUrl,
        role: userRole,
        isActive: true,
        lastLogin: new Date()
      });
    } else {
      // Update admin role if needed (one-time fix)
      if (user.email === 'kahb2123@gmail.com' && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    // Cache the user
    userCache.set(clerkId, {
      user,
      timestamp: Date.now(),
      lastLoginUpdated: Date.now()
    });
    
    // Update lastLogin in background (non-blocking)
    User.updateOne({ _id: user._id }, { lastLogin: new Date() }).catch(() => {});

    req.user = user;
    req.userId = user._id;
    req.clerkId = clerkId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

module.exports = { authenticate };
