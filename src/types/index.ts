export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
}

export interface ChatSession {
    id: number;
    time: string;
    messages: { user: string | 'server'; message: string; time: string }[];
};