import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  role: string;
  org_id: string | null;
  organization_name?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeOrganizationId: string | null;
  login: (token: string) => void;
  logout: () => void;
  setContextOrganization: (orgId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(localStorage.getItem('activeOrganizationId'));

  const setActiveOrganizationId = (orgId: string | null) => {
    if (orgId) {
      localStorage.setItem('activeOrganizationId', orgId);
    } else {
      localStorage.removeItem('activeOrganizationId');
    }
    setActiveOrganizationIdState(orgId);
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        let userData: User = {
          id: decoded.sub,
          role: decoded.role,
          org_id: decoded.org_id
        };
        setUser(userData);
        
        // If not super admin impersonating, set the active org to the user's org
        if (userData.role !== 'SUPER_ADMIN' || !activeOrganizationId) {
          setActiveOrganizationId(userData.org_id);
        }

        // Fetch full profile to get organization_name without requiring re-login
        const fetchMe = async () => {
          try {
            const BASE = (import.meta as any).env.VITE_API_URL || "http://localhost:8001";
            const res = await fetch(`${BASE}/api/auth/me`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              const fullUser = await res.json();
              if (fullUser.organization_name) {
                setUser(prev => prev ? { ...prev, organization_name: fullUser.organization_name } : prev);
              }
            }
          } catch (err) {
            console.error("Failed to fetch user profile", err);
          }
        };
        fetchMe();
      } catch (e) {
        logout();
      }
    } else {
      setUser(null);
      setActiveOrganizationId(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeOrganizationId');
    setToken(null);
    setUser(null);
    setActiveOrganizationId(null);
  };

  const setContextOrganization = (orgId: string | null) => {
    if (user?.role === 'SUPER_ADMIN') {
      setActiveOrganizationId(orgId);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, activeOrganizationId, login, logout, setContextOrganization }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
