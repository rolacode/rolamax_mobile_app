import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { Client, Account } from 'react-native-appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

interface AuthContextType {
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(undefined);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const userData = await account.get();
                setUser(userData);
            } catch (error) {
                setUser(null); // user not logged in
            }
        };
        checkUser();
    }, []);

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
