// src/context/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

interface UserData {
    _id: string;
    email: string;
    name?: string;
    image?: string;
}

interface ClickDoc {
    _id: string;
    user: string;
    movie_id: number;
    title: string;
    timestamp: string;
    poster_url?: string;
}

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    logout: () => Promise<void>;
    loading: boolean;
    userClicks: ClickDoc[];
    setUserClicks: React.Dispatch<React.SetStateAction<ClickDoc[]>>;
    profileImageUrl: string | null; // ✅ Required in type
    setProfileImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
    updateProfileImage: (uri: string) => Promise<void>;
}

const BACKEND_URL = 'http://192.168.132.114:5000/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userClicks, setUserClicks] = useState<ClickDoc[]>([]);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null); // ✅ Add this back

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');

                if (storedToken) {
                    const response = await fetch(`${BACKEND_URL}/user/me`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        const currentUserData: UserData = userData.user || userData;

                        if (!currentUserData._id && (currentUserData as any).id) {
                            currentUserData._id = (currentUserData as any).id;
                        }

                        setUser(currentUserData);
                        setToken(storedToken);
                        setProfileImageUrl(currentUserData.image || null); // ✅ Set image
                    } else {
                        await AsyncStorage.removeItem('userToken');
                        setUser(null);
                        setToken(null);
                        setProfileImageUrl(null);
                        console.warn('Invalid or expired token, clearing session.');
                    }
                } else {
                    setUser(null);
                    setToken(null);
                    setProfileImageUrl(null);
                }
            } catch (error) {
                console.error('Error checking user session:', error);
                setUser(null);
                setToken(null);
                setProfileImageUrl(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserSession();
    }, []);

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setUser(null);
            setToken(null);
            setProfileImageUrl(null); // ✅ Clear image
            router.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Logout Failed', 'Could not log out. Please try again.');
        }
    };

    const updateProfileImage = async (uri: string) => {
        if (!user || !user._id || !token) {
            Alert.alert('Error', 'You must be logged in to update profile image.');
            return;
        }

        if (!uri) {
            Alert.alert('Error', 'No image selected.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            } as any);
            formData.append('upload_preset', 'rola-images');

            const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dnbpsnmyo/image/upload', {
                method: 'POST',
                body: formData,
            });

            const cloudinaryData = await cloudinaryRes.json();

            if (!cloudinaryData.secure_url) {
                throw new Error('Cloudinary upload failed: ' + (cloudinaryData.error?.message || 'Unknown error'));
            }

            const imageUrl = cloudinaryData.secure_url;

            const backendRes = await fetch(`${BACKEND_URL}/user/profile-image`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ image: imageUrl }),
            });

            const backendData = await backendRes.json();

            if (backendRes.ok) {
                setUser(prevUser => (prevUser ? { ...prevUser, image: imageUrl } : null));
                setProfileImageUrl(imageUrl); // ✅ Set in context
                Alert.alert('✅ Success', backendData.message || 'Profile image updated.');
            } else {
                throw new Error(backendData.message || 'Failed to update profile image on backend.');
            }
        } catch (error: any) {
            console.error('Error updating profile image:', error);
            Alert.alert('Error', error.message || 'Could not update profile image.');
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                setUser,
                setToken,
                logout,
                loading,
                userClicks,
                setUserClicks,
                profileImageUrl, // ✅ Include this
                setProfileImageUrl,
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
