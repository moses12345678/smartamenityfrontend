import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearTokens, getTokens, setTokens } from '../api/client.js';
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
  const [tokens, setTokenState] = useState(() => getTokens());
  const [user, setUserState] = useState(() => loadJson('managerUser'));
  const [userLoading, setUserLoading] = useState(false);

  const saveTokens = (access, refresh) => {
    setTokens(access, refresh);
    setTokenState({ access, refresh });
  };

  const saveUser = (data) => {
    setUserState(data || null);
    if (typeof localStorage !== 'undefined') {
      if (data) localStorage.setItem('managerUser', JSON.stringify(data));
      else localStorage.removeItem('managerUser');
    }
  };

  const logout = () => {
    clearTokens();
    setTokenState({ access: null, refresh: null });
    saveUser(null);
  };

  // Keep user hydrated when tokens are present (e.g., after refresh)
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
      userLoading,
      saveTokens,
      setUser: saveUser,
      saveUser,
      logout
    }),
    [tokens, user, userLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
