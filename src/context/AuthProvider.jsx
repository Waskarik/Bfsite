import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import AuthContext from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("badfish_token");

    function clearSession() {
      localStorage.removeItem("badfish_token");
      if (active) setUser(null);
    }

    window.addEventListener("badfish:unauthorized", clearSession);

    if (!token) {
      setLoading(false);
      return () => {
        active = false;
        window.removeEventListener("badfish:unauthorized", clearSession);
      };
    }

    apiRequest("/auth/verify")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(clearSession)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener("badfish:unauthorized", clearSession);
    };
  }, []);

  async function login(email, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("badfish_token", data.token);
    setUser(data.user);
  }

  async function register(username, email, password) {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    localStorage.setItem("badfish_token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("badfish_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
