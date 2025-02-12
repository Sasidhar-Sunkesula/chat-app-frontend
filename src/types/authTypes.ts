export interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
}