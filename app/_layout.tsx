import "./globals.css";
import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, router, SplashScreen } from "expo-router"; // Import SplashScreen
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Keep the splash screen visible until we've checked the user's authentication state.
SplashScreen.preventAutoHideAsync();

function InitialRouter() {
    const { user, loading } = useAuth(); // Assuming useAuth provides an isLoading state

    useEffect(() => {
        if (!loading) {
            // Hide the splash screen once we've determined the auth state
            SplashScreen.hideAsync();

            if (user === null) {
                router.replace("/login");
            } else {
                router.replace("/"); // Or wherever your authenticated entry point is
            }
        }
    }, [user, loading]);

    // We don't render anything here, the Stack below will handle the initial route
    return null;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <StatusBar hidden />
                <InitialRouter />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" />
                    <Stack.Screen name="signup" />
                    <Stack.Screen name="reset-password" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="movies/[id]" />
                    <Stack.Screen name="history" />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}