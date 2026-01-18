import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { ArrowLeft } from 'lucide-react-native';

export default function SettingsDetailScreen({ route, navigation }: any) {
    const { title, content } = route.params;

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF8F0', paddingTop: 50 }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
                    <ArrowLeft color="#ea580c" size={24} />
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ea580c' }}>{title}</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 2 }}>
                    <Text style={{ fontSize: 16, lineHeight: 24, color: '#374151' }}>
                        {content}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
