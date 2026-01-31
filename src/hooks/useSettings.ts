import { useSettingsContext } from '../context/SettingsContext';

// Re-exporting types from context for compatibility
export type { Settings } from '../context/SettingsContext';

export const useSettings = () => {
    return useSettingsContext();
};
