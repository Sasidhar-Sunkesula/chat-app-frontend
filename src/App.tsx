import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import Chat from './pages/Chat';
import { AuthProvider } from './providers/AuthProvider';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen">
                    <Routes>
                        <Route path="/login" element={<AuthForm mode="login" />} />
                        <Route path="/register" element={<AuthForm mode="register" />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Chat />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}