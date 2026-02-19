import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getAccessToken, setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!user;

    // Check for existing session on mount
    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            api.get("/users/me")
                .then((res) => setUser(res.data))
                .catch(() => {
                    setAccessToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post("/users/login", { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const register = useCallback(async (formData) => {
        const res = await api.post("/users/register", formData);
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/users/logout");
        } catch {
            // ignore
        }
        setAccessToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((userData) => {
        setUser((prev) => ({ ...prev, ...userData }));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
