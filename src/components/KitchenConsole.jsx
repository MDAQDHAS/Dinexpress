import React, { useState } from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  ListOrdered,
  Play,
  CheckCircle,
  Bell,
  Radio,
  Power,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function KitchenConsole() {
  const {
    allOrders,
    updateOrderStatus,
    isCanteenOpen,
    setIsCanteenOpen,
    fetchProducts,
    showToast,
  } = useWebApp();

  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending', 'preparing', 'ready', 'delivered'

  const activeQueue = allOrders.filter(
    (o) => !['cancelled'].includes((o.status || '').toLowerCase())
  );

  const pendingOrders = activeQueue.filter((o) => (o.status || '').toLowerCase() === 'pending');
  const preparingOrders = activeQueue.filter(
    (o) => (o.status || '').toLowerCase() === 'preparing' || (o.status || '').toLowerCase() === 'accepted'
  );
  const readyOrders = activeQueue.filter((o) => (o.status || '').toLowerCase() === 'ready');
  const deliveredOrders = activeQueue.filter((o) => (o.status || '').toLowerCase() === 'delivered');

  const displayedOrders =
    filterTab === 'all'
      ? activeQueue.filter((o) => (o.status || '').toLowerCase() !== 'delivered')
      : filterTab === 'pending'
      ? pendingOrders
      : filterTab === 'preparing'
      ? preparingOrders
      : filterTab === 'ready'
      ? readyOrders
      : deliveredOrders;

  return (
    <div className="kitchen-page-container">
      <div className="container">
        {/* Top Header */}
        <div className="kitchen-header-bar">
          <div className="kitchen-header-title-box">
            <div className="kitchen-icon-badge">
              <ChefHat size={28} color="#FE8C00" />
            </div>
            <div>
              <h2 className="kitchen-title">Kitchen Order Dispatch Console</h2>
              <p className="kitchen-subtitle">
                Live incoming orders from campus students. Update cooking status to notify students.
              </p>
            </div>
          </div>

          <div className="kitchen-header-controls">
            {/* Canteen Open / Closed Toggle */}
            <div className="canteen-toggle-box">
              <span className="toggle-label">
                {isCanteenOpen ? 'Accepting Orders' : 'Canteen Closed'}
              </span>
              <button
                onClick={() => {
                  const newState = !isCanteenOpen;
                  setIsCanteenOpen(newState);
                  showToast(
                    `Canteen is now ${newState ? 'OPEN for student orders' : 'CLOSED'}`,
                    newState ? 'success' : 'error'
                  );
                }}
                className={`power-toggle-btn ${isCanteenOpen ? 'is-open' : 'is-closed'}`}
                title="Toggle Canteen Open/Close State"
              >
                <Power size={18} />
                <span>{isCanteenOpen ? 'OPEN' : 'CLOSED'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metric Stats Cards */}
        <div className="kitchen-stats-grid">
          <div
            onClick={() => setFilterTab('pending')}
            className={`kitchen-stat-card border-blue ${filterTab === 'pending' ? 'active-stat' : ''}`}
          >
            <div className="stat-card-icon blue">
              <ListOrdered size={24} />
            </div>
            <div>
              <span className="stat-card-title">New / Pending</span>
              <h3 className="stat-card-number">{pendingOrders.length}</h3>
            </div>
          </div>

          <div
            onClick={() => setFilterTab('preparing')}
            className={`kitchen-stat-card border-amber ${filterTab === 'preparing' ? 'active-stat' : ''}`}
          >
            <div className="stat-card-icon amber">
              <Clock size={24} />
            </div>
            <div>
              <span className="stat-card-title">In Kitchen Cooking</span>
              <h3 className="stat-card-number">{preparingOrders.length}</h3>
            </div>
          </div>

          <div
            onClick={() => setFilterTab('ready')}
            className={`kitchen-stat-card border-green ${filterTab === 'ready' ? 'active-stat' : ''}`}
          >
            <div className="stat-card-icon green">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="stat-card-title">Ready for Counter Pickup</span>
              <h3 className="stat-card-number">{readyOrders.length}</h3>
            </div>
          </div>

          <div
            onClick={() => setFilterTab('delivered')}
            className={`kitchen-stat-card border-gray ${filterTab === 'delivered' ? 'active-stat' : ''}`}
          >
            <div className="stat-card-icon gray">
              <RotateCcw size={24} />
            </div>
            <div>
              <span className="stat-card-title">Completed Orders</span>
              <h3 className="stat-card-number">{deliveredOrders.length}</h3>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="kitchen-tabs-row">
          <button
            onClick={() => setFilterTab('all')}
            className={`kitchen-tab ${filterTab === 'all' ? 'active' : ''}`}
          >
            Active Queue ({pendingOrders.length + preparingOrders.length + readyOrders.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`kitchen-tab ${filterTab === 'pending' ? 'active' : ''}`}
          >
            Pending ({pendingOrders.length})
          </button>
          <button
            onClick={() => setFilterTab('preparing')}
            className={`kitchen-tab ${filterTab === 'preparing' ? 'active' : ''}`}
          >
            Cooking ({preparingOrders.length})
          </button>
          <button
            onClick={() => setFilterTab('ready')}
            className={`kitchen-tab ${filterTab === 'ready' ? 'active' : ''}`}
          >
            Ready for Pickup ({readyOrders.length})
          </button>
          <button
            onClick={() => setFilterTab('delivered')}
            className={`kitchen-tab ${filterTab === 'delivered' ? 'active' : ''}`}
          >
            Completed ({deliveredOrders.length})
          </button>
        </div>

        {/* Orders Queue Cards */}
        {displayedOrders.length === 0 ? (
          <div className="kitchen-empty-queue">
            <ChefHat size={48} color="#9E9E9E" />
            <h4>No orders in this stage</h4>
            <p>New student orders will appear here automatically via Supabase Real-time.</p>
          </div>
        ) : (
          <div className="kitchen-orders-grid">
            {displayedOrders.map((order) => {
              const status = (order.status || '').toLowerCase();
              return (
                <div key={order.id} className={`kitchen-order-card card-status-${status}`}>
                  <div className="k-card-header">
                    <div className="k-header-left">
                      <span className="k-order-badge">#{order.id}</span>
                      <span className="k-order-time">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span className={`k-status-pill pill-${status}`}>{status.toUpperCase()}</span>
                  </div>

                  <div className="k-customer-meta">
                    <span className="k-customer-name">
                      👤 {order.userName || 'Student'}
                    </span>
                    <span className="k-payment-tag">
                      {order.payment_method === 'rfid_tap' ? '💳 RFID Card' : order.payment_method}
                    </span>
                  </div>

                  <div className="k-items-box">
                    <h5 className="k-items-label">Dishes to Prepare:</h5>
                    <p className="k-items-text">{order.items_summary}</p>
                  </div>

                  <div className="k-card-actions">
                    {status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                        className="btn-k-action btn-k-accept"
                      >
                        <CheckCircle size={16} />
                        <span>Accept Order</span>
                      </button>
                    )}

                    {status === 'accepted' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="btn-k-action btn-k-start"
                      >
                        <Play size={16} fill="white" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="btn-k-action btn-k-ready"
                      >
                        <Bell size={16} />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="btn-k-action btn-k-deliver"
                      >
                        <Radio size={16} />
                        <span>Confirm Student RFID Pickup</span>
                      </button>
                    )}

                    {status === 'delivered' && (
                      <div className="k-delivered-stamp">
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>Collected by Student</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
