"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/db";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted mock session
    const storedUserId = localStorage.getItem("mockUserId");
    if (storedUserId) {
      db.getUsers().then((users) => {
        const found = users.find((u) => u.id === storedUserId);
        if (found) setUser(found);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await db.login(email);
      setUser(loggedInUser);
      localStorage.setItem("mockUserId", loggedInUser.id);
    } catch (error) {
      throw new Error("User not found");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mockUserId");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
