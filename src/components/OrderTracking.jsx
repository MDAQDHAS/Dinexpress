import React from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Radio,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', desc: 'Sent to kitchen' },
  { key: 'accepted', label: 'Accepted', desc: 'Chef acknowledged' },
  { key: 'preparing', label: 'In Kitchen', desc: 'Cooking fresh' },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Hot at counter' },
  { key: 'delivered', label: 'Completed', desc: 'Collected with RFID' },
];

export default function OrderTracking() {
  const { myOrders, updateOrderStatus, cancelOrder, setActiveTab, user } = useWebApp();

  const activeOrders = myOrders.filter(
    (o) => !['delivered', 'completed', 'cancelled'].includes((o.status || '').toLowerCase())
  );
  const pastOrders = myOrders.filter((o) =>
    ['delivered', 'completed', 'cancelled'].includes((o.status || '').toLowerCase())
  );

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'accepted') return 1;
    if (s === 'preparing') return 2;
    if (s === 'ready') return 3;
    if (s === 'delivered' || s === 'completed') return 4;
    return 0;
  };

  return (
    <div className="orders-page-container">
      <div className="container">
        {/* Page Header */}
        <div className="orders-header">
          <div>
            <h2 className="orders-title">Live Orders & Pickup Status</h2>
            <p className="orders-subtitle">
              Track your canteen meals in real-time. Head to the counter when status changes to{' '}
              <strong>Ready for Pickup</strong>!
            </p>
          </div>
          <button onClick={() => setActiveTab('menu')} className="btn-secondary">
            + Order More Food
          </button>
        </div>

        {/* Active Orders Section */}
        <div className="orders-section">
          <h3 className="section-subheading">
            <span className="live-indicator-dot"></span>
            Active Orders ({activeOrders.length})
          </h3>

          {activeOrders.length === 0 ? (
            <div className="empty-orders-card">
              <ShoppingBag size={42} color="#FE8C00" />
              <h4>No Active Orders</h4>
              <p>You don't have any meals being prepared right now.</p>
              <button onClick={() => setActiveTab('menu')} className="btn-primary">
                Browse Canteen Menu
              </button>
            </div>
          ) : (
            <div className="active-orders-grid">
              {activeOrders.map((order) => {
                const stepIdx = getStepIndex(order.status);
                const isReady = order.status.toLowerCase() === 'ready';

                return (
                  <div
                    key={order.id}
                    className={`order-card ${isReady ? 'order-card-ready-pulse' : ''}`}
                  >
                    {/* Top Meta Header */}
                    <div className="order-card-header">
                      <div className="order-id-block">
                        <span className="order-tag-label">ORDER ID</span>
                        <h4 className="order-id-num">{order.id}</h4>
                        <span className="order-timestamp">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className={`order-status-badge status-${order.status.toLowerCase()}`}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Order Stepper Progress Bar */}
                    <div className="order-stepper-container">
                      <div className="stepper-progress-bar">
                        <div
                          className="stepper-progress-fill"
                          style={{ width: `${(stepIdx / 4) * 100}%` }}
                        ></div>
                      </div>

                      <div className="stepper-nodes-row">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;
                          return (
                            <div
                              key={step.key}
                              className={`stepper-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                            >
                              <div className="stepper-circle">
                                {isDone ? <CheckCircle2 size={14} /> : idx + 1}
                              </div>
                              <span className="stepper-label">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="order-details-box">
                      <div className="order-items-summary">
                        <strong>Dishes:</strong> {order.items_summary}
                      </div>
                      <div className="order-payment-meta">
                        <span>
                          Payment:{' '}
                          <strong className="payment-type-badge">
                            {order.payment_method === 'rfid_tap'
                              ? '💳 RFID Smart Card'
                              : order.payment_method === 'upi'
                              ? '📱 UPI Online'
                              : '💵 Cash at Counter'}
                          </strong>
                        </span>
                        <span className="order-total-price">
                          Total: <strong>₹{order.total_amount}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="order-card-footer">
                      {isReady && (
                        <div className="ready-alert-box">
                          <Radio size={18} className="ready-ping-icon" />
                          <span>Your order is HOT & READY! Tap your card at Counter #1.</span>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="btn-collect-tap"
                            title="Simulate student tapping RFID card at physical counter reader"
                          >
                            <Radio size={14} />
                            <span>Simulate RFID Tap Pickup [IoT Simulation]</span>
                          </button>
                        </div>
                      )}

                      {order.status.toLowerCase() === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="btn-cancel-order"
                        >
                          <XCircle size={16} />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Orders History */}
        {pastOrders.length > 0 && (
          <div className="orders-section past-orders-section">
            <h3 className="section-subheading">Past Orders History</h3>
            <div className="past-orders-table-wrapper">
              <table className="past-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date & Time</th>
                    <th>Items Ordered</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString()}{' '}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>{order.items_summary}</td>
                      <td>
                        <span className="past-pay-method">{order.payment_method}</span>
                      </td>
                      <td>
                        <strong>₹{order.total_amount}</strong>
                      </td>
                      <td>
                        <span className={`status-pill-sm status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
