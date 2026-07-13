import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem("auth_user"));

    const login = (username) => {
        setUser(username);
        localStorage.setItem("auth_user", username);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
