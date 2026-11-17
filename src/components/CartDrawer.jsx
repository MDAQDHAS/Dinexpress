import React from 'react';
import { useWebApp } from '../context/WebAppContext';
import { getItemImage } from '../constants/MockData';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    smartCardBalance,
    setIsPaymentModalOpen,
    setIsWalletModalOpen,
  } = useWebApp();

  if (!isCartOpen) return null;

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const packagingFee = 0; // Free for campus students
  const grandTotal = subtotal + packagingFee;
  const pointsEarned = Math.floor(grandTotal / 10);

  const handleCheckoutClick = () => {
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-box">
            <ShoppingBag size={20} className="cart-header-icon" />
            <h3>Your Food Cart</h3>
            <span className="cart-item-count-badge">
              {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} items
            </span>
          </div>

          <div className="cart-header-actions">
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="cart-clear-text-btn">
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="cart-close-btn"
              title="Close cart"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-view">
              <div className="cart-empty-icon">
                <ShoppingBag size={48} color="#FE8C00" />
              </div>
              <h4>Your cart is empty</h4>
              <p>Looks like you haven't added any campus favorites yet!</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-primary">
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const img = item.image_url || getItemImage(item.name);
                const itemTotal = item.price * item.quantity;
                return (
                  <div key={item.id} className="cart-item-row">
                    <img
                      src={img}
                      alt={item.name}
                      className="cart-item-thumb"
                      onError={(e) => {
                        e.target.src = '/images/Logo.jpeg';
                      }}
                    />

                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-unit-price">
                        ₹{item.price} each &bull; <strong>₹{itemTotal}</strong>
                      </div>

                      <div className="cart-item-controls">
                        <div className="cart-qty-pill">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="cart-qty-btn"
                            title="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="cart-qty-val">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="cart-qty-btn cart-qty-plus"
                            title="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="cart-delete-btn"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer & Checkout Box */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Balance Preview Card */}
            <div className="wallet-mini-card">
              <div className="wallet-mini-left">
                <CreditCard size={18} color="#FE8C00" />
                <div>
                  <span className="wallet-mini-title">RFID Card Balance</span>
                  <span className="wallet-mini-bal">₹{smartCardBalance.toFixed(2)}</span>
                </div>
              </div>
              {smartCardBalance < grandTotal ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="wallet-topup-link-btn"
                >
                  + Add ₹{(grandTotal - smartCardBalance).toFixed(0)}
                </button>
              ) : (
                <span className="balance-sufficient-tag">Balance OK ✓</span>
              )}
            </div>

            {/* Bill Breakdown */}
            <div className="bill-summary">
              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>Campus Dining Fee</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="bill-row points-row">
                <span>Loyalty Points to Earn</span>
                <span className="points-val">+{pointsEarned} Pts</span>
              </div>
              <div className="bill-divider"></div>
              <div className="bill-row grand-total-row">
                <span>Total Amount</span>
                <span className="total-val">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button onClick={handleCheckoutClick} className="btn-primary checkout-btn">
              <span>Choose Payment & Place Order</span>
              <ArrowRight size={18} />
            </button>

            <div className="checkout-trust-badge">
              <ShieldCheck size={14} color="#10B981" />
              <span>Instant RFID Counter Verification Enabled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
