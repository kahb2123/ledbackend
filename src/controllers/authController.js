const User = require('../models/User');
const { clerk } = require('../config/clerk');

const authController = {
  // Webhook handler for Clerk user events
  async handleWebhook(req, res) {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'user.created':
          await User.create({
            clerkId: data.id,
            email: data.email_addresses[0].email_address,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            profileImage: data.image_url,
            role: 'customer'
          });
          break;

        case 'user.updated':
          await User.findOneAndUpdate(
            { clerkId: data.id },
            {
              email: data.email_addresses[0].email_address,
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              profileImage: data.image_url
            }
          );
          break;

        case 'user.deleted':
          await User.findOneAndDelete({ clerkId: data.id });
          break;
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.userId)
        .select('-__v');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user role (admin only)
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['customer', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;