import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { Bot, User } from 'lucide-react';
import type { Message } from '../../types/chat';
import styles from './MessageContainer.module.scss';
import type { Components } from 'react-markdown';

interface MessageContainerProps {
    message: Message;
}

const MessageContainer: React.FC<MessageContainerProps> = memo(({ message }) => {
    const isUser = message.role === 'user';
    const isError = message.status === 'error';

    const components: Components = {
        code(props: any) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className; // Simple heuristic

            if (isInline) {
                return (
                    <code className={styles.inlineCode} {...rest}>
                        {children}
                    </code>
                );
            }

            return (
                <div className={styles.codeBlock}>
                    <div className={styles.codeHeader}>
                        <span>{match?.[1] || 'code'}</span>
                    </div>
                    <code className={className} {...rest}>
                        {children}
                    </code>
                </div>
            );
        }
    };

    return (
        <div className={clsx(styles.container, isUser ? styles.user : styles.assistant)}>
            <div className={styles.avatar}>
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className={clsx(styles.bubble, isError && styles.error)}>
                {isUser ? (
                    <p className={styles.text}>{message.content}</p>
                ) : (
                    <div className={styles.markdown}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={components}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                {message.status === 'streaming' && (
                    <span className={styles.cursor} aria-hidden="true" />
                )}
            </div>
        </div>
    );
});

export default MessageContainer;
