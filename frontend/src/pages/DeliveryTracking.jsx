import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Package, Clock, ShieldAlert } from 'lucide-react';

// Fix Leaflet Default Icon Issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();

    // Initialize Socket
    socketRef.current = io('/'); // Proxy will route to localhost:5000 in dev
    
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      socketRef.current.emit('join_order_room', orderId);
    });

    socketRef.current.on('location_updated', (data) => {
      console.log('New location received:', data);
      setAgentLocation({ lat: data.latitude, lng: data.longitude });
    });

    socketRef.current.on('status_updated', (data) => {
      console.log('Status updated:', data);
      setOrder(prev => prev ? { ...prev, status: data.status } : null);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const [orderRes, locRes] = await Promise.all([
        axios.get(`/api/orders/${orderId}`),
        axios.get(`/api/locations/${orderId}`).catch(() => ({ data: null }))
      ]);
      
      setOrder(orderRes.data.data);
      if (locRes.data?.data) {
        setAgentLocation({ 
          lat: locRes.data.data.latitude, 
          lng: locRes.data.data.longitude 
        });
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center">Loading tracking info...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found or access denied.</div>;

  const pickup = [order.pickupLocation.latitude || 18.5204, order.pickupLocation.longitude || 73.8567];
  const dropoff = [order.deliveryLocation.latitude, order.deliveryLocation.longitude];
  const agentPos = agentLocation ? [agentLocation.lat, agentLocation.lng] : pickup;

  // Custom Icons
  const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const agentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [35, 55],
    iconAnchor: [17, 55],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center">
              Tracking Order <span className="text-brand-600 ml-2">#{order._id.slice(-6).toUpperCase()}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">{order.packageDetails.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-500 mb-1">Current Status</span>
          <span className="px-4 py-1.5 inline-flex text-sm font-bold rounded-full bg-blue-100 text-blue-800 animate-pulse">
            {order.status}
          </span>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" /> Delivery Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Pickup</p>
                <p className="text-sm text-slate-900 font-medium mt-1">{order.pickupLocation.address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Dropoff</p>
                <p className="text-sm text-slate-900 font-medium mt-1">{order.deliveryLocation.address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Priority</p>
                <p className="text-sm text-slate-900 font-medium mt-1">{order.packageDetails.priority}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Timeline
            </h3>
            <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
               {/* Extremely simple timeline UI for brevity */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-brand-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-2 rounded border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900 text-sm">{order.status}</div>
                      </div>
                      <div className="text-xs text-slate-500">Latest Update</div>
                  </div>
              </div>
            </div>
          </div>
          
          {order.assignedAgent && (
            <div className="bg-slate-800 text-white p-5 rounded-lg shadow-sm border border-slate-700">
               <h3 className="font-semibold text-slate-100 mb-2 flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2 text-brand-400" /> Agent Info
              </h3>
              <p className="text-sm">Name: {order.assignedAgent.name}</p>
              <p className="text-sm mt-1">Contact: {order.assignedAgent.phoneNumber || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative z-0 min-h-[400px]">
          <MapContainer center={agentPos} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Source */}
            <Marker position={pickup} icon={pickupIcon}>
              <Popup>Pickup Location<br/>{order.pickupLocation.address}</Popup>
            </Marker>
            
            {/* Destination */}
            <Marker position={dropoff} icon={dropoffIcon}>
              <Popup>Delivery Location<br/>{order.deliveryLocation.address}</Popup>
            </Marker>

            {/* Agent Live Location */}
            {(order.status !== 'Pending' && order.status !== 'Delivered' && order.status !== 'Cancelled') && (
              <Marker position={agentPos} icon={agentIcon}>
                <Popup>Delivery Agent<br/>Live Location</Popup>
              </Marker>
            )}

            {/* Simple Polyline Route */}
            <Polyline 
              positions={[pickup, dropoff]} 
              color="blue" 
              dashArray="5, 10" 
              weight={3}
              opacity={0.5} 
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;
