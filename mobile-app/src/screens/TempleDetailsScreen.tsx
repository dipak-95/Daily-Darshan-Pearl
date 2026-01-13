
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../constants/Colors';
import { Config } from '../constants/Config';
import { Temple, VideoContent } from '../types';
import { Play, Calendar, MapPin, Camera, X, Share2, Download } from 'lucide-react-native';
import { resolveImageUrl } from '../utils/helpers';
// @ts-ignore: Deprecation warning suggestion
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const getYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function TempleDetailsScreen() {
    const route = useRoute<any>();
    const initialTemple = route.params.temple as Temple;
    const [temple, setTemple] = useState<Temple>(initialTemple);

    const [selectedTab, setSelectedTab] = useState<'today' | 'yesterday'>('today');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
    const [downloading, setDownloading] = useState(false);
    const videoRef = useRef<Video>(null);

    // Hooks
    const { t, language } = useLanguage();

    useEffect(() => {
        fetchLatestData();
    }, [initialTemple.id]);

    const fetchLatestData = async () => {
        try {
            const res = await fetch(`${Config.API_BASE_URL}/temples`);
            const data: Temple[] = await res.json();
            const fresh = data.find(t => t.id === initialTemple.id);
            if (fresh) {
                setTemple(fresh);
            }
        } catch (e) {
            console.error('Failed to refresh temple details', e);
        }
    };

    const handleDownload = async () => {
        if (!mediaUrl) return;
        setDownloading(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert(t('permissionNeeded'), 'Please grant permission to save photos to gallery.');
                setDownloading(false);
                return;
            }

            const filename = mediaUrl.split('/').pop()?.replace(/[^a-zA-Z0-9.]/g, '_') || `download_${Date.now()}.jpg`;
            const fileUri = ((FileSystem.documentDirectory || (FileSystem as any).cacheDirectory) as string) + filename;

            const { uri } = await FileSystem.downloadAsync(mediaUrl, fileUri);

            try {
                await MediaLibrary.createAssetAsync(uri);
                Alert.alert('Success', t('savedToGallery'));
            } catch (e: any) {
                console.error("Save Error", e);
                // On Android 10+, this might need 'expo-media-library' saveToLibraryAsync
                Alert.alert('Error', 'Could not save to gallery: ' + e.message);
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', `Details: ${error.message}`);
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!mediaUrl) return;
        setDownloading(true);
        try {
            const filename = mediaUrl.split('/').pop()?.replace(/[^a-zA-Z0-9.]/g, '_') || `share_${Date.now()}.jpg`;
            const fileUri = ((FileSystem.documentDirectory || (FileSystem as any).cacheDirectory) as string) + filename;

            const { uri } = await FileSystem.downloadAsync(mediaUrl, fileUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Share Error', `${error.message}`);
        } finally {
            setDownloading(false);
        }
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateKey = selectedTab === 'today' ? getYYYYMMDD(today) : getYYYYMMDD(yesterday);
    const videoData: VideoContent = (temple.videos && temple.videos[dateKey]) ? temple.videos[dateKey] : {};

    const contents = [
        { label: t('morningDarshan'), url: videoData.morningDarshan, type: 'image' },
        { label: t('morningAarti'), url: videoData.morningAarti, type: 'video' },
        { label: t('eveningDarshan'), url: videoData.eveningDarshan, type: 'image' },
        { label: t('eveningAarti'), url: videoData.eveningAarti, type: 'video' },
    ].filter(v => v.url);

    const handleMediaPress = (item: { url?: string; type: string }) => {
        const resolved = resolveImageUrl(item.url);
        if (!resolved) return;
        setMediaUrl(resolved);
        setMediaType(item.type as any);
    };

    const resolvedTempleImage = resolveImageUrl(temple.image);
    const displayName = (language === 'hi' && temple.nameHindi) ? temple.nameHindi : temple.name;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Media Player */}
            <View style={styles.heroContainer}>
                {resolvedTempleImage ? (
                    <Image source={{ uri: resolvedTempleImage }} style={styles.heroImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.heroImage, { backgroundColor: '#333' }]} />
                )}

                <View style={styles.heroOverlay}>
                    <Text style={styles.templeName}>{displayName}</Text>
                    <View style={styles.locationTag}>
                        <MapPin size={14} color={Colors.white} />
                        <Text style={styles.locationText}>{temple.location}</Text>
                    </View>
                </View>
            </View>

            {/* Date Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
                    onPress={() => setSelectedTab('today')}
                >
                    <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>{t('today')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'yesterday' && styles.activeTab]}
                    onPress={() => setSelectedTab('yesterday')}
                >
                    <Text style={[styles.tabText, selectedTab === 'yesterday' && styles.activeTabText]}>{t('yesterday')}</Text>
                </TouchableOpacity>
            </View>

            {/* Content Grid */}
            <View style={styles.grid}>
                {contents.length > 0 ? (
                    contents.map((item, index) => {
                        const resolvedUrl = resolveImageUrl(item.url);
                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.contentCard}
                                onPress={() => handleMediaPress(item as any)}
                            >
                                {item.type === 'image' && resolvedUrl ? (
                                    <Image
                                        source={{ uri: resolvedUrl }}
                                        style={styles.cardThumbnail}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.thumbnailPlaceholder}>
                                        {item.type === 'video' ? (
                                            <Play size={32} color={Colors.primary} />
                                        ) : (
                                            <Camera size={32} color={Colors.primary} />
                                        )}
                                    </View>
                                )}
                                <View style={styles.cardFooter}>
                                    <Text style={styles.cardLabel}>{item.label}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Calendar size={48} color={Colors.secondary} />
                        <Text style={styles.emptyText}>{selectedTab ? t('today') : t('yesterday')} - No Content</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('templeDetails')}</Text>
                <Text style={styles.description}>
                    {(language === 'hi' && temple.descriptionHindi) ? temple.descriptionHindi : temple.description}
                </Text>
            </View>

            {/* Fullscreen Media Modal */}
            <Modal visible={!!mediaUrl} transparent={true} animationType="fade" onRequestClose={() => setMediaUrl(null)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setMediaUrl(null)}>
                        <X size={30} color="white" />
                    </TouchableOpacity>

                    <View style={styles.mediaWrapper}>
                        {mediaType === 'video' ? (
                            <Video
                                ref={videoRef}
                                source={{ uri: mediaUrl! }}
                                style={styles.fullscreenMedia}
                                useNativeControls={false}
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
                                shouldPlay
                            />
                        ) : (
                            <Image
                                source={{ uri: mediaUrl! }}
                                style={styles.fullscreenMedia}
                                resizeMode="contain"
                            />
                        )}
                    </View>

                    {/* Action Buttons for Image/Video */}
                    <View style={styles.bottomActions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} disabled={downloading}>
                            {downloading ? <ActivityIndicator color="white" size="small" /> : <Share2 size={24} color="white" />}
                            <Text style={styles.actionText}>{t('shareAction')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleDownload} disabled={downloading}>
                            {downloading ? <ActivityIndicator color="white" size="small" /> : <Download size={24} color="white" />}
                            <Text style={styles.actionText}>{t('download')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    heroContainer: { height: 300, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
    templeName: { fontSize: 28, fontWeight: 'bold', color: Colors.white, marginBottom: 4 },
    locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { color: Colors.white, fontSize: 14 },

    tabContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: Colors.surface },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
    activeTab: { backgroundColor: Colors.primary + '20' },
    tabText: { color: Colors.text, fontWeight: '600' },
    activeTabText: { color: Colors.primary, fontWeight: 'bold' },

    grid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    contentCard: { width: (width - 44) / 2, height: 140, backgroundColor: Colors.surface, borderRadius: 12, elevation: 2, overflow: 'hidden' },
    cardThumbnail: { flex: 1, width: '100%' },
    thumbnailPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' },
    cardFooter: { padding: 8, backgroundColor: Colors.surface },
    cardLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },

    emptyState: { width: '100%', padding: 40, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { color: Colors.secondary, fontSize: 16 },

    infoSection: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark, marginBottom: 8 },
    description: { fontSize: 14, color: Colors.text, lineHeight: 22 },

    modalContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'flex-end' },
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    mediaWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fullscreenMedia: { width: width, height: '100%', backgroundColor: 'black' },

    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '100%',
        paddingBottom: 40, // Safe area
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
        padding: 10,
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    }
});
