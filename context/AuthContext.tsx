import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { Client, Account, Models, Storage, ID } from 'react-native-appwrite';
import { router } from 'expo-router';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const storage = new Storage(client);

const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

interface ClickDoc extends Models.Document {
    title: string;
    user_id: string;
    movie_id: number;
    timestamp: string;
    poster_url?: string;
}

interface AuthContextType {
    user: Models.User<Models.Preferences> | null | undefined;
    setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null | undefined>>;
    logout: () => Promise<void>;
    loading: boolean;
    userClicks: ClickDoc[];
    setUserClicks: React.Dispatch<React.SetStateAction<ClickDoc[]>>;
    profileImageUrl: string | null;
    updateProfileImage: (uri: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [userClicks, setUserClicks] = useState<ClickDoc[]>([]);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const userData = await account.get();
                setUser(userData);
                setProfileImageUrl(userData.prefs?.profileImage || null);
            } catch {
                setUser(null);
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
            router.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateProfileImage = async (uri: string) => {
        try {
            const res = await fetch(uri);
            const blob = await res.blob();

            const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), blob as any);

            const fileUrl = storage.getFileView(BUCKET_ID, uploaded.$id).toString();

            await account.updatePrefs({ profileImage: fileUrl });

            const updatedUser = await account.get();
            setUser(updatedUser);
            setProfileImageUrl(fileUrl);
        } catch (error) {
            console.error('Error updating profile image:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                logout,
                loading,
                userClicks,
                setUserClicks,
                profileImageUrl,
                updateProfileImage,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
