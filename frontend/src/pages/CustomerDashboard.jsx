import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, MapPin, Truck, Plus, Clock } from 'lucide-react';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // New Order State
  const [pickupAddr, setPickupAddr] = useState('');
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const [desc, setDesc] = useState('');
  const [weight, setWeight] = useState('');
  const [priority, setPriority] = useState('Standard');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        pickupLocation: {
          address: pickupAddr,
          latitude: 18.5204 + (Math.random() * 0.1), // Mock data for demo
          longitude: 73.8567 + (Math.random() * 0.1)
        },
        deliveryLocation: {
          address: deliveryAddr,
          latitude: 18.5204 - (Math.random() * 0.1),
          longitude: 73.8567 - (Math.random() * 0.1)
        },
        packageDetails: {
          description: desc,
          weight: Number(weight),
          priority
        }
      };
      
      await axios.post('/api/orders', payload);
      setShowForm(false);
      fetchOrders();
      
      // Reset form
      setPickupAddr(''); setDeliveryAddr(''); setDesc(''); setWeight('');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your delivery requests and track active shipments.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Delivery</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Create New Delivery Request</h2>
          <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pickupAddr" className="block text-sm font-medium text-slate-700">Pickup Address</label>
              <input id="pickupAddr" name="pickupAddr" type="text" required value={pickupAddr} onChange={(e) => setPickupAddr(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" placeholder="123 Origin St" />
            </div>
            <div>
              <label htmlFor="deliveryAddr" className="block text-sm font-medium text-slate-700">Delivery Address</label>
              <input id="deliveryAddr" name="deliveryAddr" type="text" required value={deliveryAddr} onChange={(e) => setDeliveryAddr(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" placeholder="456 Destination Ave" />
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-slate-700">Package Description</label>
              <input id="desc" name="desc" type="text" required value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" placeholder="Electronics, Documents, etc." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-slate-700">Weight (kg)</label>
                <input id="weight" name="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority</label>
                <select id="priority" name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white">
                  <option>Standard</option>
                  <option>Express</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 shadow-sm">Submit Request</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Package className="h-5 w-5 mr-2 text-brand-500" /> My Orders
          </h2>
        </div>
        
        {orders && orders.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {orders.map((order) => (
              <li key={order._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm font-medium text-brand-600 mb-1">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    <h3 className="text-lg font-semibold text-slate-900">{order.packageDetails?.description}</h3>
                    <div className="mt-2 flex flex-col space-y-2 text-sm text-slate-600">
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-slate-400" /> From: {order.pickupLocation?.address}</span>
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-brand-400" /> To: {order.deliveryLocation?.address}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end space-y-3">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {order.status}
                    </span>
                    <span className="flex items-center text-xs text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {(order.status !== 'Pending' && order.status !== 'Cancelled') && (
                      <Link 
                        to={`/track/${order._id}`} 
                        className="mt-2 flex items-center text-sm font-medium text-brand-600 hover:text-brand-500 bg-brand-50 px-3 py-1.5 rounded border border-brand-100"
                      >
                        <Truck className="h-4 w-4 mr-1" /> Track Delivery
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Package className="h-12 w-12 text-slate-300 mb-4" />
            <p>You haven't created any delivery orders yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-brand-600 font-medium hover:underline">Create your first order</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
