import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, Activity, Map, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        axios.get('/api/admin/analytics'),
        axios.get('/api/orders'), // Admin should get all orders in backend if we check role, wait, orderController gets all if admin
        axios.get('/api/admin/users')
      ]);
      
      setStats(statsRes.data.data);
      
      // Need to adjust order controller backend to send all orders if admin. 
      // Right now it might return empty or error. Assuming backend handles it:
      setOrders(ordersRes.data.data);
      
      const allAgents = usersRes.data.data.filter(u => u.role === 'agent');
      setAgents(allAgents);
      
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const assignAgent = async (orderId, agentId) => {
    if (!agentId) return;
    try {
      await axios.put(`/api/orders/${orderId}/assign`, { agentId });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to assign agent', error);
      alert('Failed to assign agent');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of system analytics and logistics management.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4"><Users className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Users</p><p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 rounded-full bg-brand-100 text-brand-600 mr-4"><Package className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Orders</p><p className="text-2xl font-bold text-slate-900">{stats?.totalOrders || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4"><Activity className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Active Deliveries</p><p className="text-2xl font-bold text-slate-900">{stats?.activeOrders || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4"><Truck className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Delivery Agents</p><p className="text-2xl font-bold text-slate-900">{stats?.totalAgents || 0}</p></div>
        </div>
      </div>

      {/* Order Management */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Map className="h-5 w-5 mr-2 text-brand-500" /> Order Management
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Agent</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600">
                    <Link to={`/track/${order._id}`}>#{order._id.slice(-6).toUpperCase()}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.customerId?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {order.status === 'Pending' ? (
                      <select 
                        onChange={(e) => assignAgent(order._id, e.target.value)}
                        className="block w-full rounded-md border-slate-300 py-1 pl-3 pr-10 text-base focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign an agent</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-medium text-slate-900">{order.assignedAgent?.name || 'Unassigned'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/track/${order._id}`} className="text-brand-600 hover:text-brand-900">Track</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
