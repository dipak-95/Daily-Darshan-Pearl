
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'hi';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const translations = {
    en: {
        home: 'Home',
        favorites: 'Favorites',
        panchang: 'Panchang',
        settings: 'Settings',
        about: 'About App',
        privacy: 'Privacy Policy',
        howToUse: 'How to Use',
        share: 'Share App',
        changeLanguage: 'Language',
        darkMode: 'Dark Mode',
        contactUs: 'Contact Us',
        aboutContent: 'Daily Darshan is your spiritual companion, bringing live Darshan and Aarti from temples across India directly to your phone. Experience divinity daily.',
        privacyContent: 'We value your privacy. No personal data is collected. Your favorites and settings are stored locally on your device.',
        howToUseContent: '1. Browse temples on Home.\n2. Tap ❤️ to favorite.\n3. Watch daily Aarti/Darshan videos.\n4. Check Poonam/Grahan dates in Panchang tab.',
        greeting: 'Jai Shri Krishna 🙏',
        subtitle: 'Live Darshan & Aarti',
        today: 'Today',
        yesterday: 'Yesterday',
        morningDarshan: 'Morning Darshan',
        eveningDarshan: 'Evening Darshan',
        morningAarti: 'Morning Aarti',
        eveningAarti: 'Evening Aarti',
        templeDetails: 'Temple Details',
        download: 'Download',
        shareAction: 'Share',
        savedToGallery: 'Saved to Gallery!',
        permissionNeeded: 'Permission needed',
    },
    hi: {
        home: 'होम',
        favorites: 'पसंदीदा',
        panchang: 'पंचांग',
        settings: 'सेटिंग्स',
        about: 'ऐप के बारे में',
        privacy: 'गोपनीयता नीति',
        howToUse: 'उपयोग कैसे करें',
        share: 'ऐप शेयर करें',
        changeLanguage: 'भाषा',
        darkMode: 'डार्क मोड',
        contactUs: 'संपर्क करें',
        aboutContent: 'डेली दर्शन आपका आध्यात्मिक साथी है, जो भारत भर के मंदिरों से लाइव दर्शन और आरती सीधे आपके फोन पर लाता है।',
        privacyContent: 'हम आपकी गोपनीयता का सम्मान करते हैं। कोई व्यक्तिगत डेटा एकत्र नहीं किया जाता है।',
        howToUseContent: '1. होम पर मंदिर देखें।\n2. ❤️ दबाकर पसंदीदा बनाएं।\n3. रोज़ाना आरती/दर्शन वीडियो देखें।\n4. पंचांग टैब में पूनम/ग्रहण की तिथियां देखें।',
        greeting: 'जय श्री कृष्णा 🙏',
        subtitle: 'लाइव दर्शन और आरती',
        today: 'आज',
        yesterday: 'बीता कल',
        morningDarshan: 'सुबह का दर्शन',
        eveningDarshan: 'शाम का दर्शन',
        morningAarti: 'सुबह की आरती',
        eveningAarti: 'शाम की आरती',
        templeDetails: 'मंदिर विवरण',
        download: 'डाउनलोड',
        shareAction: 'शेयर',
        savedToGallery: 'गैलरी में सहेजा गया!',
        permissionNeeded: 'अनुमति चाहिए',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        AsyncStorage.getItem('language').then(lang => {
            if (lang === 'en' || lang === 'hi') setLanguageState(lang);
        });
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        AsyncStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        const k = key as keyof typeof translations['en'];
        return translations[language][k] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage error');
    return context;
};
