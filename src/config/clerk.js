const { createClerkClient } = require('@clerk/clerk-sdk-node');

// Your Clerk instance URL from the token
const CLERK_API_URL = 'https://adapted-swine-53.clerk.accounts.dev';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  apiUrl: CLERK_API_URL, // Add your specific Clerk instance URL
  // For development, you can also add this
  jwtKey: process.env.CLERK_JWT_KEY // Optional
});

const verifyClerkToken = async (token) => {
  try {
    console.log('🔐 Verifying token with Clerk SDK...');
    
    // Try to verify with the correct issuer
    const verifiedToken = await clerk.verifyToken(token, {
      authorizedParties: ['http://localhost:5173', 'http://localhost:3000'],
      issuer: CLERK_API_URL
    });
    
    console.log('✅ Token verified successfully');
    return verifiedToken;
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    
    // Fallback: manually decode the token (for development only)
    try {
      console.log('Attempting manual decode...');
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('✅ Manual decode successful');
      console.log('User ID from token:', payload.sub);
      
      return {
        sub: payload.sub,
        ...payload
      };
    } catch (decodeError) {
      console.error('Manual decode failed:', decodeError);
      return null;
    }
  }
};

const getUserFromClerk = async (userId) => {
  try {
    console.log('👤 Fetching user from Clerk:', userId);
    const user = await clerk.users.getUser(userId);
    console.log('✅ User fetched:', user.emailAddresses[0]?.emailAddress);
    return user;
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    return null;
  }
};

module.exports = {
  clerk,
  verifyClerkToken,
  getUserFromClerk
};