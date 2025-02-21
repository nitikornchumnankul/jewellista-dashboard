'use client';

import Layout from '../../components/Layout';
import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User, BarChart2, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHistory from '../../components/ChatHistory';
import Image from 'next/image';

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);
    const messagesEndRef = useRef(null);

    const loadChatMessages = (chatId) => {
        setMessages([]); // เคลียร์ข้อความเก่าก่อน
        setTimeout(() => {
            const savedMessages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
            setMessages(savedMessages.map((msg, index) => ({
                ...msg,
                animate: true,
                delay: index * 0.1 // เพิ่มดีเลย์แบบไล่ระดับ
            })));
        }, 200);
    };

    useEffect(() => {
        if (currentChatId) {
            loadChatMessages(currentChatId);
        }
    }, [currentChatId]);

    const saveChatHistory = (messages) => {
        if (!currentChatId) return;

        // บันทึกข้อความ
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));

        // อัพเดทประวัติแชท
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const existingChatIndex = history.findIndex(chat => chat.id === currentChatId);
        const chatTitle = messages[1]?.content.slice(0, 30) || 'การสนทนาใหม่';

        if (existingChatIndex > -1) {
            history[existingChatIndex].title = chatTitle;
            history[existingChatIndex].timestamp = Date.now();
        } else {
            history.unshift({
                id: currentChatId,
                title: chatTitle,
                timestamp: Date.now()
            });
        }

        localStorage.setItem('chatHistory', JSON.stringify(history));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            content: input,
            role: 'user'
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        // บันทึกข้อความทันทีที่ผู้ใช้ส่ง
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(newMessages));

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            setIsTyping(false);

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: data.reply,
                role: 'assistant'
            };

            const finalMessages = [...newMessages, aiMessage];
            setMessages(finalMessages);
            
            // บันทึกข้อความหลังจากได้รับคำตอบ
            localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(finalMessages));
            
            // สรุปชื่อแชทหลังจากมีข้อความ 2-3 ข้อความ
            if (finalMessages.filter(m => m.role === 'user').length === 2) {
                generateChatTitle(finalMessages);
            }
        } catch (error) {
            console.error('Error:', error);
            setIsTyping(false);
            
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                content: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ",
                role: 'assistant'
            };
            
            const finalMessages = [...newMessages, errorMessage];
            setMessages(finalMessages);
            localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(finalMessages));
        }
    };

    const handleNewChat = () => {
        const newChatId = Date.now().toString();
        
        const newChat = {
            id: newChatId,
            title: "การสนทนาใหม่",
            timestamp: new Date().toISOString()
        };
        
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const updatedHistory = [newChat, ...history];
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

        setCurrentChatId(newChatId);
        
        // เคลียร์ข้อความก่อนเพื่อให้เกิดอนิเมชั่นใหม่
        setMessages([]);
        
        // เพิ่มข้อความต้อนรับพร้อมดีเลย์
        setTimeout(() => {
            setMessages([{
                id: '1',
                content: "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?",
                role: 'assistant',
                animate: true // เพิ่ม flag สำหรับอนิเมชั่น
            }]);
        }, 200);

        localStorage.setItem(`chat_${newChatId}`, JSON.stringify([{
            id: '1',
            content: "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?",
            role: 'assistant'
        }]));
    };

    const handleDeleteChat = async (chatId) => {
        // ลบข้อความของแชทนั้น
        localStorage.removeItem(`chat_${chatId}`);

        // อัพเดทประวัติแชท
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const updatedHistory = history.filter(chat => chat.id !== chatId);
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

        // ถ้าลบแชทปัจจุบัน ให้สร้างแชทใหม่
        if (chatId === currentChatId) {
            await handleNewChat();
        }

        // ส่ง Promise กลับเพื่อให้รู้ว่าการลบเสร็จสมบูรณ์
        return Promise.resolve();
    };

    // เพิ่มฟังก์ชันสำหรับบันทึกข้อความ
    const saveChatMessages = (chatId, messages) => {
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
        
        // อัพเดทชื่อแชทจากข้อความแรกของผู้ใช้
        const userMessage = messages.find(m => m.role === 'user');
        if (userMessage) {
            const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            const updatedHistory = history.map(chat => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        title: userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : '')
                    };
                }
                return chat;
            });
            localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        }
    };

    // เพิ่มฟังก์ชันสำหรับอัพเดทชื่อแชท
    const updateChatTitle = (chatId, newTitle) => {
        if (!newTitle.trim()) return; // ไม่อนุญาตให้ชื่อว่างเปล่า
        
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const updatedHistory = history.map(chat => {
            if (chat.id === chatId) {
                return { ...chat, title: newTitle.trim() };
            }
            return chat;
        });
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    };

    // เพิ่มฟังก์ชันสำหรับสรุปชื่อแชทอัตโนมัติ
    const generateChatTitle = async (messages) => {
        try {
            const userMessages = messages
                .filter(m => m.role === 'user')
                .map(m => m.content)
                .join(' ');

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `สรุปหัวข้อการสนทนานี้สั้นๆ ไม่เกิน 5 คำ จากข้อความต่อไปนี้: ${userMessages}`,
                    type: 'summary'
                }),
            });

            const data = await response.json();
            if (data.reply) {
                updateChatTitle(currentChatId, data.reply);
            }
        } catch (error) {
            console.error('Error generating title:', error);
        }
    };

    // โหลดข้อความเมื่อเปลี่ยนแชท
    useEffect(() => {
        if (currentChatId) {
            const savedMessages = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '[]');
            setMessages(savedMessages);
        }
    }, [currentChatId]);

    // เพิ่ม cleanup function เมื่อออกจากหน้า
    useEffect(() => {
        return () => {
            setMessages([]);
            setCurrentChatId(null);
            setIsTyping(false);
        };
    }, []);

    return (
        <Layout>
            <div className="flex h-[calc(100vh-5rem)]">
                <ChatHistory 
                    onSelectChat={setCurrentChatId}
                    currentChatId={currentChatId}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                />
                
                <div className="flex-1 flex flex-col pl-4 relative">
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto pt-4 pb-24">
                            <AnimatePresence mode="wait">
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ 
                                            opacity: 0, 
                                            y: 20,
                                            scale: 0.95
                                        }}
                                        animate={{ 
                                            opacity: 1, 
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                delay: message.delay || 0,
                                                duration: 0.4,
                                                ease: "easeOut"
                                            }
                                        }}
                                        exit={{ 
                                            opacity: 0,
                                            scale: 0.95,
                                            transition: {
                                                duration: 0.2,
                                                ease: "easeIn"
                                            }
                                        }}
                                        className={`px-4 py-6 rounded-lg mb-2 ${
                                            message.role === 'assistant' 
                                                ? 'bg-gray-50' 
                                                : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <motion.div 
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ 
                                                    scale: 1, 
                                                    opacity: 1,
                                                    transition: {
                                                        delay: (message.delay || 0) + 0.1,
                                                        duration: 0.3
                                                    }
                                                }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    message.role === 'assistant' 
                                                    ? 'bg-white' 
                                                    : 'bg-gray-600'
                                                }`}
                                            >
                                                {message.role === 'assistant' 
                                                    ? <Image 
                                                        src="/jewellista.png"
                                                        alt="Jewelista Assistant"
                                                        width={32}
                                                        height={32}
                                                        className="object-contain"
                                                      />
                                                    : <User className="h-5 w-5 text-white" />
                                                }
                                            </motion.div>
                                            <div className="flex-1">
                                                <motion.p 
                                                    className="text-sm text-gray-500 mb-1"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ 
                                                        opacity: 1,
                                                        transition: {
                                                            delay: (message.delay || 0) + 0.2
                                                        }
                                                    }}
                                                >
                                                    {message.role === 'assistant' ? 'Jewelista Assistant' : 'You'}
                                                </motion.p>
                                                <motion.div 
                                                    className="prose prose-slate max-w-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ 
                                                        opacity: 1,
                                                        transition: {
                                                            delay: (message.delay || 0) + 0.3
                                                        }
                                                    }}
                                                >
                                                    {message.content}
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="px-4 py-6 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                            <Image 
                                                src="/jewellista.png"
                                                alt="Jewelista Assistant"
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* ส่วนกล่องข้อความ */}
                    <div className="sticky bottom-0 bg-white pt-4 pb-8">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSubmit} className="flex items-center bg-white border rounded-xl shadow-sm">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="พิมพ์ข้อความของคุณที่นี่..."
                                    className="flex-1 px-4 py-4 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="p-2 mr-2 text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <SendHorizontal className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
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