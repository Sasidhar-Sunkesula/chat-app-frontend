import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';
import { API_URL } from '../constants';
import { AuthContext } from '../contexts/AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
            fetchUserProfile();
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/users/me`);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            logout();
        }
    };

    const login = async (identifier: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/local`, {
                identifier,
                password,
            });
            const { jwt, user } = response.data;
            localStorage.setItem('token', jwt);
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            setUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/local/register`, {
                username,
                email,
                password,
            });
            const { jwt, user } = response.data;
            localStorage.setItem('token', jwt);
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            setUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};