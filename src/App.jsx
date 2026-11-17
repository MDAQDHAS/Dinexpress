import React from 'react';
import { WebAppProvider, useWebApp } from './context/WebAppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import OrderTracking from './components/OrderTracking';
import KitchenConsole from './components/KitchenConsole';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import PaymentModal from './components/PaymentModal';
import WalletModal from './components/WalletModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

function MainContent() {
  const { activeTab } = useWebApp();

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content-area">
        {activeTab === 'menu' && (
          <>
            <Hero />
            <MenuSection />
          </>
        )}

        {activeTab === 'favorites' && <MenuSection />}

        {activeTab === 'orders' && <OrderTracking />}

        {activeTab === 'kitchen' && <KitchenConsole />}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      <CartDrawer />
      <PaymentModal />
      <WalletModal />
      <AuthModal />
      <Toast />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <WebAppProvider>
      <MainContent />
    </WebAppProvider>
  );
}
