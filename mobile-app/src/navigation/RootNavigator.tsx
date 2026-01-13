
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Heart, Calendar, Settings } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import TempleDetailsScreen from '../screens/TempleDetailsScreen';
import { FavoritesScreen, SettingsScreen } from '../screens/PlaceholderScreens';
import PanchangScreen from '../screens/PanchangScreen';
import { useLanguage } from '../context/LanguageContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                headerTintColor: Colors.white,
                headerTitleStyle: { fontWeight: 'bold' },
                contentStyle: { backgroundColor: Colors.background },
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TempleDetails"
                component={TempleDetailsScreen}
                options={{ title: 'Temple Details', headerBackTitleVisible: false }}
            />
        </Stack.Navigator>
    );
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ... (imports)

export default function RootNavigator() {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage(); // Import hook

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let Icon;
                    if (route.name === 'Home') Icon = Home;
                    else if (route.name === 'Favorites') Icon = Heart;
                    else if (route.name === 'Details') Icon = Calendar;
                    else if (route.name === 'Settings') Icon = Settings;
                    return Icon ? <Icon size={size} color={color} /> : null;
                },
                tabBarLabel: t(route.name.toLowerCase() === 'details' ? 'panchang' : route.name.toLowerCase()),
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.secondary,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.primary,
                    borderTopWidth: 1,
                    height: 60 + (insets.bottom > 0 ? insets.bottom : 10), // Dynamic Height
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,   // Dynamic Padding
                    paddingTop: 8,
                },
                headerStyle: { backgroundColor: Colors.primary },
                headerTintColor: Colors.white,
                headerTitle: t(route.name.toLowerCase() === 'details' ? 'panchang' : route.name.toLowerCase()),
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false, tabBarLabel: t('home') }} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: t('favorites'), headerTitle: t('favorites') }} />
            <Tab.Screen name="Details" component={PanchangScreen} options={{ tabBarLabel: t('panchang'), headerTitle: t('panchang') }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('settings'), headerTitle: t('settings') }} />
        </Tab.Navigator>
    );
}
