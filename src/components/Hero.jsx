import React from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  Zap,
  Clock,
  CreditCard,
  ChefHat,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Radio,
} from 'lucide-react';

export default function Hero() {
  const { setActiveTab, setIsWalletModalOpen } = useWebApp();

  return (
    <div className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Radio size={14} className="pulse-dot-icon" />
            <span>Powered by IoT RFID & Supabase Real-time</span>
          </div>

          <h1 className="hero-title">
            Smart Campus Dining, <br />
            <span className="hero-highlight">Zero Queue Waiting</span>
          </h1>

          <p className="hero-description">
            Pre-order delicious South Indian breakfast, aromatic lunch, tea & snacks directly from
            your browser. Collect in seconds with an <strong>RFID Tap</strong> at the college counter!
          </p>

          <div className="hero-cta-group">
            <button
              onClick={() => {
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary hero-btn"
            >
              <span>Explore Canteen Menu</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="btn-secondary hero-btn"
            >
              <CreditCard size={18} />
              <span>RFID Wallet Recharge</span>
            </button>
          </div>

          {/* Quick Highlight Stats */}
          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-text">Daily Dishes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">&lt; 5s</span>
              <span className="stat-text">RFID Pickup</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-text">Live Sync</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">₹0</span>
              <span className="stat-text">Campus Delivery Fee</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card / Highlights */}
        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="feature-card main-feature-card">
              <div className="feature-header">
                <div className="feature-icon-badge orange">
                  <Zap size={22} />
                </div>
                <div className="feature-title-box">
                  <span className="feature-tag">FAST TAP & COLLECT</span>
                  <h3>RFID Smart Card System</h3>
                </div>
              </div>
              <p className="feature-body">
                Integrated with ESP32 / ESP8266 RC522 RFID reader. Tap your student card to verify
                and collect hot meals instantly without manual tokens.
              </p>
              <div className="feature-footer">
                <div className="pill-chip">
                  <CheckCircle size={14} color="#10B981" />
                  <span>Hardware Enabled</span>
                </div>
                <div className="pill-chip">
                  <CheckCircle size={14} color="#10B981" />
                  <span>Anti-Theft Security</span>
                </div>
              </div>
            </div>

            <div className="feature-card sub-feature-card">
              <div className="feature-header">
                <div className="feature-icon-badge blue">
                  <ChefHat size={20} />
                </div>
                <div className="feature-title-box">
                  <span className="feature-tag">KITCHEN CONSOLE</span>
                  <h4>Real-time Order Progression</h4>
                </div>
              </div>
              <p className="feature-body-sm">
                Chefs update cooking stages in real-time. Students receive immediate pickup alerts on
                screen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
