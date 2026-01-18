import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';

export default function App() {
    useEffect(() => {
        const preventTakingScreenshots = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };
        preventTakingScreenshots();
    }, []);

    return (
        <SafeAreaProvider>
            <RootNavigator />
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );
}
