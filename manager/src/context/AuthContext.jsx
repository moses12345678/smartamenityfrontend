import { createContext, useContext, useMemo, useState } from 'react';
import { clearTokens, getTokens, setTokens } from '../api/client.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tokens, setTokenState] = useState(() => getTokens());
  const [user, setUser] = useState(null);

  const saveTokens = (access, refresh) => {
    setTokens(access, refresh);
    setTokenState({ access, refresh });
  };

  const logout = () => {
    clearTokens();
    setTokenState({ access: null, refresh: null });
    setUser(null);
  };

  const value = useMemo(
    () => ({
      tokens,
      user,
      saveTokens,
      setUser,
      logout
    }),
    [tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
