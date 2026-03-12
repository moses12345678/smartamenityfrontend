import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearTokens, getTokens, setTokens as persistTokens } from '../api/client.js';
import { fetchCurrentUser } from '../api/users.js';

const AuthContext = createContext();

const loadJson = (key) => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => getTokens());
  const [user, setUserState] = useState(() => loadJson('authUser'));
  const [userLoading, setUserLoading] = useState(false);
  const [joinedProperty, setJoinedPropertyState] = useState(() => loadJson('currentProperty'));
  const [pendingInvite, setPendingInviteState] = useState(
    () => (typeof localStorage !== 'undefined' ? localStorage.getItem('inviteToken') : '') || ''
  );

  const saveTokens = useCallback((access, refresh) => {
    persistTokens(access, refresh);
    setTokens({ access, refresh });
  }, []);

  const saveUser = useCallback((data) => {
    setUserState(data || null);
    if (typeof localStorage !== 'undefined') {
      if (data) {
        localStorage.setItem('authUser', JSON.stringify(data));
      } else {
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const savePendingInvite = useCallback((token) => {
    setPendingInviteState(token || '');
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('inviteToken', token);
      else localStorage.removeItem('inviteToken');
    }
  }, []);

  const saveJoinedProperty = useCallback((property) => {
    setJoinedPropertyState(property || null);
    if (typeof localStorage !== 'undefined') {
      if (property) localStorage.setItem('currentProperty', JSON.stringify(property));
      else localStorage.removeItem('currentProperty');
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setTokens({ access: null, refresh: null });
    saveUser(null);
    saveJoinedProperty(null);
  }, [saveJoinedProperty, saveUser]);

  // Ensure we have a fresh user object when tokens are present (e.g., after refresh)
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (!tokens?.access || user || userLoading) return;
      setUserLoading(true);
      try {
        const me = await fetchCurrentUser();
        if (!cancelled) saveUser(me);
      } catch (e) {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [tokens?.access, user, userLoading, saveUser, logout]);

  const value = useMemo(
    () => ({
      tokens,
      user,
      joinedProperty,
      pendingInvite,
      userLoading,
      saveTokens,
      saveUser,
      savePendingInvite,
      saveJoinedProperty,
      logout
    }),
    [tokens, user, joinedProperty, pendingInvite]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
