'use client';

import Layout from '../../components/Layout';
import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChatHistory from '../../components/ChatHistory';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  // Add new functions for chat management
  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: "การสนทนาใหม่",
      timestamp: Date.now()
    };
    
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    localStorage.setItem('chatHistory', JSON.stringify([newChat, ...history]));
    setCurrentChatId(newChatId);
    setMessages([]);
    setGraphData(null);
  };
  
  const handleDeleteChat = async (chatId) => {
    localStorage.removeItem(`chat_${chatId}`);
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const updatedHistory = history.filter(chat => chat.id !== chatId);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  
    if (chatId === currentChatId) {
      if (updatedHistory.length > 0) {
        setCurrentChatId(updatedHistory[0].id);
      } else {
        handleNewChat();
      }
    }
  };
  
  // Initialize chat on first load
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    if (history.length > 0) {
      setCurrentChatId(history[0].id);
    } else {
      handleNewChat();
    }
  }, []);
  
  const saveChatMessages = (messages) => {
    if (!currentChatId) return;
    localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
    
    // Update chat title from first message
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const updatedHistory = history.map(chat => {
      if (chat.id === currentChatId) {
        const firstUserMessage = messages.find(m => m.role === 'user');
        return {
          ...chat,
          title: firstUserMessage ? firstUserMessage.content.slice(0, 30) : chat.title
        };
      }
      return chat;
    });
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };
  
  // Modify sendMessage function
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!currentChatId) {
      handleNewChat();
    }
  
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
  
    saveChatMessages(newMessages);
  
    try {
      const response = await axios.post('http://localhost:8000/chat', {
        messages: [{ role: 'user', content: input }],
      });
      const assistantMessage = response.data.messages.find(msg => msg.role === 'assistant');
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
  
      const graphMatch = assistantMessage.content.match(/```json\n([\s\S]*?)\n```/);
      if (graphMatch) {
        const graphJson = JSON.parse(graphMatch[1]);
        setGraphData({
          labels: graphJson.labels,
          datasets: [{
            label: 'ปริมาณออเดอร์',
            data: graphJson.data,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
          }],
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.detail || 'Network Error'}` 
      }]);
    }
  };
  
  // Add useEffect for loading messages
  useEffect(() => {
    if (currentChatId) {
      const savedMessages = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '[]');
      setMessages(savedMessages);
    }
  }, [currentChatId]);
  
  // Modify return statement to include ChatHistory
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
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1,
                      transition: {
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
                      message.role === 'assistant' ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'assistant' ? 'bg-white' : 'bg-gray-600'
                      }`}>
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
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">
                          {message.role === 'assistant' ? 'Jewelista Assistant' : 'You'}
                        </p>
                        <div className="prose prose-slate max-w-none">
                          {message.content}
                        </div>
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
  
              {graphData && (
                <div className="mt-4 p-4 border rounded-lg relative">
                  <button
                    onClick={closeGraph}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                  >
                    ปิดกราฟ
                  </button>
                  <Line data={graphData} options={{ 
                    responsive: true, 
                    plugins: { 
                      legend: { position: 'top' }, 
                      title: { display: true, text: 'กราฟปริมาณออเดอร์' } 
                    } 
                  }} />
                </div>
              )}
            </div>
          </div>
  
          <div className="sticky bottom-0 bg-white pt-4 pb-8">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center bg-white border rounded-xl shadow-sm">
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