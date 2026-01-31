import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Settings {
    apiKey: string;
    model: string;
    provider: 'openai' | 'gemini';
}

export const DEFAULT_SETTINGS: Settings = {
    apiKey: 'AIzaSyABqUyuP1g-5CHQCUIO2u2OfL5oZttO5Io',
    model: 'gemini-2.5-flash',
    provider: 'gemini',
};

interface SettingsContextType {
    settings: Settings;
    updateSettings: (partial: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('ai-chat-settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const merged = { ...DEFAULT_SETTINGS, ...parsed };

                const isGemini = merged.provider === 'gemini';
                const isGeminiModel = merged.model.startsWith('gemini');

                if (isGemini && !isGeminiModel) {
                    merged.model = 'gemini-1.5-flash';
                } else if (!isGemini && isGeminiModel) {
                    merged.model = 'gpt-3.5-turbo';
                    merged.provider = 'openai';
                }

                return merged;
            } catch (e) {
                console.error("Failed to parse settings", e);
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (partial: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};
