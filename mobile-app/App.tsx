
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

import { FavoritesProvider } from './src/context/FavoritesContext';

import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#FF9933" />
            <RootNavigator />
          </NavigationContainer>
        </FavoritesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
