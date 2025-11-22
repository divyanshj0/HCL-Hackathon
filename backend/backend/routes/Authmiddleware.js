const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  // FIX: Use the same fallback key ('fallback_secret_key') as used for signing in authRoutes.js
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key'; 

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret); 
      req.user = decoded;
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message); 
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to restrict access to Providers only
const providerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'provider') {
    next();
  } else {
    res.status(403).json({ message: 'Access restricted to healthcare providers' });
  }
};

module.exports = { protect, providerOnly };