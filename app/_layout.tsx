import "./globals.css";
import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, router } from "expo-router";

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
        <AuthProvider>
            <StatusBar hidden />
            <RedirectHandler />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="movies/[id]" />
            </Stack>
        </AuthProvider>
    );
}
