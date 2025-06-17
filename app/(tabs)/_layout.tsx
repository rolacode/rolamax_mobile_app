import React from 'react';
import { ImageBackground, Image, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import { AuthProvider } from '@/context/AuthContext';

const TabIcon = ({ focused, icon, title }: any) => {
    return focused ? (
        <ImageBackground
            source={images.highlight}
            className="flex-row min-w-[112px] min-h-16 mt-2 justify-center items-center rounded-full overflow-hidden px-4"
            imageStyle={{ borderRadius: 9999 }}
        >
            <Image source={icon} className="w-5 h-5" style={{ tintColor: '#151312' }} />
            <Text className="text-secondary text-base font-semibold ml-2">{title}</Text>
        </ImageBackground>
    ) : (
        <View className="justify-center items-center mt-4 rounded-full">
            <Image source={icon} className="w-5 h-5" style={{ tintColor: '#A8B5DB' }} />
        </View>
    );
};

const _Layout = () => {
    return (
        <AuthProvider>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        backgroundColor: '#0f0D23',
                        borderRadius: 50,
                        marginHorizontal: 20,
                        marginBottom: 36,
                        height: 52,
                        position: 'absolute',
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#0f0d23',
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.home} title="Home" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.person} title="Profile" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="saved"
                    options={{
                        title: 'Saved',
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.save} title="Saved" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Search',
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.search} title="Search" />
                        ),
                    }}
                />
            </Tabs>
        </AuthProvider>
    );
};

export default _Layout;
