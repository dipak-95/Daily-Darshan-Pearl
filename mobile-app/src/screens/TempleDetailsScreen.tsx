import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet, Alert, Platform, Modal, StatusBar } from 'react-native';
import React, { useRef, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Config } from '../constants/Config';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Share2, Clock, MapPin, Video, Image as ImageIcon, Download, X, Play } from 'lucide-react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import * as Sharing from 'expo-sharing';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

export default function TempleDetailsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { temple } = route.params as any;

    const [modalVisible, setModalVisible] = useState(false);
    const [activeMedia, setActiveMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    // Date Logic
    const today = new Date().toISOString().split('T')[0];

    // Get today's darshan - Support BOTH legacy 'videos' object and new 'darshan' array
    let dayData = {};
    if (temple.videos && temple.videos[today]) {
        dayData = temple.videos[today];
    } else if (temple.darshan && Array.isArray(temple.darshan)) {
        dayData = temple.darshan.find((d: any) => d.date.startsWith(today)) || {};
    }

    // Configured Types - Restore original fallback
    const activeTypes = temple.activeContentTypes || [
        'morningDarshan', 'eveningDarshan', 'morningAarti', 'eveningAarti',
        'mangla', 'shringar', 'rajbhog', 'sandhya', 'shayan' // Add new keys just in case
    ];

    // Resolve URL helper
    const resolveUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('localhost')) {
            return url.replace(/http:\/\/localhost:\d+/, Config.IMAGE_BASE_URL);
        }
        if (url.startsWith('http')) return url;
        return `${Config.IMAGE_BASE_URL}${url}`;
    };

    const handleShare = async (url: string | null) => {
        if (!url) {
            Alert.alert("Error", "No media URL found");
            return;
        }
        try {
            const rawFilename = url.split('/').pop() || 'share.jpg';
            const filename = rawFilename.split('?')[0];
            const fileUri = FileSystem.cacheDirectory + filename;

            // Alert.alert("Wait", "Preparing...");
            await FileSystem.downloadAsync(url, fileUri);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing not available");
                return;
            }

            await Sharing.shareAsync(fileUri);
        } catch (error: any) {
            Alert.alert('Error sharing', error.message);
        }
    };

    const handleDownload = async (url: string | null) => {
        if (!url) {
            Alert.alert("Error", "No media URL found");
            return;
        }
        try {
            // Check permissions - Skip explicit request to avoid Audio permission error on Expo Go
            // const { status } = await MediaLibrary.requestPermissionsAsync();
            // if (status !== 'granted') {
            //     Alert.alert('Permission needed', 'Please allow storage permission to download.');
            //     return;
            // }

            const rawFilename = url.split('/').pop() || 'download.jpg';
            const filename = rawFilename.split('?')[0];

            // Use cache directory for temp file
            const fileUri = FileSystem.cacheDirectory + filename;

            // Download
            await FileSystem.downloadAsync(url, fileUri);

            // Save to Library
            const asset = await MediaLibrary.createAssetAsync(fileUri);

            // Try to organize into Album (Optional step)
            try {
                await MediaLibrary.createAlbumAsync("Daily Darshan", asset, false);
                Alert.alert('Success', 'Saved to "Daily Darshan" album! 📸');
            } catch (e) {
                // If album creation fails, asset is still saved
                Alert.alert('Success', 'Image saved to Photos! 📸');
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Download failed', error.message);
        }
    };

    const openMedia = (url: string, type: 'image' | 'video') => {
        setActiveMedia({ url, type });
        setModalVisible(true);
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
                    <TouchableOpacity activeOpacity={0.9} onPress={() => openMedia(mediaUrl, isVideo ? 'video' : 'image')}>
                        <View style={styles.mediaContainer}>
                            {isVideo ? (
                                <View style={styles.videoPlaceholder}>
                                    <View style={styles.playButton}>
                                        <Play size={32} color="white" fill="white" />
                                    </View>
                                    <Text style={styles.playText}>Tap to Watch</Text>
                                    <View style={styles.overlayIcon}>
                                        <Text style={{ color: 'white', fontSize: 10 }}>Full Screen</Text>
                                    </View>
                                </View>
                            ) : (
                                <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="cover" />
                            )}
                        </View>
                        {/* Hint Text */}
                        <View style={styles.tapToViewBar}>
                            <Text style={styles.tapText}>Tap to View Full Screen & Share</Text>
                        </View>
                    </TouchableOpacity>
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
        <View style={{ flex: 1 }}>
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
                <View style={{ height: 40 }} />
            </ScrollView >
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <StatusBar hidden />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                        <X size={32} color="white" />
                    </TouchableOpacity>

                    <View style={styles.modalContent}>
                        {activeMedia?.type === 'video' ? (
                            <ExpoVideo
                                source={{ uri: activeMedia.url }}
                                style={{ width: width, height: height * 0.6 }}
                                useNativeControls={true}
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
                                shouldPlay
                            />
                        ) : (
                            <Image
                                source={{ uri: activeMedia?.url }}
                                style={{ width: width, height: height * 0.7 }}
                                resizeMode="contain"
                            />
                        )}
                    </View>

                    <View style={styles.modalActionBar}>
                        <TouchableOpacity onPress={() => handleShare(activeMedia?.url || null)} style={styles.modalActionButton}>
                            <View style={styles.modalActionIcon}>
                                <Share2 size={24} color="black" />
                            </View>
                            <Text style={styles.modalActionText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDownload(activeMedia?.url || null)} style={styles.modalActionButton}>
                            <View style={[styles.modalActionIcon, { backgroundColor: '#ea580c' }]}>
                                <Download size={24} color="white" />
                            </View>
                            <Text style={styles.modalActionText}>Download</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View >
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
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { color: '#fb923c', fontSize: 14, fontWeight: 'bold' },

    body: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },

    contentCard: { marginBottom: 24, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    iconBox: { padding: 8, borderRadius: 10, marginRight: 12 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1 },
    pendingBadge: { fontSize: 12, color: '#9ca3af', backgroundColor: '#f3f4f6', paddingHorizontal: 8, py: 2, borderRadius: 6 },

    mediaContainer: { height: 220, backgroundColor: '#f3f4f6' },
    media: { width: '100%', height: '100%' },
    videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
    playButton: { backgroundColor: '#ea580c', padding: 16, borderRadius: 50, marginBottom: 8 },
    playText: { color: 'white', fontWeight: '500' },

    emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyText: { color: '#9ca3af', fontSize: 14 },

    // Action Row Styles
    tapToViewBar: { backgroundColor: '#f9fafb', padding: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    tapText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
    overlayIcon: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 4 },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'space-between', paddingBottom: 40 },
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 50, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalActionBar: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
    modalActionButton: { alignItems: 'center', gap: 8 },
    modalActionIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
    modalActionText: { color: 'white', fontSize: 12, fontWeight: '600' }
});
