import Location from '../models/Location.js';
import Order from '../models/Order.js';

export const updateLocation = async (req, res) => {
  try {
    const { orderId, latitude, longitude } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    if (req.user.role === 'agent' && order.assignedAgent?.toString() !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized for this order' });
    }

    let location = await Location.findOne({ orderId });
    if (location) {
      location.latitude = latitude;
      location.longitude = longitude;
      location.updatedAt = Date.now();
      await location.save();
    } else {
      location = await Location.create({
        orderId,
        latitude,
        longitude
      });
    }

    // Emit event if socket is available via req.app
    const io = req.app.get('io');
    if (io) {
      io.to(orderId).emit('location_updated', { latitude, longitude });
    }

    res.status(200).json({ status: 'success', data: location });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const location = await Location.findOne({ orderId });
    
    if (!location) {
      return res.status(404).json({ status: 'error', message: 'Location not found' });
    }

    res.status(200).json({ status: 'success', data: location });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
