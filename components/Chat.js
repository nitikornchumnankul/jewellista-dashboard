import { useState } from 'react';

export default function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi, how can I help you today?", isBot: true },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { id: Date.now(), text: newMessage, isBot: false }]);
        setNewMessage('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Thanks for your message. Our team will get back to you soon.",
                isBot: true
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-0 right-0 w-96 z-20">
            {/* Chat Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full bg-blue-600 text-white px-4 py-3 rounded-t-lg hover:bg-blue-700"
            >
                <span className="font-medium">Chat Support</span>
                <svg
                    className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg">
                    {/* Messages Area */}
                    <div className="h-96 p-4 overflow-y-auto">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
                            >
                                <div
                                    className={`inline-block px-4 py-2 rounded-lg ${
                                        message.isBot
                                            ? 'bg-gray-100 text-gray-800'
                                            : 'bg-blue-600 text-white'
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
} 