const User = require('../models/User');
const { clerk } = require('../config/clerk');

const userController = {
  // Get current user profile
  async getProfile(req, res) {
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

  // Update user profile
  async updateProfile(req, res) {
    try {
      const updates = req.body;
      delete updates.role; // Prevent role change
      delete updates.clerkId; // Prevent clerkId change

      const user = await User.findByIdAndUpdate(
        req.userId,
        updates,
        { new: true, runValidators: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create staff member (admin only)
  async createStaff(req, res) {
    try {
      const { firstName, lastName, email, phone, role = 'staff' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create user in Clerk first (optional - you can also create without Clerk)
      let clerkId = null;
      try {
        // Generate a temporary password (you might want to send an invitation email instead)
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
        
        const clerkUser = await clerk.users.createUser({
          emailAddress: [email],
          password: tempPassword,
          firstName,
          lastName,
          skipPasswordChecks: true,
          skipPasswordRequirement: true
        });
        clerkId = clerkUser.id;
      } catch (clerkError) {
        console.error('Error creating user in Clerk:', clerkError);
        // Continue with MongoDB user creation even if Clerk fails
      }

      // Create user in MongoDB
      const newUser = await User.create({
        clerkId,
        email,
        firstName,
        lastName,
        phone,
        role,
        isActive: true
      });

      res.status(201).json({
        message: 'Staff created successfully',
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      });

    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all staff members (admin only) - NEW METHOD
  async getStaff(req, res) {
    try {
      
      // Find users with role 'staff' or 'admin'
      const staff = await User.find({ 
        role: { $in: ['staff', 'admin'] } 
      })
      .select('-__v')
      .sort({ createdAt: -1 });


      // You can add task counts here if you have a Task model
      const staffWithStats = await Promise.all(staff.map(async (member) => {
        // Placeholder for task counts - replace with actual counts when Task model is ready
        const taskCount = 0;
        const completedTasks = 0;
        
        return {
          ...member.toObject(),
          taskCount,
          completedTasks
        };
      }));

      res.json(staffWithStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const { role, page = 1, limit = 10 } = req.query;
      const query = {};

      if (role) query.role = role;

      const skip = (page - 1) * limit;

      const users = await User.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID (admin only)
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select('-__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user (admin only)
  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Optionally delete from Clerk as well
      if (user.clerkId) {
        try {
          await clerk.users.deleteUser(user.clerkId);
        } catch (clerkError) {
          console.error('Error deleting from Clerk:', clerkError);
        }
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;