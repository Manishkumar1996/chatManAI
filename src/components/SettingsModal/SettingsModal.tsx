import React, { useEffect } from 'react';
import { X, Save, ExternalLink } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { DEFAULT_SETTINGS } from '../../context/SettingsContext';
import styles from './SettingsModal.module.scss';
import { GeminiService } from '../../services/gemini';
import { OpenAIService } from '../../services/openai';
import { Loader2, RefreshCw } from 'lucide-react';



interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();
    const [apiKey, setApiKey] = React.useState(settings.apiKey);
    const [model, setModel] = React.useState(settings.model);
    const [provider, setProvider] = React.useState(settings.provider);
    const [availableModels, setAvailableModels] = React.useState<{ id: string; name: string }[]>([]);
    const [isLoadingModels, setIsLoadingModels] = React.useState(false);


    useEffect(() => {
        if (isOpen) {
            const isDefaultKey = settings.apiKey === DEFAULT_SETTINGS.apiKey;
            setApiKey(isDefaultKey ? '' : settings.apiKey);
            setModel(settings.model);
            setProvider(settings.provider);
        }
    }, [isOpen, settings]);

    const handleProviderChange = (newProvider: 'openai' | 'gemini') => {
        setProvider(newProvider);
        setApiKey('');
        setAvailableModels([]);

        if (newProvider === 'openai') {
            setModel('gpt-3.5-turbo');
        } else {
            setModel('gemini-1.5-flash');
        }
    };

    const fetchModels = async () => {
        if (!apiKey) return;
        setIsLoadingModels(true);

        let models: { id: string; name: string }[] = [];

        if (provider === 'gemini') {
            models = await GeminiService.getModels(apiKey);
        } else {
            models = await OpenAIService.getModels(apiKey);
        }

        setAvailableModels(models);
        setIsLoadingModels(false);

        if (models.length > 0) {
            const currentExists = models.find(m => m.id === model);
            if (!currentExists) {
                setModel(models[0].id);
            }
        }
    };

    useEffect(() => {
        if (isOpen && settings.apiKey) {
            if (availableModels.length === 0) {
                fetchModels();
            }
        }
    }, [isOpen]);


    const handleSave = () => {
        let keyToSave = apiKey;
        if (keyToSave === '' && settings.apiKey === DEFAULT_SETTINGS.apiKey) {
            keyToSave = DEFAULT_SETTINGS.apiKey;
        } else if (keyToSave === '' && provider === DEFAULT_SETTINGS.provider) {
            keyToSave = DEFAULT_SETTINGS.apiKey;
        }

        updateSettings({ apiKey: keyToSave, model, provider });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Settings</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.field}>
                        <label>AI Provider</label>
                        <div className={styles.providerToggle}>
                            <button
                                className={provider === 'gemini' ? styles.active : ''}
                                onClick={() => handleProviderChange('gemini')}
                            >
                                Google Gemini
                            </button>
                            <button
                                className={provider === 'openai' ? styles.active : ''}
                                onClick={() => handleProviderChange('openai')}
                            >
                                OpenAI
                            </button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>
                            {provider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={provider === 'openai' ? "sk-..." : "AIza..."}
                            className={styles.input}
                        />
                        <p className={styles.help}>
                            {provider === 'openai' ? (
                                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
                                    Get OpenAI Key <ExternalLink size={10} />
                                </a>
                            ) : (
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                                    Get Gemini Key <ExternalLink size={10} />
                                </a>
                            )}
                        </p>
                    </div>

                    <div className={styles.field}>
                        <label>Model</label>
                        <div className={styles.modelRow}>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className={styles.select}
                                disabled={availableModels.length === 0 || !apiKey}
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))
                                ) : (
                                    provider === 'openai' ? (
                                        <>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-4o">GPT-4o</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                            <option value="gemini-pro">Gemini Pro (1.0)</option>
                                        </>
                                    )
                                )}
                            </select>
                            <button
                                onClick={fetchModels}
                                disabled={!apiKey || isLoadingModels}
                                className={styles.refreshBtn}
                                title="Fetch Available Models"
                                type="button"
                            >
                                {isLoadingModels ? <Loader2 className={styles.spin} size={16} /> : <RefreshCw size={16} />}
                            </button>
                        </div>

                    </div>
                </div>

                <div className={styles.footer}>
                    <button onClick={handleSave} className={styles.saveBtn}>
                        <Save size={18} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
