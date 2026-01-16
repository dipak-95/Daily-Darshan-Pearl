import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Config } from '../constants/Config';
import { Moon, Sun } from 'lucide-react-native';

export default function PanchangScreen() {
    const [activeTab, setActiveTab] = useState<'poonam' | 'grahan'>('poonam');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'poonam' ? '/poonam' : '/grahan';
            const res = await fetch(`${Config.API_BASE_URL}${endpoint}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderToggle = () => (
        <View style={{ flexDirection: 'row', backgroundColor: 'white', margin: 20, borderRadius: 12, padding: 4, elevation: 2 }}>
            <TouchableOpacity
                onPress={() => setActiveTab('poonam')}
                style={{
                    flex: 1,
                    paddingVertical: 12,
                    backgroundColor: activeTab === 'poonam' ? '#ea580c' : 'transparent',
                    borderRadius: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8
                }}
            >
                <Moon size={18} color={activeTab === 'poonam' ? 'white' : '#64748b'} />
                <Text style={{ fontWeight: '600', color: activeTab === 'poonam' ? 'white' : '#64748b' }}>Poonam</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setActiveTab('grahan')}
                style={{
                    flex: 1,
                    paddingVertical: 12,
                    backgroundColor: activeTab === 'grahan' ? '#ea580c' : 'transparent',
                    borderRadius: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8
                }}
            >
                <Sun size={18} color={activeTab === 'grahan' ? 'white' : '#64748b'} />
                <Text style={{ fontWeight: '600', color: activeTab === 'grahan' ? 'white' : '#64748b' }}>Grahan</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={{
            backgroundColor: 'white',
            marginHorizontal: 20,
            marginBottom: 12,
            padding: 16,
            borderRadius: 16,
            elevation: 2,
            borderLeftWidth: 4,
            borderLeftColor: activeTab === 'poonam' ? '#fb923c' : '#ef4444'
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748b', backgroundColor: '#f1f5f9', padding: 4, paddingHorizontal: 8, borderRadius: 6 }}>
                    {new Date(item.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                </Text>
            </View>

            {item.title && (
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ea580c', marginBottom: 4 }}>
                    {item.title}
                </Text>
            )}

            {item.description && (
                <Text style={{ color: '#4b5563', lineHeight: 20 }}>{item.description}</Text>
            )}

            {activeTab === 'grahan' && (
                <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
                    <View style={{ backgroundColor: '#fff1f2', padding: 8, borderRadius: 8, flex: 1 }}>
                        <Text style={{ fontSize: 10, color: '#e11d48', fontWeight: 'bold' }}>START</Text>
                        <Text style={{ color: '#be123c', fontWeight: '600' }}>{item.startTime || 'TBA'}</Text>
                    </View>
                    <View style={{ backgroundColor: '#f0f9ff', padding: 8, borderRadius: 8, flex: 1 }}>
                        <Text style={{ fontSize: 10, color: '#0284c7', fontWeight: 'bold' }}>END</Text>
                        <Text style={{ color: '#0369a1', fontWeight: '600' }}>{item.endTime || 'TBA'}</Text>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF8F0', paddingTop: 60 }}>
            <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ea580c' }}>Hindu Calendar</Text>
                <Text style={{ color: '#666' }}>Upcoming religious events</Text>
            </View>

            {renderToggle()}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#ea580c" />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#94a3b8' }}>No data available for {activeTab}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
