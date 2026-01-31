import React, { useRef, useState, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';
import clsx from 'clsx';
import styles from './ChatInput.module.scss';

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, disabled }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!input.trim() || disabled || (isLoading && !onStop)) return;

        if (isLoading && onStop) {
            onStop();
            return;
        }

        onSend(input);
        setInput('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={disabled}
                    className={styles.textarea}
                    rows={1}
                />
                <button
                    className={clsx(styles.sendButton, isLoading && styles.loading)}
                    onClick={handleSend}
                    disabled={!input.trim() && !isLoading}
                    aria-label={isLoading ? "Stop generating" : "Send message"}
                >
                    {isLoading ? <StopCircle size={20} /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
