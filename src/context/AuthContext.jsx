import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearTokens, getTokens, setTokens as persistTokens } from '../api/client.js';

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

  const value = useMemo(
    () => ({
      tokens,
      user,
      joinedProperty,
      pendingInvite,
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
