const Media = require('../models/Media');

const mediaController = {
  // Get all media
  async getAllMedia(req, res) {
    try {
      const { category, type, page = 1, limit = 20 } = req.query;
      const query = {};

      if (category) query.category = category;
      if (type) query.type = type;
      if (req.query.isPublic) query.isPublic = req.query.isPublic === 'true';

      const skip = (page - 1) * limit;

      const media = await Media.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'firstName lastName');

      const total = await Media.countDocuments(query);

      res.json({
        media,
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

  // Get media by ID
  async getMediaById(req, res) {
    try {
      const media = await Media.findById(req.params.id)
        .populate('uploadedBy', 'firstName lastName');

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.json(media);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get media by category
  async getMediaByCategory(req, res) {
    try {
      const { category } = req.params;
      const media = await Media.find({ category })
        .sort({ order: 1, createdAt: -1 })
        .populate('uploadedBy', 'firstName lastName');

      res.json(media);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Upload image
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Parse title and description
      let title = { en: 'Image', am: 'ምስል' };
      let description = { en: '', am: '' };

      if (req.body.title) {
        try {
          title = typeof req.body.title === 'string' ? JSON.parse(req.body.title) : req.body.title;
        } catch {
          title = { en: req.body.title, am: req.body.title };
        }
      }

      if (req.body.description) {
        try {
          description = typeof req.body.description === 'string' ? JSON.parse(req.body.description) : req.body.description;
        } catch {
          description = { en: req.body.description, am: req.body.description };
        }
      }

      const media = new Media({
        title,
        description,
        type: 'image',
        category: req.body.category || 'gallery',
        url: req.file.path,
        publicId: req.file.filename,
        format: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.userId,
        isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
        order: await Media.countDocuments({ category: req.body.category || 'gallery' }) + 1
      });

      await media.save();
      res.status(201).json(media);
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Upload multiple images
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      const category = req.body.category || 'gallery';
      const baseOrder = await Media.countDocuments({ category });

      const mediaFiles = req.files.map((file, index) => ({
        title: { en: 'Image', am: 'ምስል' },
        description: { en: '', am: '' },
        type: 'image',
        category,
        url: file.path,
        publicId: file.filename,
        format: file.mimetype,
        size: file.size,
        uploadedBy: req.userId,
        isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
        order: baseOrder + index + 1
      }));

      const media = await Media.insertMany(mediaFiles);
      res.status(201).json(media);
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Upload video
  async uploadVideo(req, res) {
    try {

      if (!req.file) {
        return res.status(400).json({ error: 'No video uploaded' });
      }

      // Parse title - handle both string and object formats
      let title = { en: 'Video', am: 'ቪዲዮ' };
      
      if (req.body.title) {
        try {
          // Try to parse as JSON
          title = typeof req.body.title === 'string' ? JSON.parse(req.body.title) : req.body.title;
        } catch {
          // If not JSON, check for nested fields
          if (req.body['title[en]'] || req.body['title[am]']) {
            title = {
              en: req.body['title[en]'] || 'Video',
              am: req.body['title[am]'] || 'ቪዲዮ'
            };
          } else {
            // Use as string for both languages
            title = { en: req.body.title, am: req.body.title };
          }
        }
      }

      // Parse description
      let description = { en: '', am: '' };
      
      if (req.body.description) {
        try {
          description = typeof req.body.description === 'string' ? JSON.parse(req.body.description) : req.body.description;
        } catch {
          if (req.body['description[en]'] || req.body['description[am]']) {
            description = {
              en: req.body['description[en]'] || '',
              am: req.body['description[am]'] || ''
            };
          } else {
            description = { en: req.body.description, am: req.body.description };
          }
        }
      }

      // Ensure title has both languages
      if (!title.en) title.en = 'Video';
      if (!title.am) title.am = 'ቪዲዮ';

      const category = req.body.category || 'gallery';
      const order = await Media.countDocuments({ category }) + 1;

      const media = new Media({
        title,
        description,
        type: 'video',
        category,
        url: req.file.path,
        publicId: req.file.filename,
        format: req.file.mimetype,
        size: req.file.size,
        duration: req.file.duration || 0,
        uploadedBy: req.userId,
        isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
        order
      });

      await media.save();
      
      res.status(201).json(media);
    } catch (error) {
      // Video upload error handled below
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: messages 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  // Update media
  async updateMedia(req, res) {
    try {
      const updates = { ...req.body };
      
      // Handle nested objects
      if (req.body.title && typeof req.body.title === 'string') {
        try {
          updates.title = JSON.parse(req.body.title);
        } catch {
          // Keep as is
        }
      }
      
      if (req.body.description && typeof req.body.description === 'string') {
        try {
          updates.description = JSON.parse(req.body.description);
        } catch {
          // Keep as is
        }
      }

      const media = await Media.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.json(media);
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete media
  async deleteMedia(req, res) {
    try {
      const media = await Media.findByIdAndDelete(req.params.id);

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      // TODO: Delete from Cloudinary as well
      res.json({ message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Reorder media
  async reorderMedia(req, res) {
    try {
      const { category, orderedIds } = req.body;
      
      for (let i = 0; i < orderedIds.length; i++) {
        await Media.findByIdAndUpdate(orderedIds[i], { order: i + 1 });
      }
      
      res.json({ message: 'Order updated successfully' });
    } catch (error) {
      console.error('Reorder error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = mediaController;