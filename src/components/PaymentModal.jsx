import React, { useState } from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  Radio,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';

export default function PaymentModal() {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartItems,
    smartCardBalance,
    placeOrder,
    setIsWalletModalOpen,
  } = useWebApp();

  const [paymentMethod, setPaymentMethod] = useState('rfid_tap'); // 'rfid_tap', 'upi', 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  if (!isPaymentModalOpen) return null;

  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const hasEnoughBalance = smartCardBalance >= totalAmount;

  const handlePay = async () => {
    if (isProcessing) return; // Prevent duplicate submission
    setIsProcessing(true);

    if (paymentMethod === 'upi') {
      // Simulate UPI reference verification delay
      await new Promise((r) => setTimeout(r, 1200));
    } else if (paymentMethod === 'rfid_tap') {
      // Simulate RFID wallet deduction
      await new Promise((r) => setTimeout(r, 1000));
    }

    await placeOrder({ paymentMethod });
    setIsProcessing(false);
  };

  return (
    <div className="modal-overlay" onClick={() => !isProcessing && setIsPaymentModalOpen(false)}>
      <div className="modal-card payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Select Payment Method</h3>
            <p className="modal-subtitle">Choose payment workflow for your canteen order</p>
          </div>
          <button
            onClick={() => !isProcessing && setIsPaymentModalOpen(false)}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Amount Banner */}
        <div className="payment-total-banner">
          <div>
            <span className="pay-banner-label">Total Payable</span>
            <h2 className="pay-banner-amt">₹{totalAmount.toFixed(2)}</h2>
          </div>
          <div className="pay-banner-items-count">
            {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="payment-methods-list">
          {/* Option 1: RFID Smart Card */}
          <div
            onClick={() => setPaymentMethod('rfid_tap')}
            className={`payment-method-card ${paymentMethod === 'rfid_tap' ? 'selected' : ''}`}
          >
            <div className="payment-method-radio">
              <div className={`radio-dot ${paymentMethod === 'rfid_tap' ? 'active' : ''}`}></div>
            </div>
            <div className="payment-method-icon-box rfid-icon">
              <Radio size={22} color="#FE8C00" />
            </div>
            <div className="payment-method-details">
              <div className="method-title-row">
                <h4>RFID Smart Card (Instant Tap)</h4>
                <span className="recommended-badge">Campus Wallet</span>
              </div>
              <p className="method-desc">
                Deducts directly from your student ID balance. Collect with card tap at counter.
              </p>
              <div className="method-balance-row">
                <span>Available Balance: </span>
                <strong className={hasEnoughBalance ? 'bal-ok' : 'bal-low'}>
                  ₹{smartCardBalance.toFixed(2)}
                </strong>
                {!hasEnoughBalance && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsWalletModalOpen(true);
                    }}
                    className="quick-recharge-link"
                  >
                    + Recharge
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Option 2: UPI / QR Code (Demonstration Mode) */}
          <div
            onClick={() => setPaymentMethod('upi')}
            className={`payment-method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
          >
            <div className="payment-method-radio">
              <div className={`radio-dot ${paymentMethod === 'upi' ? 'active' : ''}`}></div>
            </div>
            <div className="payment-method-icon-box upi-icon">
              <QrCode size={22} color="#3B82F6" />
            </div>
            <div className="payment-method-details">
              <div className="method-title-row">
                <h4>UPI / QR Code</h4>
                <span className="demo-badge">Manual Verification Demo</span>
              </div>
              <p className="method-desc">
                Simulates real-world campus UPI intent. Scan QR or enter payment reference ID.
              </p>
              {paymentMethod === 'upi' && (
                <div className="upi-preview-box">
                  <div className="upi-id-badge">
                    <span>Canteen UPI ID: </span>
                    <code>animatorjishnu.007@okhdfcbank</code>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter UPI Reference / UTR Number (e.g. 4082199023)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="upi-txn-input"
                  />
                  <div className="upi-demo-notice">
                    <Info size={12} />
                    <span>Demo mode: Entering any reference ID simulates a successful UPI audit record.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Option 3: Cash at Pickup */}
          <div
            onClick={() => setPaymentMethod('cod')}
            className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
          >
            <div className="payment-method-radio">
              <div className={`radio-dot ${paymentMethod === 'cod' ? 'active' : ''}`}></div>
            </div>
            <div className="payment-method-icon-box cash-icon">
              <Banknote size={22} color="#10B981" />
            </div>
            <div className="payment-method-details">
              <div className="method-title-row">
                <h4>Cash at Pickup Counter</h4>
              </div>
              <p className="method-desc">Pay cash directly to the canteen chef when picking up.</p>
            </div>
          </div>
        </div>

        {/* Insufficient balance warning if RFID chosen */}
        {paymentMethod === 'rfid_tap' && !hasEnoughBalance && (
          <div className="payment-alert-warning">
            <AlertCircle size={16} />
            <span>
              Your RFID balance (₹{smartCardBalance.toFixed(2)}) is lower than ₹
              {totalAmount.toFixed(2)}. Please recharge your wallet or choose UPI / Cash.
            </span>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="modal-footer">
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            disabled={isProcessing}
            className="btn-secondary"
          >
            Back to Cart
          </button>

          <button
            onClick={handlePay}
            disabled={isProcessing || (paymentMethod === 'rfid_tap' && !hasEnoughBalance)}
            className="btn-primary pay-action-btn"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                <span>
                  {paymentMethod === 'rfid_tap'
                    ? 'Processing RFID Card Tap...'
                    : 'Recording Payment...'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {paymentMethod === 'rfid_tap'
                    ? `Tap & Pay ₹${totalAmount.toFixed(2)}`
                    : `Confirm Order (₹${totalAmount.toFixed(2)})`}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <div className="payment-security-footer">
          <ShieldCheck size={14} color="#10B981" />
          <span>Secured Campus Payment &bull; Instant Kitchen Broadcast via Supabase</span>
        </div>
      </div>
    </div>
  );
}
