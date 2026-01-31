import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, ChatState, ChatSession } from '../types/chat';
import { OpenAIService } from '../services/openai';
import { GeminiService } from '../services/gemini';
import { generateId } from '../utils/uuid';
import { useSettings } from './useSettings';

const SESSION_LIST_KEY = 'ai-chat-sessions';
const ACTIVE_SESSION_KEY = 'ai-chat-active-session';
const SESSION_PREFIX = 'ai-chat-session-';

export const useChat = () => {
    const { settings } = useSettings();

    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        try {
            const saved = localStorage.getItem(SESSION_LIST_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load sessions", e);
            return [];
        }
    });

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
        try {
            return localStorage.getItem(ACTIVE_SESSION_KEY);
        } catch (e) {
            return null;
        }
    });

    const [state, setState] = useState<ChatState>(() => {
        try {
            const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
            if (activeId) {
                const savedMsgs = localStorage.getItem(SESSION_PREFIX + activeId);
                if (savedMsgs) {
                    return {
                        messages: JSON.parse(savedMsgs),
                        isLoading: false,
                        streamingId: null,
                        error: null,
                    };
                }
            }
        } catch (e) {
            console.error("Failed to load messages", e);
        }
        return {
            messages: [],
            isLoading: false,
            streamingId: null,
            error: null,
        };
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        if (currentSessionId) {
            localStorage.setItem(ACTIVE_SESSION_KEY, currentSessionId);
        } else {
            localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
    }, [currentSessionId]);

    useEffect(() => {
        if (currentSessionId) {
            localStorage.setItem(SESSION_PREFIX + currentSessionId, JSON.stringify(state.messages));
        }
    }, [state.messages, currentSessionId]);


    const loadSession = useCallback((id: string) => {
        if (abortControllerRef.current) abortControllerRef.current.abort();

        const savedMsgs = localStorage.getItem(SESSION_PREFIX + id);
        if (savedMsgs) {
            try {
                setState({
                    messages: JSON.parse(savedMsgs),
                    isLoading: false,
                    streamingId: null,
                    error: null
                });
                setCurrentSessionId(id);
            } catch (e) {
                console.error("Failed to load session messages", e);
            }
        }
    }, []);

    const startNewChat = useCallback(() => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setState({
            messages: [],
            isLoading: false,
            streamingId: null,
            error: null
        });
        setCurrentSessionId(null);
    }, []);

    const deleteSession = useCallback((id: string) => {
        localStorage.removeItem(SESSION_PREFIX + id);
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
            startNewChat();
        }
    }, [currentSessionId, startNewChat]);

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setState(prev => ({ ...prev, isLoading: false, streamingId: null }));
        }
    }, []);

    const addMessage = useCallback(async (content: string) => {
        let activeId = currentSessionId;

        // Create session if none
        if (!activeId) {
            activeId = generateId();
            setCurrentSessionId(activeId);

            const newSession: ChatSession = {
                id: activeId,
                title: content.substring(0, 30) || "New Chat",
                date: Date.now(),
                preview: content.substring(0, 50)
            };
            setSessions(prev => [newSession, ...prev]);
        } else {
            // Update existing session preview
            setSessions(prev => prev.map(s =>
                s.id === activeId
                    ? { ...s, preview: content.substring(0, 50), date: Date.now() }
                    : s
            ));
        }

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: Date.now(),
            status: 'completed',
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isLoading: true,
            error: null,
        }));

        try {
            const assistantId = generateId();
            const assistantMessage: Message = {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                status: 'streaming',
            };

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                streamingId: assistantId,
            }));

            abortControllerRef.current = new AbortController();

            let stream;
            if (settings.apiKey) {
                if (settings.provider === 'gemini') {
                    stream = GeminiService.streamCompletion(
                        settings.apiKey.trim(),
                        settings.model,
                        [...state.messages, userMessage],
                        abortControllerRef.current.signal
                    );
                } else {
                    stream = OpenAIService.streamCompletion(
                        settings.apiKey.trim(),
                        settings.model,
                        [...state.messages, userMessage],
                        abortControllerRef.current.signal
                    );
                }
            } else {
                throw new Error("No API Key available. Please check settings.");
            }

            let fullContent = '';
            for await (const chunk of stream) {
                fullContent += chunk;
                setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg =>
                        msg.id === assistantId
                            ? { ...msg, content: fullContent }
                            : msg
                    )
                }));
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                streamingId: null,
                messages: prev.messages.map(msg =>
                    msg.id === assistantId
                        ? { ...msg, status: 'completed' }
                        : msg
                )
            }));

        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error("Streaming error:", error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                streamingId: null,
                error: error.message || "An error occurred",
                messages: prev.messages.map(msg =>
                    msg.id === prev.streamingId
                        ? { ...msg, status: 'error', content: msg.content || `Error: ${error.message}` }
                        : msg
                )
            }));
        } finally {
            abortControllerRef.current = null;
        }
    }, [state.messages, settings.apiKey, settings.model, settings.provider, currentSessionId]);

    const clearChat = startNewChat;

    return {
        messages: state.messages,
        isLoading: state.isLoading,
        error: state.error,
        addMessage,
        stop,
        clearChat,
        sessions,
        currentSessionId,
        loadSession,
        startNewChat,
        deleteSession
    };
};
