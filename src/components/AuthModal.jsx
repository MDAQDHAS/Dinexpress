import React, { useState } from 'react';
import { useWebApp } from '../context/WebAppContext';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  ChefHat,
  GraduationCap,
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithEmail, registerWithEmail } = useWebApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [chosenRole, setChosenRole] = useState('student'); // 'student', 'worker', 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    if (mode === 'login') {
      const ok = await loginWithEmail(email, password);
      if (!ok) setErrorMsg('Invalid credentials. Try using one-click demo login below.');
    } else {
      await registerWithEmail(email, password, fullName, chosenRole);
    }
    setLoading(false);
  };

  const fillQuickDemo = (type) => {
    setErrorMsg('');
    if (type === 'admin') {
      setEmail('admin@nandhacen.edu.in');
      setPassword('admin123');
    } else if (type === 'worker') {
      setEmail('staff@gmail.com');
      setPassword('worker123');
    } else {
      setEmail('demo_student@nandhacen.edu.in');
      setPassword('student123');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && setIsAuthModalOpen(false)}>
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {mode === 'login' ? 'Welcome to DineExpress' : 'Create an Account'}
            </h3>
            <p className="modal-subtitle">
              {mode === 'login'
                ? 'Sign in to order canteen meals & manage your RFID card'
                : 'Join campus dining with your student or staff ID'}
            </p>
          </div>
          <button
            onClick={() => !loading && setIsAuthModalOpen(false)}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Recruiter Quick Demo Login Shortcuts */}
        <div className="recruiter-quick-login-card">
          <div className="r-quick-title">
            <Sparkles size={14} color="#FE8C00" />
            <span>Recruiter Quick Fill (1-Click Test Accounts):</span>
          </div>
          <div className="r-quick-buttons">
            <button
              type="button"
              onClick={() => fillQuickDemo('student')}
              className="r-btn r-student"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('worker')}
              className="r-btn r-worker"
            >
              👨‍🍳 Kitchen Staff
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin')}
              className="r-btn r-admin"
            >
              🛡️ Admin Master
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tab-row">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-wrap">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Gokulraj V"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@nandhacen.edu.in or @gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Select Account Role</label>
              <div className="role-selector-grid">
                <button
                  type="button"
                  onClick={() => setChosenRole('student')}
                  className={`role-choice-card ${chosenRole === 'student' ? 'selected' : ''}`}
                >
                  <GraduationCap size={18} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChosenRole('worker')}
                  className={`role-choice-card ${chosenRole === 'worker' ? 'selected' : ''}`}
                >
                  <ChefHat size={18} />
                  <span>Kitchen Staff</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChosenRole('admin')}
                  className={`role-choice-card ${chosenRole === 'admin' ? 'selected' : ''}`}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to DineExpress' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-help">
          <span>Campus Notice: .edu.in emails automatically receive College Portal privileges.</span>
        </div>
      </div>
    </div>
  );
}
