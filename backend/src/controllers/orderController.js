import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const { pickupLocation, deliveryLocation, packageDetails } = req.body;

    const order = await Order.create({
      customerId: req.user.id,
      pickupLocation,
      deliveryLocation,
      packageDetails,
      status: 'Pending',
    });

    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    } else if (req.user.role === 'agent') {
      query.assignedAgent = req.user.id;
    }
    // If admin, query remains empty to fetch all

    const orders = await Order.find(query).populate('customerId', 'name email phoneNumber').populate('assignedAgent', 'name phoneNumber');
    res.status(200).json({ status: 'success', count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phoneNumber')
      .populate('assignedAgent', 'name phoneNumber');
      
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    // Role-based access control
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to view this order' });
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    if (req.user.role === 'agent' && order.assignedAgent?.toString() !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    // Emit event if socket is available via req.app
    const io = req.app.get('io');
    if (io) {
      io.to(order._id.toString()).emit('status_updated', { status: order.status });
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    order.assignedAgent = agentId;
    order.status = 'Order Received';
    await order.save();

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
