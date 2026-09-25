import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cs_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cs_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Auth Init Error]', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        const { user: userData, accessToken, refreshToken } = res.data;
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('cs_token', accessToken);
        if (refreshToken) localStorage.setItem('cs_refresh_token', refreshToken);
        localStorage.setItem('cs_user', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      if (res.success && res.data) {
        const { user: userData, accessToken, refreshToken } = res.data;
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('cs_token', accessToken);
        if (refreshToken) localStorage.setItem('cs_refresh_token', refreshToken);
        localStorage.setItem('cs_user', JSON.stringify(userData));
        toast.success('Account created successfully! Welcome to ConnectServe.');
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_refresh_token');
    localStorage.removeItem('cs_user');
  };

  const updateLocalUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('cs_user', JSON.stringify(merged));
      return merged;
    });
  };

  // Quick Demo Login Switcher (super handy for pair programming / demo testing)
  const loginAsDemo = async (type = 'volunteer') => {
    let email = 'alex@volunteer.org';
    if (type === 'ngo' || type === 'organization') email = 'contact@greenearth.ngo';
    if (type === 'admin') email = 'admin@connectserve.org';

    return login({ email, password: 'password123' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isOrganization: user?.role === 'organization',
        isVolunteer: user?.role === 'user',
        login,
        register,
        logout,
        updateLocalUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
