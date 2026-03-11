const staffCheck = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Staff access required' });
    }

    next();
  } catch (error) {
    console.error('Staff middleware error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { staffCheck };