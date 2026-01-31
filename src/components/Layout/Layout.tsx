import React, { useState } from 'react';
import { Menu, Settings } from 'lucide-react';
import SettingsModal from '../SettingsModal';
import Sidebar from '../Sidebar';
import styles from './Layout.module.scss';
import type { ChatSession } from '../../types/chat';

interface LayoutProps {
    children: React.ReactNode;
    onNewChat: () => void;
    // Sidebar props
    sessions: ChatSession[];
    currentSessionId: string | null;
    onLoadSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    onNewChat,
    sessions,
    currentSessionId,
    onLoadSession,
    onDeleteSession
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onLoadSession={onLoadSession}
                onNewChat={onNewChat}
                onDeleteSession={onDeleteSession}
            />

            <div className={styles.contentWrapper}>
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                <header className={styles.header}>
                    <div className={styles.brand}>
                        <button onClick={() => setIsSidebarOpen(true)} className={styles.menuIconButton}>
                            <Menu size={24} className={styles.menuIcon} />
                        </button>
                        <span className={styles.logo}>ChatMan AI</span>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.iconBtn}
                            onClick={() => setIsSettingsOpen(true)}
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        {/* <button className={styles.newChatBtn} onClick={onNewChat} aria-label="New Chat">
                            <Plus size={20} />
                            <span className={styles.btnText}>New Chat</span>
                        </button> */}
                    </div>
                </header>

                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
