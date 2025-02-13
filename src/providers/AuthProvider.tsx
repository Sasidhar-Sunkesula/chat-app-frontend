import { User } from '@/types';
import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';
import { STRAPI_URL } from '../constants';
import { AuthContext } from '../contexts/AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (token && !user) { // Only fetch if we have token but no user
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    await fetchUserProfile();
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    logout();
                }
            } else if (user && token) {
                setIsAuthenticated(!!user);
                setUser(user ? JSON.parse(user) : null);
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${STRAPI_URL}/api/users/me`);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data)); // Store user in local storage
        } catch (error) {
            console.error('Error fetching user profile:', error);
            logout();
        }
    };

    const login = async (identifier: string, password: string) => {
        try {
            const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
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
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const response = await axios.post(`${STRAPI_URL}/api/auth/local/register`, {
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
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register }}>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-2xl font-semibold text-gray-800">Loading...</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};