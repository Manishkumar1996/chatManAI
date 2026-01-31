import type { Message } from '../types/chat';

export class GeminiService {
    static async *streamCompletion(
        apiKey: string,
        model: string,
        messages: Message[],
        signal?: AbortSignal
    ): AsyncGenerator<string, void, unknown> {
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents,
                }),
                signal,
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `Gemini API Error: ${response.statusText}`);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
            let match;
            while ((match = regex.exec(buffer)) !== null) {
                try {
                    const text = JSON.parse(`"${match[1]}"`);
                    if (text) yield text;
                } catch (e) {
                    console.warn("Failed to parse chunk", e);
                }
            }

            if (buffer.length > 1000) {
                buffer = buffer.slice(-100);
            }
        }
    }

    static async getModels(apiKey: string): Promise<{ id: string; name: string }[]> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
                { method: 'GET' }
            );

            if (!response.ok) return [];

            const data = await response.json();
            if (!data.models) return [];

            return data.models
                .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m: any) => ({
                    id: m.name.replace('models/', ''),
                    name: m.displayName || m.name
                }));
        } catch (e) {
            console.error("Failed to fetch models", e);
            return [];
        }
    }
}
