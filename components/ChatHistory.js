import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, MessageSquare, Trash2, Edit2, Check } from 'lucide-react';
import Image from 'next/image';

export default function ChatHistory({ onSelectChat, currentChatId, onNewChat, onDeleteChat }) {
    const [chatHistory, setChatHistory] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [editingTitle, setEditingTitle] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const titleInputRef = useRef(null);

    useEffect(() => {
        loadChatHistory();
    }, [currentChatId]);

    const loadChatHistory = () => {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        setChatHistory(history);
    };

    const handleDelete = async (chatId) => {
        await onDeleteChat(chatId);
        loadChatHistory();
    };

    const updateChatTitle = (chatId, newTitle) => {
        if (!newTitle.trim()) return;
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const updatedHistory = history.map(chat => {
            if (chat.id === chatId) {
                return { ...chat, title: newTitle.trim() };
            }
            return chat;
        });
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        loadChatHistory();
        setEditingTitle(null);
    };

    return (
        <div className={`relative transition-all duration-300 ${
            isCollapsed ? 'w-16' : 'w-64'
        } bg-gray-50 border-r border-gray-200`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm z-10"
            >
                {isCollapsed ? 
                    <ChevronRight className="h-4 w-4 text-gray-600" /> : 
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                }
            </button>

            <div className="p-4">
                <button
                    onClick={onNewChat}
                    className={`w-full flex items-center justify-center gap-2 p-2 bg-[#C1A875] text-white rounded-lg hover:bg-[#B09865] transition-colors mb-4 ${
                        isCollapsed ? 'px-2' : 'px-4'
                    }`}
                >
                    <PlusCircle className="h-5 w-5" />
                    {!isCollapsed && <span>สร้างแชทใหม่</span>}
                </button>

                {!isCollapsed && (
                    <h2 className="text-lg font-semibold mb-4">ประวัติการสนทนา</h2>
                )}

                <div className="space-y-2">
                    {chatHistory.map((chat) => (
                        <div
                            key={chat.id}
                            className={`group relative ${
                                currentChatId === chat.id ? 'bg-[#F5EFE3]' : ''
                            } rounded-lg hover:bg-gray-100 transition-colors`}
                        >
                            {editingTitle === chat.id && !isCollapsed ? (
                                <div className="p-2">
                                    <input
                                        ref={titleInputRef}
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#C1A875]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && editTitle.trim()) {
                                                updateChatTitle(chat.id, editTitle);
                                            } else if (e.key === 'Escape') {
                                                setEditingTitle(null);
                                            }
                                        }}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={() => onSelectChat(chat.id)}
                                    className={`w-full text-left ${isCollapsed ? 'p-2' : 'p-3'}`}
                                >
                                    {isCollapsed ? (
                                        <div className="flex justify-center">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium truncate pr-16">
                                                {chat.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(chat.timestamp).toLocaleDateString('th-TH')}
                                            </p>
                                        </>
                                    )}
                                </button>
                            )}
                            {!isCollapsed && !editingTitle && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingTitle(chat.id);
                                            setEditTitle(chat.title);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(chat.id);
                                        }}
                                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}