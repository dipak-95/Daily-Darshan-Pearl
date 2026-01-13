
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { Colors } from '../constants/Colors';
import { Config } from '../constants/Config';
import { Poonam, Grahan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun, Calendar, MapPin } from 'lucide-react-native';

export default function PanchangScreen() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'poonam' | 'grahan'>('poonam');
    const [poonams, setPoonams] = useState<Poonam[]>([]);
    const [grahans, setGrahans] = useState<Grahan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [poonamRes, grahanRes] = await Promise.all([
                fetch(`${Config.API_BASE_URL}/poonam`),
                fetch(`${Config.API_BASE_URL}/grahan`)
            ]);
            const poonamData = await poonamRes.json();
            const grahanData = await grahanRes.json();
            setPoonams(poonamData);
            setGrahans(grahanData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoStr: string) => {
        if (!isoStr) return '';
        const date = new Date(isoStr);
        // Simple formatting
        return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const renderPoonam = ({ item }: { item: Poonam }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F7FA' }]}>
                    <Moon size={24} color="#006064" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.dateLabel}>{language === 'hi' ? 'प्रारंभ' : 'Starts'}</Text>
                    <Text style={styles.dateValue}>{formatDate(item.startDateTime)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.dateLabel}>{language === 'hi' ? 'समाप्त' : 'Ends'}</Text>
                    <Text style={styles.dateValue}>{formatDate(item.endDateTime)}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.description}>
                {(language === 'hi' && item.descriptionHindi) ? item.descriptionHindi : item.description}
            </Text>
        </View>
    );

    const renderGrahan = ({ item }: { item: Grahan }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                    <Sun size={24} color="#E65100" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.dateLabel}>{language === 'hi' ? 'प्रारंभ' : 'Starts'}</Text>
                    <Text style={styles.dateValue}>{formatDate(item.startDateTime)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.dateLabel}>{language === 'hi' ? 'समाप्त' : 'Ends'}</Text>
                    <Text style={styles.dateValue}>{formatDate(item.endDateTime)}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <MapPin size={16} color={Colors.secondary} />
                <Text style={styles.locationText}>
                    {(language === 'hi' && item.affectedPlacesHindi) ? item.affectedPlacesHindi : item.affectedPlaces}
                </Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.description}>
                {(language === 'hi' && item.descriptionHindi) ? item.descriptionHindi : item.description}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'poonam' && styles.activeTab]}
                    onPress={() => setActiveTab('poonam')}
                >
                    <Text style={[styles.tabText, activeTab === 'poonam' && styles.activeTabText]}>
                        {language === 'hi' ? 'पूनम' : 'Poonam'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'grahan' && styles.activeTab]}
                    onPress={() => setActiveTab('grahan')}
                >
                    <Text style={[styles.tabText, activeTab === 'grahan' && styles.activeTabText]}>
                        {language === 'hi' ? 'ग्रहण' : 'Grahan'}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'poonam' ? poonams : grahans}
                    keyExtractor={item => item.id}
                    renderItem={activeTab === 'poonam' ? renderPoonam as any : renderGrahan as any}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>
                                {language === 'hi' ? 'कोई जानकारी उपलब्ध नहीं है' : 'No data available'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    tabs: { flexDirection: 'row', backgroundColor: Colors.surface, padding: 10, margin: 16, borderRadius: 12, elevation: 2 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: Colors.primary },
    tabText: { color: Colors.text, fontWeight: '600', fontSize: 16 },
    activeTabText: { color: 'white', fontWeight: 'bold' },

    list: { paddingHorizontal: 16, paddingBottom: 20 },
    card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

    dateLabel: { fontSize: 12, color: Colors.secondary, textTransform: 'uppercase', fontWeight: 'bold' },
    dateValue: { fontSize: 14, color: Colors.text, fontWeight: '600' },

    divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
    description: { fontSize: 14, color: Colors.text, lineHeight: 20 },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, backgroundColor: '#f9f9f9', padding: 8, borderRadius: 6 },
    locationText: { fontSize: 13, color: Colors.text, fontWeight: '500', flex: 1 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.secondary, fontSize: 16 }
});
