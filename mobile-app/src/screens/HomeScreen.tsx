import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { Config } from '../constants/Config';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function HomeScreen({ navigation }: any) {
    const [temples, setTemples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]); // Array of IDs

    useEffect(() => {
        fetchTemples();
    }, []);

    // Reload favorites whenever screen is focused
    useFocusEffect(
        useCallback(() => {
            loadFavoriteIds();
        }, [])
    );

    const loadFavoriteIds = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('favoriteTemples');
            const favoriteTemples = jsonValue != null ? JSON.parse(jsonValue) : [];
            setFavorites(favoriteTemples.map((t: any) => t._id || t.id));
        } catch (e) { console.error(e); }
    };

    const toggleFavorite = async (temple: any) => {
        try {
            const jsonValue = await AsyncStorage.getItem('favoriteTemples');
            let favoriteTemples = jsonValue != null ? JSON.parse(jsonValue) : [];
            const templeId = temple._id || temple.id;

            const exists = favoriteTemples.some((t: any) => (t._id || t.id) === templeId);

            if (exists) {
                favoriteTemples = favoriteTemples.filter((t: any) => (t._id || t.id) !== templeId);
            } else {
                favoriteTemples.push(temple);
            }

            await AsyncStorage.setItem('favoriteTemples', JSON.stringify(favoriteTemples));
            // Update local state to reflect UI change instantly
            setFavorites(favoriteTemples.map((t: any) => t._id || t.id));
        } catch (e) {
            console.error("Error toggling favorite", e);
        }
    };

    const fetchTemples = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            console.log('Fetching:', `${Config.API_BASE_URL}/temples`);
            const res = await fetch(`${Config.API_BASE_URL}/temples`);
            if (!res.ok) throw new Error('Server returned ' + res.status);
            const data = await res.json();
            console.log('Data received:', data);
            setTemples(data);
        } catch (error: any) {
            console.error(error);
            setError(error.message || 'Could not connect to server');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        fetchTemples(true);
    }, []);

    const resolveImage = (url: string) => {
        if (!url) return null;
        if (url.includes('localhost')) {
            return url.replace(/http:\/\/localhost:\d+/, Config.IMAGE_BASE_URL);
        }
        if (url.startsWith('http')) return url;
        return `${Config.IMAGE_BASE_URL}${url}`;
    };

    const renderItem = ({ item }: { item: any }) => {
        const isFav = favorites.includes(item._id || item.id);
        return (
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
                    onPress={() => toggleFavorite(item)}
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 6 }}>
                    <Heart color={isFav ? "#ef4444" : "white"} fill={isFav ? "#ef4444" : "transparent"} size={20} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#ea580c" /></View>;
    if (error && !refreshing) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>Connection Failed</Text>
            <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>{error}</Text>
            <TouchableOpacity onPress={() => fetchTemples()} style={{ backgroundColor: '#ea580c', padding: 12, borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry Connection</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF8F0', paddingTop: 50 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ea580c' }}>Jai Shri Krishna 🙏</Text>
                <Text style={{ color: '#666' }}>Live Darshan & Aarti</Text>
            </View>
            <FlatList
                data={temples}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, flexGrow: 1 }}
                keyExtractor={(item: any) => item._id || item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} tintColor="#ea580c" />
                }
                ListEmptyComponent={
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                        <Search size={64} color="#e5e7eb" />
                        <Text style={{ color: '#9ca3af', marginTop: 16, fontSize: 16 }}>No temples found</Text>
                    </View>
                }
            />
        </View>
    );
}
