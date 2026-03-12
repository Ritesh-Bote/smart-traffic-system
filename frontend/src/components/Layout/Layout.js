/**
 * Layout.js
 *
 * The main layout wrapper for all protected pages.
 * Contains the Sidebar (navigation) + Topbar (header) + content area.
 *
 * The <Outlet /> is where child routes render their content.
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiList, FiPlusCircle, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { MdOutlineDirectionsCar } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Get initials from user name (e.g., "John Doe" → "JD")
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  // Get the page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/violations') return 'Violations';
    if (path === '/violations/add') return 'Add Violation';
    if (path.includes('/violations/edit')) return 'Edit Violation';
    return 'Traffic Portal';
  };

  const navItems = [
    { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/violations', icon: <FiList />, label: 'All Violations' },
    { to: '/violations/add', icon: <FiPlusCircle />, label: 'Add Violation' },
  ];

  return (
    <div className="main-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🚦</div>
          <div className="logo-text">
            Traffic Portal
            <span>Violation Management</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: 16 }}>Quick Actions</div>
          <button
            className="nav-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => { navigate('/'); setSidebarOpen(false); }}
          >
            <span className="nav-icon"><MdOutlineDirectionsCar /></span>
            Citizen Portal
          </button>
        </nav>

        {/* User info & logout */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="content-area">
        {/* Top bar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <h1 className="topbar-title">{getPageTitle()}</h1>
          </div>

          <div className="topbar-right">
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Badge: <strong>{user?.badgeNumber || 'N/A'}</strong>
            </span>
            <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet /> {/* Child route renders here */}
        </main>
      </div>

      {/* Mobile menu button via CSS */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
