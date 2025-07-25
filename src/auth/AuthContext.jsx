import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tokenCheckInterval;
    let autoLogoutTimeout;
    let unsubscribeAuth;

    const logout = async () => {
      console.log("Logging out...");
      await signOut(auth);
      setUser(null);
      setJwt(null);
      localStorage.removeItem("jwtToken");
    };

    const validateJWT = (token) => {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now();
        const exp = decoded.exp * 1000;

        if (exp > now) {
          return { decoded, exp };
        }
      } catch (err) {
        console.error("JWT validation failed:", err);
      }
      return null;
    };

    const checkStoredJWT = () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        logout();
        return;
      }

      const valid = validateJWT(token);
      if (!valid) {
        logout();
      } else {
        setJwt(token);

        // Auto logout 5s before expiration
        const timeUntilLogout = valid.exp - Date.now() - 5000;
        if (timeUntilLogout > 0) {
          if (autoLogoutTimeout) clearTimeout(autoLogoutTimeout);
          autoLogoutTimeout = setTimeout(logout, timeUntilLogout);
        } else {
          logout();
        }
      }
    };

    // Firebase Auth state change handler
    unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);

      if (firebaseUser) {
        // ✅ Wait for backend to issue & save jwtToken (~0.5s delay)
        setTimeout(() => {
          checkStoredJWT();
          setLoading(false);
        }, 500); // You can adjust this to 800–1000ms if needed
      } else {
        logout();
        setLoading(false);
      }
    });

    // Manual checks on load or storage changes
    const onStorageChange = () => checkStoredJWT();

    // Initial load check
    checkStoredJWT();

    // Watch for JWT deletion/expiration
    window.addEventListener("storage", onStorageChange);
    tokenCheckInterval = setInterval(checkStoredJWT, 5000);

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (tokenCheckInterval) clearInterval(tokenCheckInterval);
      if (autoLogoutTimeout) clearTimeout(autoLogoutTimeout);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, jwt, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
