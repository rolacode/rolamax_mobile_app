import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { Client, Account, Models } from 'react-native-appwrite';
import { router } from 'expo-router';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

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
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            } as any);
            formData.append('upload_preset', 'rola-images');

            const res = await fetch('https://api.cloudinary.com/v1_1/dnbpsnmyo/image/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!data.secure_url) throw new Error('Upload failed');

            await account.updatePrefs({ profileImage: data.secure_url });

            const updatedUser = await account.get();
            setUser(updatedUser);
            setProfileImageUrl(data.secure_url);
        } catch (error) {
            console.error('Error uploading image:', error);
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
