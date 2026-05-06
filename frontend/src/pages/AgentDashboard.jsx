import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Truck, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { io } from 'socket.io-client';

const AgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const socketRef = useRef(null);
  const locationInterval = useRef(null);

  useEffect(() => {
    fetchOrders();

    socketRef.current = io('/');
    socketRef.current.on('connect', () => {
      console.log('Agent connected to socket server');
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data.data);
      // Find the first active order
      const active = data.data.find(o => !['Delivered', 'Cancelled'].includes(o.status));
      if (active) setActiveOrder(active);
    } catch (error) {
      console.error('Error fetching agent orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      
      if (newStatus === 'Delivered') {
        stopLocationSharing();
      }
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status');
    }
  };

  // Mock Live Location Sharing
  const startLocationSharing = (order) => {
    if (locationInterval.current) clearInterval(locationInterval.current);
    
    let lat = order.pickupLocation.latitude || 18.5204;
    let lng = order.pickupLocation.longitude || 73.8567;
    
    // Simulate movement towards delivery location
    const targetLat = order.deliveryLocation.latitude;
    const targetLng = order.deliveryLocation.longitude;

    locationInterval.current = setInterval(async () => {
      // Move closer
      lat += (targetLat - lat) * 0.1;
      lng += (targetLng - lng) * 0.1;

      // Emit to socket room
      socketRef.current.emit('update_location', {
        orderId: order._id,
        latitude: lat,
        longitude: lng
      });

      // Save to DB
      try {
        await axios.post('/api/locations', { orderId: order._id, latitude: lat, longitude: lng });
      } catch (err) {
        // Silent fail for mock interval
      }
    }, 3000); // Update every 3 seconds for demo
    
    alert('Live location sharing started!');
  };

  const stopLocationSharing = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
      alert('Location sharing stopped.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading deliveries...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Delivery Agent Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage your assigned deliveries and update statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-brand-500" /> Assigned Deliveries
              </h2>
            </div>
            
            {orders.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <li key={order._id} className={`p-6 hover:bg-slate-50 transition-colors ${activeOrder?._id === order._id ? 'bg-brand-50 border-l-4 border-brand-500' : ''}`}>
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <p className="text-sm font-medium text-brand-600 mb-1">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                        <h3 className="text-lg font-semibold text-slate-900">{order.packageDetails?.description}</h3>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-slate-400" /> From: {order.pickupLocation?.address}</p>
                          <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-red-400" /> To: {order.deliveryLocation?.address}</p>
                          <p>Customer: {order.customerId?.name} ({order.customerId?.phoneNumber || 'No phone'})</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end space-y-2">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          Status: {order.status}
                        </span>
                        
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <div className="mt-4 w-full">
                            <select 
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2 border bg-white"
                              value={order.status}
                              onChange={(e) => updateStatus(order._id, e.target.value)}
                            >
                              <option value="Order Received">Order Received</option>
                              <option value="Picked Up">Picked Up</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500">No deliveries assigned to you yet.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-brand-600" /> Active Tracking
            </h3>
            
            {activeOrder ? (
              <div>
                <p className="text-sm text-slate-600 mb-4">You are currently handling <strong>Order #{activeOrder._id.slice(-6).toUpperCase()}</strong>.</p>
                <div className="space-y-3">
                  <button 
                    onClick={() => startLocationSharing(activeOrder)}
                    className="w-full flex items-center justify-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors"
                  >
                    <Navigation className="h-4 w-4" /> <span>Start Live Sharing</span>
                  </button>
                  <button 
                    onClick={stopLocationSharing}
                    className="w-full flex items-center justify-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors border border-red-200"
                  >
                    <CheckCircle className="h-4 w-4" /> <span>Stop / Complete</span>
                  </button>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500">
                  <p><strong>Note:</strong> Starting live sharing will automatically emit your GPS coordinates to the customer via WebSockets every 3 seconds.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active orders to track. Select an order to begin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
