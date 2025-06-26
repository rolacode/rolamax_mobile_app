import "./globals.css";
import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function RedirectHandler() {
    const { user } = useAuth();

    useEffect(() => {
        if (user === null) {
            router.replace("/login");
        }
    }, [user]);

    return null;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <StatusBar hidden />
                <RedirectHandler />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" />
                    <Stack.Screen name="signup" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="movies/[id]" />
                    <Stack.Screen name="history" />
                    <Stack.Screen name="reset-password" />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
