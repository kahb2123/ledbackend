const Service = require('../models/Service');

const serviceController = {
  // Get all services
  async getAllServices(req, res) {
    try {
      const { category, type } = req.query;
      const query = {};

      if (category) query.category = category;
      if (type) query.type = type;

      const services = await Service.find(query)
        .sort({ type: 1 });
      
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single service
  async getServiceById(req, res) {
    try {
      const service = await Service.findById(req.params.id);
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get service by type (P2, P3, etc.)
  async getServiceByType(req, res) {
    try {
      const { type } = req.params;
      const service = await Service.findOne({ type });
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create service (admin only)
  async createService(req, res) {
    try {
      const service = new Service(req.body);
      await service.save();
      res.status(201).json(service);
    } catch (error) {
      console.error('Error creating service:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Service type already exists' });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  // Update service (admin only)
  async updateService(req, res) {
    try {
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json(service);
    } catch (error) {
      console.error('Error updating service:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Service type already exists' });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  // Delete service (admin only)
  async deleteService(req, res) {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Calculate price
  async calculatePrice(req, res) {
    try {
      const { type, squareMeters, days } = req.body;

      const service = await Service.findOne({ type });
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const pricePerDay = service.pricePerDay;
      const totalPrice = pricePerDay * squareMeters * days;

      res.json({
        type,
        squareMeters,
        days,
        pricePerDay,
        totalPrice
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = serviceController;