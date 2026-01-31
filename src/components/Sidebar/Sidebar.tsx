import React from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import type { ChatSession } from '../../types/chat';
import styles from './Sidebar.module.scss';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    currentSessionId: string | null;
    onLoadSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    sessions,
    currentSessionId,
    onLoadSession,
    onNewChat,
    onDeleteSession
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className={styles.overlay} onClick={onClose} />}

            <aside className={clsx(styles.sidebar, isOpen && styles.open)}>
                <div className={styles.header}>
                    <h2>History</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <button
                    className={styles.newChatBtn}
                    onClick={() => {
                        onNewChat();
                        if (window.innerWidth < 768) onClose();
                    }}
                >
                    <Plus size={18} />
                    New Chat
                </button>

                <div className={styles.sessionList}>
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            className={clsx(styles.sessionItem, currentSessionId === session.id && styles.active)}
                            onClick={() => {
                                onLoadSession(session.id);
                                if (window.innerWidth < 768) onClose();
                            }}
                        >
                            <MessageSquare size={14} className="inline-block mr-2 opacity-50" />
                            <h3>{session.title}</h3>
                            <p>{new Date(session.date).toLocaleDateString()}</p>

                            <button
                                className={styles.deleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="text-center text-sm text-gray-500 mt-10 p-4">
                            No history yet. Start a chat!
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
