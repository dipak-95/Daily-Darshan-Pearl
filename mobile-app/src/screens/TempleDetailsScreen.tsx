import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import React, { useRef, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Config } from '../constants/Config';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Share2, Clock, MapPin, Video, Image as ImageIcon } from 'lucide-react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

export default function TempleDetailsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { temple } = route.params as any; // Passed from HomeScreen

    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    // Date Logic
    const today = new Date().toISOString().slice(0, 10);
    const dayData = temple.videos?.[today] || {};

    // Configured Types (default to all if missing)
    const activeTypes = temple.activeContentTypes || ['morningDarshan', 'eveningDarshan', 'morningAarti', 'eveningAarti'];

    // Resolve URL helper
    const resolveUrl = (url: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${Config.IMAGE_BASE_URL}${url}`;
    };

    const renderContentBlock = (key: string, label: string, isVideo: boolean) => {
        if (!activeTypes.includes(key)) return null;

        const mediaUrl = resolveUrl(dayData[key]);
        const hasMedia = !!mediaUrl;

        return (
            <View key={key} style={styles.contentCard}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: isVideo ? '#f3e8ff' : '#eff6ff' }]}>
                        {isVideo ? <Video size={20} color="#9333ea" /> : <ImageIcon size={20} color="#2563eb" />}
                    </View>
                    <Text style={styles.cardTitle}>{label}</Text>
                    {!hasMedia && <Text style={styles.pendingBadge}>Pending</Text>}
                </View>

                {hasMedia ? (
                    <View style={styles.mediaContainer}>
                        {isVideo ? (
                            playingVideo === key ? (
                                <ExpoVideo
                                    source={{ uri: mediaUrl }}
                                    style={styles.media}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping
                                    shouldPlay
                                />
                            ) : (
                                <TouchableOpacity onPress={() => setPlayingVideo(key)} style={styles.videoPlaceholder}>
                                    <View style={styles.playButton}>
                                        <Video size={32} color="white" fill="white" />
                                    </View>
                                    <Text style={styles.playText}>Play Video</Text>
                                </TouchableOpacity>
                            )
                        ) : (
                            <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="cover" />
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Clock size={24} color="#9ca3af" />
                        <Text style={styles.emptyText}>Darshan not uploaded yet</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} bounces={false}>
            {/* Header Image */}
            <View style={styles.headerContainer}>
                <Image source={{ uri: resolveUrl(temple.image) }} style={styles.headerImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />

                {/* Navbar */}
                <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}>
                        <Share2 color="white" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Title Info */}
                <View style={styles.titleContainer}>
                    <Text style={styles.templeName}>{temple.name}</Text>
                    {temple.nameHindi && <Text style={styles.templeNameHindi}>{temple.nameHindi}</Text>}
                    <View style={styles.locationRow}>
                        <MapPin color="#fb923c" size={16} />
                        <Text style={styles.locationText}>{temple.location}</Text>
                    </View>
                </View>
            </View>

            {/* Content Body */}
            <View style={styles.body}>
                <Text style={styles.sectionHeader}>Today's Darshan ({new Date().toLocaleDateString()})</Text>

                {renderContentBlock('morningDarshan', 'Morning Darshan', false)}
                {renderContentBlock('eveningDarshan', 'Evening Darshan', false)}
                {renderContentBlock('morningAarti', 'Morning Aarti', true)}
                {renderContentBlock('eveningAarti', 'Evening Aarti', true)}

                <View style={{ height: 40 }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: { height: 300, position: 'relative' },
    headerImage: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 },
    navbar: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    navButton: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },
    titleContainer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
    templeName: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    templeNameHindi: { color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 8 },
    locationRow: { flexDirection: 'row', items: 'center', gap: 6 },
    locationText: { color: '#fb923c', fontSize: 14, fontWeight: 'bold' },

    body: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },

    contentCard: { marginBottom: 24, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    iconBox: { padding: 8, borderRadius: 10, marginRight: 12 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1 },
    pendingBadge: { fontSize: 12, color: '#9ca3af', backgroundColor: '#f3f4f6', paddingHorizontal: 8, py: 2, borderRadius: 6 },

    mediaContainer: { height: 220, backgroundColor: '#000' },
    media: { width: '100%', height: '100%' },
    videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
    playButton: { backgroundColor: '#ea580c', padding: 16, borderRadius: 50, marginBottom: 8 },
    playText: { color: 'white', fontWeight: '500' },

    emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyText: { color: '#9ca3af', fontSize: 14 }
});
