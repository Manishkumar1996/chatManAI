import type { Message } from '../types/chat';

export class OpenAIService {
    static async *streamCompletion(
        apiKey: string,
        model: string,
        messages: Message[],
        signal?: AbortSignal
    ): AsyncGenerator<string, void, unknown> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: true,
            }),
            signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `OpenAI API Error: ${response.statusText}`);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.trim() === 'data: [DONE]') return;

                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices[0]?.delta?.content || '';
                        if (content) yield content;
                    } catch (e) {
                        console.warn('Error parsing stream chunk', e);
                    }
                }
            }
        }
    }

    static async getModels(apiKey: string): Promise<{ id: string; name: string }[]> {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) return [];

            const data = await response.json();
            if (!data.data) return [];

            return data.data
                .filter((m: any) => m.id.startsWith('gpt'))
                .map((m: any) => ({
                    id: m.id,
                    name: m.id
                }))
                .sort((a: any, b: any) => b.id.localeCompare(a.id));
        } catch (e) {
            console.error("Failed to fetch OpenAI models", e);
            return [];
        }
    }
}
