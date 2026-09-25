import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { CreatePostModal } from './components/posts/CreatePostModal';

// Page imports
import { Home } from './pages/Home';
import { Feed } from './pages/Feed';
import { Search } from './pages/Search';
import { Communities } from './pages/Communities';
import { Events } from './pages/Events';
import { EventDetails } from './pages/EventDetails';
import { CreateEditEvent } from './pages/CreateEditEvent';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { OrgDashboard } from './pages/OrgDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Leaderboard } from './pages/Leaderboard';
import { CertificatesPage } from './pages/CertificatesPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

const AppLayout = ({ children, onOpenCreatePost }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Determine if full-bleed layout (home, login, register) or app layout with sidebar
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isChatPage = location.pathname === '/chat';
  const isHomePage = location.pathname === '/';

  const showSidebar = !isAuthPage && !isHomePage && !isChatPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenCreatePost={onOpenCreatePost}
        onToggleMobileSidebar={() => setMobileDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-6 items-start">
          {/* Desktop Left Sidebar (on relevant app pages) */}
          {showSidebar && (
            <Sidebar
              onOpenCreatePost={onOpenCreatePost}
              className="hidden lg:block sticky top-20 flex-shrink-0"
            />
          )}

          {/* Primary View */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar & Slide-out Drawer */}
      <MobileNav
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onOpenCreatePost={onOpenCreatePost}
      />

      {/* Footer (hidden on active chat screen for mobile, and hidden entirely for admins) */}
      {!isChatPage && !isAdmin && <Footer />}
    </div>
  );
};

export default function App() {
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 text-xs font-semibold rounded-2xl shadow-xl',
                  style: {
                    borderRadius: '16px',
                    padding: '12px 16px',
                  },
                }}
              />

              <AppLayout onOpenCreatePost={() => setCreatePostModalOpen(true)}>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/verify/:code" element={<CertificatesPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile/:idOrUsername" element={<Profile />} />

                  {/* Protected Volunteer / Community Feed */}
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <Feed onOpenCreatePost={() => setCreatePostModalOpen(true)} />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Chat & Notifications */}
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Certificates Vault */}
                  <Route
                    path="/certificates"
                    element={
                      <ProtectedRoute>
                        <CertificatesPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* User Profile Settings */}
                  <Route
                    path="/settings/profile"
                    element={
                      <ProtectedRoute>
                        <EditProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Organization Dashboard & Event Creation */}
                  <Route
                    path="/org/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['organization', 'admin']}>
                        <OrgDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/org/create-event"
                    element={
                      <ProtectedRoute allowedRoles={['organization', 'admin']}>
                        <CreateEditEvent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/org/events/:id/edit"
                    element={
                      <ProtectedRoute allowedRoles={['organization', 'admin']}>
                        <CreateEditEvent />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Center */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>

              {/* Global Create Post Modal */}
              <CreatePostModal
                isOpen={createPostModalOpen}
                onClose={() => setCreatePostModalOpen(false)}
              />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
