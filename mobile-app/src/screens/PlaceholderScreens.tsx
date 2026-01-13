
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Switch, ScrollView, Modal, Pressable } from 'react-native';
import { Colors } from '../constants/Colors';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { Config } from '../constants/Config';
import { Temple } from '../types';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Globe, Info, Shield, HelpCircle, Share2, Mail, X } from 'lucide-react-native';
import { resolveImageUrl } from '../utils/helpers';

// --- Favorites Screen ---
export const FavoritesScreen = () => {
    const { favorites } = useFavorites();
    const { t, language } = useLanguage();
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${Config.API_BASE_URL}/temples`);
            const data = await res.json();
            setTemples(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const favoriteTemples = temples.filter(t => favorites.includes(t.id));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('favorites')} ({favoriteTemples.length})</Text>
            {favoriteTemples.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.empty}>{t('home')} ❤️</Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteTemples}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('Home', { screen: 'TempleDetails', params: { temple: item } })}
                        >
                            <Image source={{ uri: resolveImageUrl(item.image) || '' }} style={styles.image} />
                            <View style={styles.info}>
                                <Text style={styles.name}>{(language === 'hi' && item.nameHindi) ? item.nameHindi : item.name}</Text>
                                <Text style={styles.loc}>{(language === 'hi' && item.locationHindi) ? item.locationHindi : item.location}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

// --- Settings Screen ---
export const SettingsScreen = () => {
    const { language, setLanguage, t } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const openModal = (titleKey: string, bodyKey: string) => {
        setModalContent({ title: t(titleKey), body: t(bodyKey) });
        setModalVisible(true);
    };

    const SettingItem = ({ icon: Icon, title, onPress, value }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <Icon size={22} color={Colors.primary} />
                <Text style={styles.settingText}>{title}</Text>
            </View>
            <View style={styles.settingRight}>
                {value}
                {!value && <ChevronRight size={20} color={Colors.secondary} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t('settings')}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Preferences</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Globe size={22} color={Colors.primary} />
                        <Text style={styles.settingText}>{t('changeLanguage')}</Text>
                    </View>
                    <View style={styles.langToggle}>
                        <Pressable onPress={() => setLanguage('en')} style={[styles.langBtn, language === 'en' && styles.langBtnActive]}>
                            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
                        </Pressable>
                        <Pressable onPress={() => setLanguage('hi')} style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}>
                            <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>हिंदी</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Support</Text>
                <SettingItem icon={Info} title={t('about')} onPress={() => openModal('about', 'aboutContent')} />
                <SettingItem icon={Shield} title={t('privacy')} onPress={() => openModal('privacy', 'privacyContent')} />
                <SettingItem icon={HelpCircle} title={t('howToUse')} onPress={() => openModal('howToUse', 'howToUseContent')} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>App</Text>
                <SettingItem icon={Share2} title={t('share')} onPress={() => alert('Sharing not implemented')} />
                <SettingItem icon={Mail} title={t('contactUs')} onPress={() => alert('Contact: support@dailydarshan.com')} />
            </View>

            <Text style={styles.version}>Version 1.0.0</Text>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalContent.title}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <Text style={styles.modalBody}>{modalContent.body}</Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

// End of Screens

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: Colors.primaryDark, marginBottom: 20 },
    empty: { color: Colors.secondary, fontSize: 16 },
    card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2, alignItems: 'center' },
    image: { width: 80, height: 80, resizeMode: 'cover' },
    info: { padding: 12, flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    loc: { fontSize: 14, color: Colors.secondary, marginTop: 4 },

    // Settings Styles
    section: { marginBottom: 24, backgroundColor: Colors.surface, borderRadius: 12, padding: 8, elevation: 1 },
    sectionHeader: { fontSize: 14, fontWeight: 'bold', color: Colors.secondary, marginBottom: 8, paddingLeft: 8, marginTop: 8, textTransform: 'uppercase' },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    settingText: { fontSize: 16, color: Colors.text, fontWeight: '500' },
    version: { textAlign: 'center', color: Colors.secondary, marginTop: 20 },

    langToggle: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 20, padding: 2 },
    langBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16 },
    langBtnActive: { backgroundColor: Colors.primary },
    langText: { fontSize: 12, color: Colors.text },
    langTextActive: { color: 'white', fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalView: { backgroundColor: 'white', borderRadius: 20, padding: 20, maxHeight: '80%', elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primaryDark },
    modalBody: { fontSize: 16, lineHeight: 24, color: Colors.textLight },
    closeButton: { marginTop: 20, backgroundColor: Colors.primary, padding: 12, borderRadius: 12, alignItems: 'center' },
    closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
