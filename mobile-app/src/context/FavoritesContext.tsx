
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FavoritesContextType = {
    favorites: string[];
    toggleFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favorites');
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log('[Favorites] Loaded:', parsed);
                setFavorites(parsed);
            } else {
                console.log('[Favorites] No saved favorites found.');
            }
        } catch (e) {
            console.error('[Favorites] Failed to load:', e);
        }
    };

    const toggleFavorite = async (id: string) => {
        let newFavorites;
        if (favorites.includes(id)) {
            newFavorites = favorites.filter(favId => favId !== id);
        } else {
            newFavorites = [...favorites, id];
        }

        setFavorites(newFavorites);

        try {
            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            console.log('[Favorites] Saved:', newFavorites);
        } catch (e) {
            console.error('[Favorites] Failed to save:', e);
        }
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
