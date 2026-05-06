import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAgent: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  pickupLocation: {
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  deliveryLocation: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  packageDetails: {
    description: { type: String, required: true },
    weight: { type: Number }, // in kg
    priority: { 
      type: String, 
      enum: ['Standard', 'Express', 'Urgent'],
      default: 'Standard'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Order Received', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  estimatedDeliveryTime: {
    type: Date
  },
}, {
  timestamps: true,
});

export default mongoose.model('Order', orderSchema);
