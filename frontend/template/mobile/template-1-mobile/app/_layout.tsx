import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'reflect-metadata';


import AuthLoadingContainer from '@/components/common/containers/AuthLoadingContainer';
import AuthLoginContainer from '@/components/common/containers/AuthLoginContainer';
import "@/global.css";


function RootNavigator() {
    const { user, loading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!user || loading) return;

    }, [user, loading]);

    if (loading) {
        return (
            <AuthLoadingContainer />
        );
    }

    if (!user) {
        return <AuthLoginContainer />;
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }} initialRouteName='(tabs)'>
                <Stack.Screen name="(tabs)" />
                {/* <Stack.Screen name="page" /> */}
                {/* <Stack.Screen name="page" /> */}
                <Stack.Screen name="setting" />
                <Stack.Screen name="+not-found" />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    useFrameworkReady();
    const [dbReady, setDbReady] = useState(true);

    useEffect(() => {
        const initDatabase = async () => {
            try {

                setDbReady(true);
            } catch (error) {
                console.error('Failed to initialize database:', error);
                setDbReady(true);
            }
        };

        initDatabase();
    }, []);

    if (!dbReady) {
        return <AuthLoadingContainer />;
    }

    return (
        <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
        </AuthProvider>
    );
}
