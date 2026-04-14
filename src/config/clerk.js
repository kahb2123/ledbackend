const { createClerkClient } = require('@clerk/clerk-sdk-node');

// Your Clerk instance URL from the token
const CLERK_API_URL = 'https://adapted-swine-53.clerk.accounts.dev';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  apiUrl: CLERK_API_URL,
  jwtKey: process.env.CLERK_JWT_KEY
});

// Cache for verified tokens to avoid re-verification (TTL: 50 seconds - Clerk tokens expire at 60s)
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 50 * 1000;

// Clean expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tokenCache) {
    if (now - entry.timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(key);
    }
  }
}, 60 * 1000);

const verifyClerkToken = async (token) => {
  // Check token cache first - avoids any verification overhead for repeated requests
  const cached = tokenCache.get(token);
  if (cached && (Date.now() - cached.timestamp < TOKEN_CACHE_TTL)) {
    return cached.payload;
  }

  // Try fast local decode first (no network call) - works for development
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Basic validation: check token hasn't expired
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        const result = { sub: payload.sub, ...payload };
        tokenCache.set(token, { payload: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch {
    // Fall through to SDK verification
  }

  // Fallback to Clerk SDK verification (makes network call)
  try {
    const verifiedToken = await clerk.verifyToken(token, {
      authorizedParties: ['http://localhost:5173', 'http://localhost:3000'],
      issuer: CLERK_API_URL
    });
    tokenCache.set(token, { payload: verifiedToken, timestamp: Date.now() });
    return verifiedToken;
  } catch {
    return null;
  }
};

const getUserFromClerk = async (userId) => {
  try {
    const user = await clerk.users.getUser(userId);
    return user;
  } catch {
    return null;
  }
};

module.exports = {
  clerk,
  verifyClerkToken,
  getUserFromClerk
};
