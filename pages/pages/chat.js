'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User, Loader2, History, X, MessageSquare } from 'lucide-react';

export default function ChatPage() {
    const [sessions, setSessions] = useState([
        {
            id: '1',
            title: 'New Chat',
            messages: [
                {
                    id: '1',
                    content: "Hello! I'm your AI assistant. How can I help you today?",
                    role: 'assistant'
                }
            ],
            lastUpdated: new Date()
        }
    ]);
    const [currentSessionId, setCurrentSessionId] = useState('1');
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef(null);

    const currentSession = sessions.find(s => s.id === currentSessionId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            content: input,
            role: 'user'
        };

        setSessions(prev => prev.map(session =>
            session.id === currentSessionId
                ? {
                    ...session,
                    messages: [...session.messages, userMessage],
                    lastUpdated: new Date()
                }
                : session
        ));

        setInput('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: "I'm a demo chat interface. While I can't actually process your messages, I can show you how the interface would work!",
                role: 'assistant'
            };

            setSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? {
                        ...session,
                        messages: [...session.messages, aiMessage],
                        lastUpdated: new Date()
                    }
                    : session
            ));
            setIsLoading(false);
        }, 1000);
    };

    const startNewChat = () => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [
                {
                    id: '1',
                    content: "Hello! I'm your AI assistant. How can I help you today?",
                    role: 'assistant'
                }
            ],
            lastUpdated: new Date()
        };
        setSessions(prev => [...prev, newSession]);
        setCurrentSessionId(newSession.id);
    };

    return (

        <div className="flex h-screen bg-gray-50">

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-gray-900 transition-all duration-300 overflow-hidden flex flex-col`}>
                <div className="p-4 border-b border-gray-700">
                    <button
                        onClick={startNewChat}
                        className="w-full bg-gray-700 text-white rounded-lg p-3 flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors"
                    >
                        <MessageSquare size={20} />
                        <span>New Chat</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()).map(session => (
                        <button
                            key={session.id}
                            onClick={() => setCurrentSessionId(session.id)}
                            className={`w-full p-4 text-left hover:bg-gray-800 transition-colors ${session.id === currentSessionId ? 'bg-gray-800' : ''
                                } text-gray-300`}
                        >
                            <div className="flex items-center space-x-3">
                                <MessageSquare size={16} />
                                <span className="truncate">{session.messages[1]?.content.slice(0, 30) || 'New Chat'}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(session.lastUpdated).toLocaleDateString()}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="mb-6">
                    <nav className="bg-white shadow-md">
                        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                            <div className="relative flex items-center justify-between h-16">
                                {/* <!-- Logo on the far left --> */}
                                <div className="flex-shrink-0">
                                    <img className="block lg:hidden h-20 w-auto" src="/jewellista.png" alt="Your Logo" />
                                    <img className="hidden lg:block h-20 w-auto" src="/jewellista.png" alt="Your Logo" />
                                </div>
                                {/* <!-- Navigation links and buttons aligned to the far right -->  */}
                                <div className="flex-1 flex justify-end items-center">
                                    <div className="flex space-x-4">
                                        <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                                        <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Overview</a>
                                        <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Reports</a>
                                        <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Settings</a>
                                    </div>
                                    {/* <!-- Optional right-side button --> */}
                                    <button className="bg-white p-1 rounded-full text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800">
                                        <span className="sr-only">View notifications</span>
                                        {/* <!-- Icon --> */}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Header */}
                <div className="bg-white border-b p-4 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <History size={20} />}
                    </button>
                    <h1 className="text-lg font-semibold">Chat History</h1>
                    <div className="w-8" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentSession?.messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${message.role === 'assistant' ? 'bg-white' : 'bg-blue-50'
                                } p-4 rounded-lg max-w-3xl mx-auto`}
                        >
                            <div className={`p-2 rounded-full ${message.role === 'assistant' ? 'bg-green-100' : 'bg-blue-100'
                                }`}>
                                {message.role === 'assistant' ? (
                                    <Bot size={20} className="text-green-600" />
                                ) : (
                                    <User size={20} className="text-blue-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 leading-relaxed">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <div className="border-t bg-white p-4">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex space-x-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <SendHorizontal size={20} />
                            <span>Send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}