import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const getUserFromToken = (token) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { email: payload.sub };
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => getUserFromToken(localStorage.getItem('token')));

    const login = (accessToken) => {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        setUser(getUserFromToken(accessToken));
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);