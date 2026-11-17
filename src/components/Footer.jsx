import React from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  Heart,
  Radio,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  const { setActiveTab, setIsWalletModalOpen, switchRole } = useWebApp();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <div className="footer-logo-row">
              <img
                src="/images/Logo.jpeg"
                alt="DineExpress Logo"
                className="footer-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="footer-brand-title">DineExpress</span>
            </div>
            <p className="footer-brand-desc">
              Automated smart canteen pre-ordering system with RFID tap-to-collect pickup, real-time
              kitchen queues, and seamless campus dining.
            </p>
            <div className="footer-badge-pill">
              <Radio size={12} className="footer-dot-pulse" />
              <span>Nandha Engineering College &bull; CSE (IoT)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Canteen Navigation</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => { setActiveTab('menu'); window.scrollTo(0, 0); }}>
                  Full Menu & Categories
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('orders'); window.scrollTo(0, 0); }}>
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('favorites'); window.scrollTo(0, 0); }}>
                  Favorite Dishes
                </button>
              </li>
              <li>
                <button onClick={() => setIsWalletModalOpen(true)}>
                  RFID Smart Card Balance
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Roles */}
          <div className="footer-col">
            <h4 className="footer-heading">Staff & Admin Portals</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => { switchRole('worker'); window.scrollTo(0, 0); }}>
                  👨‍🍳 Kitchen Dispatch Console
                </button>
              </li>
              <li>
                <button onClick={() => { switchRole('admin'); window.scrollTo(0, 0); }}>
                  🛡️ System Admin Analytics
                </button>
              </li>
              <li>
                <button onClick={() => { switchRole('student'); window.scrollTo(0, 0); }}>
                  🎓 Student Ordering Experience
                </button>
              </li>
            </ul>
          </div>

          {/* Team & Architecture */}
          <div className="footer-col">
            <h4 className="footer-heading">Project Architecture</h4>
            <div className="tech-tags-list">
              <span className="tech-tag">React 19 Web</span>
              <span className="tech-tag">Supabase Realtime</span>
              <span className="tech-tag">PostgreSQL</span>
              <span className="tech-tag">ESP32 RFID Reader</span>
              <span className="tech-tag">RC522 IoT</span>
              <span className="tech-tag">Vercel / Netlify</span>
            </div>
            <p className="project-team-text">
              Developed by <strong>Team Code Nexus</strong>: Hamsha N, Gokulraj V, Mohamed Aqdhas U, Jishnu K.
            </p>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} DineExpress. All rights reserved. Built with pride for campus automation.
          </p>
          <div className="footer-status-pill">
            <span className="status-indicator-green"></span>
            <span>Production Database & Real-time WebSockets Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
