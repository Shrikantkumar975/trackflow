import User from '../models/User.js';
import Order from '../models/Order.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $nin: ['Delivered', 'Cancelled'] } });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    
    // Group orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalOrders,
        activeOrders,
        totalAgents,
        ordersByStatus,
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    await user.deleteOne();
    res.status(200).json({ status: 'success', message: 'User removed' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
