import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import React from 'react';
import { ChevronRight, Info, MessageCircle, Share2, Star, Shield } from 'lucide-react-native';

export default function SettingsScreen({ navigation }: any) {

    const navigateToDetail = (title: string, content: string) => {
        navigation.navigate('SettingsDetail', { title, content });
    };

    const renderItem = (icon: any, title: string, subtitle: string, onPress: () => void) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: 16,
                marginBottom: 12,
                borderRadius: 16,
                elevation: 2
            }}
        >
            <View style={{ backgroundColor: '#fff7ed', padding: 10, borderRadius: 12, marginRight: 16 }}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>{title}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF8F0', paddingTop: 60 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ea580c' }}>Settings</Text>
                <Text style={{ color: '#666' }}>App preferences & Info</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
                {renderItem(<Info size={24} color="#ea580c" />, 'About Us', 'Learn more about Daily Darshan',
                    () => navigateToDetail('About Us', 'Daily Darshan is your spiritual companion, bringing live darshan from famous temples directly to your phone. Our mission is to connect devotees with divinity through technology.\n\nVersion: 1.0.0\nDeveloped by: Hubble Team')
                )}
                {renderItem(<Shield size={24} color="#ea580c" />, 'Privacy Policy', 'Data usage and protection',
                    () => navigateToDetail('Privacy Policy', 'We value your privacy. We do not collect any personal data without your consent. Currently, this app uses your internet connection strictly to fetch temple data and images.\n\nNo location tracking or background data collection is performed.')
                )}
                {renderItem(<MessageCircle size={24} color="#ea580c" />, 'Contact Support', 'Get help with issues',
                    () => navigateToDetail('Contact Support', 'For any issues or feedback, please reach out to us at:\n\nEmail: support@dailydarshan.com\nPhone: +91 1234567890\n\nWe are available Mon-Fri, 9 AM - 6 PM.')
                )}
                {renderItem(<Share2 size={24} color="#ea580c" />, 'Share App', 'Share with friends and family',
                    () => navigateToDetail('Share App', 'Support functionality coming soon! In the future, you will be able to share the app link directly from here.')
                )}
                {renderItem(<Star size={24} color="#ea580c" />, 'Rate Us', 'Rate us on the Play Store',
                    () => navigateToDetail('Rate Us', 'If you love our app, please rate us 5 stars on the Play Store! Your support helps us add more temples and features.')
                )}
            </ScrollView>

            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Developed by Pearl Production</Text>
            </View>
        </View>
    );
}
