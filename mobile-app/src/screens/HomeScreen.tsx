
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Config } from '../constants/Config';
import { Temple } from '../types';
import { Heart } from 'lucide-react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveImageUrl } from '../utils/helpers';

const { width } = Dimensions.get('window');
const COLUMN_count = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_count;

const ImageWithSkeleton = ({ uri, style }: { uri: string | null, style: any }) => {
    const [loading, setLoading] = useState(true);
    if (!uri) return <View style={[style, { backgroundColor: '#e1e1e1' }]} />;

    return (
        <View style={[style, { overflow: 'hidden', backgroundColor: '#f0f0f0' }]}>
            {loading && (
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                    <ActivityIndicator color={Colors.primary} size="small" />
                </View>
            )}
            <Image
                source={{ uri: uri }}
                style={style}
                resizeMode="cover"
                onLoadEnd={() => setLoading(false)}
            />
        </View>
    );
};

export default function HomeScreen() {
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<any>();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { t, language } = useLanguage();

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            const res = await fetch(`${Config.API_BASE_URL}/temples`);
            const data = await res.json();
            setTemples(data);
        } catch (error) {
            console.error('Failed to fetch temples', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTemples();
    };

    const renderItem = ({ item }: { item: Temple }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Home', { screen: 'TempleDetails', params: { temple: item } })}
            style={styles.cardContainer}
        >
            <View style={styles.card}>
                <ImageWithSkeleton uri={resolveImageUrl(item.image)} style={styles.image} />

                <TouchableOpacity
                    style={styles.favButton}
                    onPress={() => toggleFavorite(item.id)}
                >
                    <Heart
                        size={20}
                        color={isFavorite(item.id) ? Colors.primary : 'white'}
                        fill={isFavorite(item.id) ? Colors.primary : 'rgba(0,0,0,0.3)'}
                    />
                </TouchableOpacity>

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    <Text style={styles.name} numberOfLines={1}>
                        {(language === 'hi' && item.nameHindi) ? item.nameHindi : item.name}
                    </Text>
                    <Text style={styles.location} numberOfLines={1}>📍 {(language === 'hi' && item.locationHindi) ? item.locationHindi : item.location}</Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>{t('home')}...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>{t('greeting')}</Text>
                <Text style={styles.subtitle}>{t('subtitle')}</Text>
            </View>

            <FlatList
                data={temples}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={COLUMN_count}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No temples found. Check connection.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: 50,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primaryDark,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.secondary,
        marginTop: 4,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    cardContainer: {
        flex: 1,
        margin: 8,
        maxWidth: ITEM_WIDTH,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.surface,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        height: 200,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 6,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        paddingTop: 40,
    },
    name: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    location: {
        color: Colors.primaryLight,
        fontSize: 12,
        marginTop: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: Colors.secondary,
        fontSize: 16,
    },
    emptyText: {
        color: Colors.secondary,
        fontSize: 16,
        marginTop: 40,
    },
});
