import React, { useState } from 'react';
import { useWebApp } from '../context/WebAppContext';
import { getItemImage } from '../constants/MockData';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  Power,
  ToggleLeft,
  ToggleRight,
  Search,
  CheckCircle,
  AlertTriangle,
  History,
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    allOrders,
    products,
    toggleProductAvailability,
    isCanteenOpen,
    setIsCanteenOpen,
    showToast,
  } = useWebApp();

  const [timeFilter, setTimeFilter] = useState('All'); // 'Today', 'Weekly', 'All'
  const [productSearch, setProductSearch] = useState('');

  // Calculate Metrics
  const nonCancelledOrders = allOrders.filter(
    (o) => (o.status || '').toLowerCase() !== 'cancelled'
  );

  const totalRevenue = nonCancelledOrders.reduce(
    (acc, curr) => acc + (parseFloat(curr.total_amount) || 0),
    0
  );

  const totalOrdersCount = nonCancelledOrders.length;
  const registeredUsersCount = 148; // Campus students

  // Category Revenue Analytics
  let breakfastTotal = 0;
  let lunchTotal = 0;
  let snacksTotal = 0;
  let drinksTotal = 0;

  nonCancelledOrders.forEach((o) => {
    const s = (o.items_summary || '').toLowerCase();
    const amt = parseFloat(o.total_amount) || 0;
    if (s.match(/dosa|idly|idli|vadai|vada|poori|upma|pongal|pakoda/)) {
      breakfastTotal += amt;
    } else if (s.match(/briyani|biryani|rice|noodles|meals/)) {
      lunchTotal += amt;
    } else if (s.match(/tea|coffee|boost|horlicks|milk|juice|dew|sprite|water/)) {
      drinksTotal += amt;
    } else {
      snacksTotal += amt;
    }
  });

  const bPercent = totalRevenue ? Math.round((breakfastTotal / totalRevenue) * 100) : 30;
  const lPercent = totalRevenue ? Math.round((lunchTotal / totalRevenue) * 100) : 45;
  const sPercent = totalRevenue ? Math.round((snacksTotal / totalRevenue) * 100) : 15;
  const dPercent = totalRevenue ? Math.round((drinksTotal / totalRevenue) * 100) : 10;

  // Filter products for management
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Mock Activity Logs
  const auditLogs = [
    { id: 1, event: 'ORDER_PLACED', email: 'demo_student@nandhacen.edu.in', detail: 'Masala Dosa x2 via RFID Wallet', time: '5 mins ago' },
    { id: 2, event: 'STATUS_UPDATE', email: 'staff@gmail.com', detail: 'Order #ORD-8921 changed to PREPARING', time: '12 mins ago' },
    { id: 3, event: 'RFID_WALLET_TOPUP', email: 'gokulraj@nandhacen.edu.in', detail: '+₹200.00 via UPI', time: '30 mins ago' },
    { id: 4, event: 'LOGIN_AUTH', email: 'admin@nandhacen.edu.in', detail: 'Admin console access granted', time: '1 hour ago' },
  ];

  return (
    <div className="admin-page-container">
      <div className="container">
        {/* Admin Header */}
        <div className="admin-header-bar">
          <div className="admin-title-box">
            <div className="admin-icon-badge">
              <Shield size={28} color="#FE8C00" />
            </div>
            <div>
              <h2 className="admin-title">System Admin & Canteen Analytics</h2>
              <p className="admin-subtitle">
                Real-time campus revenue, item availability control, and student activity logs.
              </p>
            </div>
          </div>

          <div className="admin-canteen-switch">
            <span className="canteen-status-text">
              Status:{' '}
              <strong className={isCanteenOpen ? 'text-green' : 'text-red'}>
                {isCanteenOpen ? 'CANTEEN OPEN' : 'CANTEEN CLOSED'}
              </strong>
            </span>
            <button
              onClick={() => {
                const nextState = !isCanteenOpen;
                setIsCanteenOpen(nextState);
                showToast(
                  `Canteen switched to ${nextState ? 'OPEN' : 'CLOSED'}`,
                  nextState ? 'success' : 'error'
                );
              }}
              className={`btn-canteen-toggle ${isCanteenOpen ? 'open-btn' : 'closed-btn'}`}
            >
              <Power size={16} />
              <span>{isCanteenOpen ? 'Close Canteen' : 'Open Canteen'}</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metric Cards */}
        <div className="admin-metrics-grid">
          <div className="metric-card card-revenue">
            <div className="metric-icon-box green">
              <DollarSign size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-label">Total Canteen Revenue</span>
              <h3 className="metric-value">₹{totalRevenue.toLocaleString()}</h3>
              <span className="metric-subtext">Across {totalOrdersCount} completed orders</span>
            </div>
          </div>

          <div className="metric-card card-orders">
            <div className="metric-icon-box blue">
              <ShoppingBag size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-label">Total Orders Placed</span>
              <h3 className="metric-value">{totalOrdersCount}</h3>
              <span className="metric-subtext">Live database records</span>
            </div>
          </div>

          <div className="metric-card card-users">
            <div className="metric-icon-box amber">
              <Users size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-label">Active Student Cards</span>
              <h3 className="metric-value">{registeredUsersCount}</h3>
              <span className="metric-subtext">Registered RFID tags</span>
            </div>
          </div>

          <div className="metric-card card-hardware">
            <div className="metric-icon-box purple">
              <Package size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-label">RFID Hardware Bridge</span>
              <h3 className="metric-value status-online">ONLINE</h3>
              <span className="metric-subtext">ESP32 Counter Reader #1</span>
            </div>
          </div>
        </div>

        {/* Two Columns: Category Analytics & Audit Logs */}
        <div className="admin-two-cols">
          {/* Revenue Breakdown */}
          <div className="admin-panel">
            <h3 className="panel-title">Revenue by Meal Category</h3>
            <p className="panel-subtitle">Distribution across canteen product types</p>

            <div className="category-bars-list">
              <div className="category-bar-item">
                <div className="cat-bar-header">
                  <span>🍛 Lunch & Biryani</span>
                  <strong>
                    ₹{lunchTotal.toFixed(0)} ({lPercent}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-orange" style={{ width: `${lPercent}%` }}></div>
                </div>
              </div>

              <div className="category-bar-item">
                <div className="cat-bar-header">
                  <span>☕ South Indian Breakfast</span>
                  <strong>
                    ₹{breakfastTotal.toFixed(0)} ({bPercent}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-green" style={{ width: `${bPercent}%` }}></div>
                </div>
              </div>

              <div className="category-bar-item">
                <div className="cat-bar-header">
                  <span>🍪 Hot Snacks & Puffs</span>
                  <strong>
                    ₹{snacksTotal.toFixed(0)} ({sPercent}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-blue" style={{ width: `${sPercent}%` }}></div>
                </div>
              </div>

              <div className="category-bar-item">
                <div className="cat-bar-header">
                  <span>🥤 Fresh Juices & Drinks</span>
                  <strong>
                    ₹{drinksTotal.toFixed(0)} ({dPercent}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-amber" style={{ width: `${dPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="admin-panel">
            <h3 className="panel-title">Security & Activity Audit Logs</h3>
            <p className="panel-subtitle">Latest operations recorded in database</p>

            <div className="audit-logs-list">
              {auditLogs.map((log) => (
                <div key={log.id} className="audit-log-item">
                  <div className="audit-icon-bullet"></div>
                  <div className="audit-details">
                    <div className="audit-top">
                      <span className="audit-event-badge">{log.event}</span>
                      <span className="audit-time">{log.time}</span>
                    </div>
                    <p className="audit-text">{log.detail}</p>
                    <span className="audit-email">{log.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canteen Menu Inventory Management */}
        <div className="admin-panel menu-management-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">Menu Inventory & Availability Control</h3>
              <p className="panel-subtitle">
                Toggle dishes in and out of stock in real-time. Changes reflect immediately on
                students' screens.
              </p>
            </div>

            <div className="menu-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Filter dishes..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Dish / Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, 15).map((item) => {
                  const img = item.image_url || getItemImage(item.name);
                  const isAvailable = item.is_available !== false;
                  return (
                    <tr key={item.id}>
                      <td className="item-cell">
                        <img
                          src={img}
                          alt={item.name}
                          className="table-item-img"
                          onError={(e) => {
                            e.target.src = '/images/Logo.jpeg';
                          }}
                        />
                        <span className="table-item-name">{item.name}</span>
                      </td>
                      <td>
                        <span className="table-cat-badge">{item.category}</span>
                      </td>
                      <td>
                        <strong>₹{item.price}</strong>
                      </td>
                      <td>
                        <span className={`status-tag ${isAvailable ? 'tag-available' : 'tag-soldout'}`}>
                          {isAvailable ? 'In Stock' : 'Sold Out'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleProductAvailability(item.id, isAvailable)}
                          className={`btn-toggle-stock ${isAvailable ? 'btn-mark-out' : 'btn-mark-in'}`}
                        >
                          {isAvailable ? 'Mark Sold Out' : 'Enable Item'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
