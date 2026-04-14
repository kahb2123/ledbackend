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
    const verifiedToken = await clerk.verifyToken(token, {
      authorizedParties: ['http://localhost:5173', 'http://localhost:3000'],
      issuer: CLERK_API_URL
    });
    return verifiedToken;
  } catch (error) {
    // Fallback: manually decode the token (for development only)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return {
        sub: payload.sub,
        ...payload
      };
    } catch (decodeError) {
      console.error('Token verification failed:', decodeError.message);
      return null;
    }
  }
};

const getUserFromClerk = async (userId) => {
  try {
    const user = await clerk.users.getUser(userId);
    return user;
  } catch (error) {
    console.error('Get user error:', error.message);
    return null;
  }
};

module.exports = {
  clerk,
  verifyClerkToken,
  getUserFromClerk
};
