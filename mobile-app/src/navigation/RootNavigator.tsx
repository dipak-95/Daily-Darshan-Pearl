
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import TempleDetailsScreen from '../screens/TempleDetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PanchangScreen from '../screens/PanchangScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SettingsDetailScreen from '../screens/SettingsDetailScreen';
import { Home, Calendar, Settings, Heart } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Placeholder() { return <></>; }

function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#ea580c',
            tabBarStyle: { height: 60, paddingBottom: 10 }
        }}>
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ tabBarIcon: ({ color }) => <Heart color={color} size={24} /> }}
            />
            <Tab.Screen
                name="Panchang"
                component={PanchangScreen}
                options={{ tabBarIcon: ({ color }) => <Calendar color={color} size={24} /> }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ tabBarIcon: ({ color }) => <Settings color={color} size={24} /> }}
            />
        </Tab.Navigator>
    );
}


export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="TempleDetails" component={TempleDetailsScreen} />
                <Stack.Screen
                    name="SettingsDetail"
                    component={SettingsDetailScreen}
                    options={{ presentation: 'card', headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
