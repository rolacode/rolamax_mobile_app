import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { Client, Account, Models } from 'react-native-appwrite';
import {router} from "expo-router";

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

interface AuthContextType {
    user: Models.User<Models.Preferences> | null | undefined;
    setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null | undefined>>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const userData = await account.get();
                setUser(userData);
            } catch (error) {
                setUser(null); // not logged in
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            router.replace('/login'); // ✅ Navigate to login and prevent back navigation
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
