import React, { useRef, useEffect } from 'react';
import type { Message } from '../../types/chat';
import MessageContainer from '../MessageContainer';
import ChatInput from '../ChatInput';
import styles from './ChatContainer.module.scss';

interface ChatContainerProps {
    messages: Message[];
    isLoading: boolean;
    onSend: (message: string) => void;
    onStop: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
    messages,
    isLoading,
    onSend,
    onStop
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        isAtBottomRef.current = distanceToBottom < 100;
    };

    useEffect(() => {
        if (isAtBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    return (
        <div className={styles.container}>
            <div
                className={styles.messagesArea}
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h1>Welcome to ChatMan AI</h1>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {messages.map((message) => (
                            <MessageContainer key={message.id} message={message} />
                        ))}
                        <div ref={bottomRef} className={styles.spacer} />
                    </div>
                )}
            </div>

            <div className={styles.inputArea}>
                <ChatInput
                    onSend={onSend}
                    onStop={onStop}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default ChatContainer;
