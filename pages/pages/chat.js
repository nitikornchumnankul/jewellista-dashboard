'use client';

import Layout from '../../components/Layout';
import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            id: '1',
            content: "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?",
            role: 'assistant'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            content: input,
            role: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // จำลองการตอบกลับ
        setTimeout(() => {
            setIsTyping(false);
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: "ขอบคุณสำหรับข้อความ ผมจะช่วยคุณเต็มที่ครับ",
                role: 'assistant'
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 2000);
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-5rem)]">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto pt-4 pb-24">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`px-4 py-6 ${
                                        message.role === 'assistant' ? 'bg-gray-50' : ''
                                    }`}
                                >
                                    <div className="max-w-3xl mx-auto flex gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            message.role === 'assistant' 
                                            ? 'bg-blue-600' 
                                            : 'bg-gray-600'
                                        }`}>
                                            {message.role === 'assistant' 
                                                ? <Bot className="h-5 w-5 text-white" />
                                                : <User className="h-5 w-5 text-white" />
                                            }
                                        </div>
                                        <div className="flex-1 prose prose-slate prose-p:leading-relaxed">
                                            <p className="text-sm text-gray-500 mb-1">
                                                {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                                            </p>
                                            {message.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="px-4 py-6 bg-gray-50"
                                >
                                    <div className="max-w-3xl mx-auto flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Container */}
                <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-transparent">
                    <div className="max-w-3xl mx-auto p-4">
                        <motion.form 
                            onSubmit={handleSubmit} 
                            className="flex gap-3 items-center bg-white border rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            whileTap={{ scale: 0.995 }}
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="พิมพ์ข้อความของคุณที่นี่..."
                                className="flex-1 px-4 py-4 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                            />
                            <motion.button
                                type="submit"
                                disabled={!input.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 mr-2 text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <SendHorizontal className="h-5 w-5" />
                            </motion.button>
                        </motion.form>
                        <p className="text-xs text-center text-gray-400 mt-2">
                            AI Assistant จะพยายามให้ข้อมูลที่ถูกต้องและเป็นประโยชน์ที่สุด
                        </p>
                    </div>
                </div>
            </div>

            {/* Add CSS for typing indicator */}
            <style jsx>{`
                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background-color: #60A5FA;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }
                
                .typing-indicator span:nth-child(1) {
                    animation-delay: -0.32s;
                }
                
                .typing-indicator span:nth-child(2) {
                    animation-delay: -0.16s;
                }
                
                @keyframes bounce {
                    0%, 80%, 100% { 
                        transform: scale(0);
                    }
                    40% { 
                        transform: scale(1);
                    }
                }
            `}</style>
        </Layout>
    );
}