// app/_layout.tsx
import "./globals.css";
import { StatusBar } from "react-native";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar hidden />
            <Stack screenOptions={{ headerShown: false }}>
                {/* Declare ALL screens here; actual redirects happen in pages */}
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="movies/[id]" />
            </Stack>
        </AuthProvider>
    );
}
