import React, { useState } from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  ShoppingBag,
  Heart,
  Clock,
  Menu,
  X,
  CreditCard,
  User,
  LogOut,
  ChefHat,
  Shield,
  Utensils,
  ChevronDown,
  Sparkles,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const {
    user,
    switchRole,
    cartItems,
    favorites,
    smartCardBalance,
    activeTab,
    setActiveTab,
    isCanteenOpen,
    setIsCartOpen,
    setIsAuthModalOpen,
    setIsWalletModalOpen,
    logout,
    searchQuery,
    setSearchQuery,
  } = useWebApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar-container">
      {/* Top Recruiter / Demo Quick Bar */}
      <div className="demo-announcement-bar">
        <div className="container announcement-content">
          <div className="announcement-left">
            <Sparkles size={14} className="sparkle-icon" />
            <span className="announcement-title">Recruiter & Interviewer Live Demo Mode:</span>
            <span className="announcement-desc">Switch roles with 1 click to test full-stack workflows!</span>
          </div>
          <div className="role-switch-buttons">
            <button
              onClick={() => switchRole('student')}
              className={`role-badge-btn ${user?.role === 'student' ? 'active-role' : ''}`}
            >
              🎓 Student Mode
            </button>
            <button
              onClick={() => switchRole('worker')}
              className={`role-badge-btn ${user?.role === 'worker' ? 'active-role' : ''}`}
            >
              👨‍🍳 Kitchen Console
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`role-badge-btn ${user?.role === 'admin' ? 'active-role' : ''}`}
            >
              🛡️ Admin System
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="container nav-inner">
          {/* Brand Logo & Canteen Status */}
          <div className="nav-brand-group">
            <div className="brand-logo-wrapper" onClick={() => handleNavClick('menu')}>
              <img
                src="/images/Logo.jpeg"
                alt="DineExpress Logo"
                className="brand-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="brand-text-block">
                <span className="brand-title">DineExpress</span>
                <span className="brand-subtitle">Smart Campus Canteen</span>
              </div>
            </div>

            <div className={`status-pill ${isCanteenOpen ? 'status-open' : 'status-closed'}`}>
              <span className="status-dot"></span>
              <span>{isCanteenOpen ? 'Canteen Open' : 'Closed'}</span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="nav-search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search dishes, drinks, stationery... (e.g. Masala Dosa, Biryani)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            <button
              onClick={() => handleNavClick('menu')}
              className={`nav-link-btn ${activeTab === 'menu' ? 'active' : ''}`}
            >
              <Utensils size={18} />
              <span>Menu</span>
            </button>

            <button
              onClick={() => handleNavClick('orders')}
              className={`nav-link-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Clock size={18} />
              <span>My Orders</span>
            </button>

            <button
              onClick={() => handleNavClick('favorites')}
              className={`nav-link-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            >
              <Heart size={18} />
              <span>Favorites</span>
              {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
            </button>

            {/* Kitchen Worker Link (visible if worker or admin) */}
            {(user?.role === 'worker' || user?.role === 'admin') && (
              <button
                onClick={() => handleNavClick('kitchen')}
                className={`nav-link-btn ${activeTab === 'kitchen' ? 'active' : ''}`}
              >
                <ChefHat size={18} />
                <span>Kitchen</span>
              </button>
            )}

            {/* Admin Link (visible if admin) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`nav-link-btn ${activeTab === 'admin' ? 'active' : ''}`}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Action Right: Wallet + Cart + User */}
          <div className="nav-actions-desktop">
            {/* RFID Smart Card Balance */}
            <div className="wallet-card-pill" onClick={() => setIsWalletModalOpen(true)}>
              <div className="wallet-icon-box">
                <CreditCard size={16} />
              </div>
              <div className="wallet-info">
                <span className="wallet-label">RFID Wallet</span>
                <span className="wallet-amount">₹{smartCardBalance.toFixed(2)}</span>
              </div>
              <button className="wallet-add-btn" title="Recharge Balance">
                +
              </button>
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="cart-nav-btn"
              title="Open Food Cart"
            >
              <div className="cart-icon-wrapper">
                <ShoppingBag size={20} />
                {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
              </div>
              <div className="cart-text-details">
                <span className="cart-price">₹{cartSubtotal.toFixed(0)}</span>
              </div>
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="user-dropdown-container">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="user-profile-btn"
                >
                  <div className="avatar-circle">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-name-meta">
                    <span className="user-full-name">{user.full_name || 'Student'}</span>
                    <span className="user-role-tag">{user.role}</span>
                  </div>
                  <ChevronDown size={14} className="dropdown-chevron" />
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.full_name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                      <span className="dropdown-role-chip">{user.role.toUpperCase()}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={() => {
                        setIsWalletModalOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <CreditCard size={16} />
                      <span>Recharge RFID Card (₹{smartCardBalance.toFixed(2)})</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setProfileDropdownOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <Clock size={16} />
                      <span>Order History</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="dropdown-item dropdown-logout"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="login-nav-btn">
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger-btn"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="mobile-search-row">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search food, drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
            </div>

            <div className="mobile-links-list">
              <button
                onClick={() => handleNavClick('menu')}
                className={`mobile-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
              >
                <Utensils size={18} />
                <span>Menu</span>
              </button>
              <button
                onClick={() => handleNavClick('orders')}
                className={`mobile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Clock size={18} />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => handleNavClick('favorites')}
                className={`mobile-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
              >
                <Heart size={18} />
                <span>Favorites ({favorites.length})</span>
              </button>
              {(user?.role === 'worker' || user?.role === 'admin') && (
                <button
                  onClick={() => handleNavClick('kitchen')}
                  className={`mobile-nav-item ${activeTab === 'kitchen' ? 'active' : ''}`}
                >
                  <ChefHat size={18} />
                  <span>Kitchen Console</span>
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                >
                  <Shield size={18} />
                  <span>Admin Dashboard</span>
                </button>
              )}
            </div>

            <div className="mobile-wallet-row">
              <div className="wallet-info">
                <span>RFID Smart Card Balance:</span>
                <strong>₹{smartCardBalance.toFixed(2)}</strong>
              </div>
              <button
                onClick={() => {
                  setIsWalletModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="mobile-recharge-btn"
              >
                + Recharge
              </button>
            </div>

            {user ? (
              <div className="mobile-user-footer">
                <div className="mobile-user-details">
                  <span>Logged in as {user.full_name}</span>
                  <span className="mobile-user-role">({user.role})</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-logout-btn"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="mobile-login-btn"
              >
                <User size={16} /> Sign In
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
