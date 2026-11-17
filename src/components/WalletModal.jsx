import React, { useState } from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  X,
  CreditCard,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function WalletModal() {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    smartCardBalance,
    rechargeWallet,
    user,
  } = useWebApp();

  const [amount, setAmount] = useState('100');
  const [payMethod, setPayMethod] = useState('upi'); // 'upi', 'card'
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isWalletModalOpen) return null;

  const presets = [50, 100, 200, 500];

  const handleRecharge = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 10) {
      alert('Minimum recharge is ₹10');
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    await rechargeWallet(num);
    setIsProcessing(false);
    setIsWalletModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => !isProcessing && setIsWalletModalOpen(false)}>
      <div className="modal-card wallet-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">RFID Smart Card Recharge</h3>
            <p className="modal-subtitle">Instant balance top-up for fast campus canteen tap</p>
          </div>
          <button
            onClick={() => !isProcessing && setIsWalletModalOpen(false)}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Balance Display Card */}
        <div className="wallet-card-visual">
          <div className="card-visual-top">
            <span className="card-chip-tag">DineExpress Campus RFID</span>
            <span className="card-contactless-icon">📶</span>
          </div>
          <div className="card-visual-balance">
            <span className="card-bal-label">Current Balance</span>
            <h2 className="card-bal-val">₹{smartCardBalance.toFixed(2)}</h2>
          </div>
          <div className="card-visual-footer">
            <span className="card-holder-name">{user?.full_name || 'Gokulraj (Student)'}</span>
            <span className="card-tag-id">TAG-ID: 73 A4 92 1B</span>
          </div>
        </div>

        {/* Preset Amount Pills */}
        <div className="recharge-amount-section">
          <label className="input-label">Select Recharge Amount</label>
          <div className="preset-amounts-row">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                className={`preset-amt-btn ${amount === String(val) ? 'active' : ''}`}
              >
                +₹{val}
              </button>
            ))}
          </div>

          <div className="custom-amt-input-wrap">
            <span className="amt-currency-prefix">₹</span>
            <input
              type="number"
              min="10"
              max="5000"
              placeholder="Or enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="custom-amt-input"
            />
          </div>
        </div>

        {/* Payment Gateway Method */}
        <div className="recharge-gateway-section">
          <label className="input-label">Pay via Gateway</label>
          <div className="gateway-options-grid">
            <button
              type="button"
              onClick={() => setPayMethod('upi')}
              className={`gateway-option-btn ${payMethod === 'upi' ? 'selected' : ''}`}
            >
              <QrCode size={18} color="#3B82F6" />
              <span>UPI / QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => setPayMethod('card')}
              className={`gateway-option-btn ${payMethod === 'card' ? 'selected' : ''}`}
            >
              <CreditCard size={18} color="#FE8C00" />
              <span>Debit / Credit Card</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="modal-footer">
          <button
            onClick={() => setIsWalletModalOpen(false)}
            disabled={isProcessing}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleRecharge}
            disabled={isProcessing || !amount || parseFloat(amount) < 10}
            className="btn-primary"
          >
            {isProcessing ? 'Processing Gateway...' : `Add ₹${amount || 0} to RFID Card`}
          </button>
        </div>

        <div className="payment-security-footer">
          <ShieldCheck size={14} color="#10B981" />
          <span>Encrypted Gateway Simulation &bull; Updated Instantly in Profile DB</span>
        </div>
      </div>
    </div>
  );
}
