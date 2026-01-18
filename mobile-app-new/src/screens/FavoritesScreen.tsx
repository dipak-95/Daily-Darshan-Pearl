import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Keep this; if it errors, we will fix it. UseFocusEffect is standard.
import { Config } from '../constants/Config';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function FavoritesScreen({ navigation }: any) {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const jsonValue = await AsyncStorage.getItem('favoriteTemples');
            const favoriteTemples = jsonValue != null ? JSON.parse(jsonValue) : [];
            setFavorites(favoriteTemples);
        } catch (e) {
            console.error("Error loading favorites", e);
        } finally {
            setLoading(false);
        }
    };

    const removeFromFavorites = async (templeId: string) => {
        try {
            const newFavorites = favorites.filter((t: any) => t._id !== templeId && t.id !== templeId);
            setFavorites(newFavorites);
            await AsyncStorage.setItem('favoriteTemples', JSON.stringify(newFavorites));
        } catch (e) {
            console.error("Error removing favorite", e);
        }
    };

    const resolveImage = (url: string) => {
        if (!url) return null;
        if (url.includes('localhost')) {
            return url.replace(/http:\/\/localhost:\d+/, Config.IMAGE_BASE_URL);
        }
        if (url.startsWith('http')) return url;
        return `${Config.IMAGE_BASE_URL}${url}`;
    };


    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('TempleDetails', { temple: item })}
            style={{
                width: ITEM_WIDTH,
                height: 200,
                margin: 8,
                borderRadius: 16,
                backgroundColor: 'white',
                elevation: 4,
                overflow: 'hidden'
            }}
        >
            <Image
                source={{ uri: resolveImage(item.image) }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 40 }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: '#ffbd7a', fontSize: 12 }}>{item.location}</Text>
            </LinearGradient>
            <TouchableOpacity
                onPress={() => removeFromFavorites(item._id || item.id)}
                style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 6 }}>
                <Heart color="#ef4444" fill="#ef4444" size={20} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#ea580c" /></View>;

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF8F0', paddingTop: 50 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ea580c' }}>My Favorites ❤️</Text>
                <Text style={{ color: '#666' }}>Your saved temples</Text>
            </View>

            {favorites.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
                    <Heart size={64} color="#ccc" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>No favorites yet</Text>
                    <Text style={{ fontSize: 14, color: '#999' }}>Tap the heart on any temple to save it</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    keyExtractor={(item: any) => item._id || item.id}
                />
            )}
        </View>
    );
}
