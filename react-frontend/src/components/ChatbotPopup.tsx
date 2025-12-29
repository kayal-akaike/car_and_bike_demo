import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Minimize2, Bot, Sparkles, X, Settings, ChevronDown } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { useChatApi } from '../hooks/useChatApi';
import { Message } from '../types/chat';



interface ChatbotPopupProps {
  onClose: () => void;
}

const ChatbotPopup: React.FC<ChatbotPopupProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! 👋 I'm your Mahindra vehicle assistant. I can help you find the perfect car or bike, get insurance quotes, locate EV charging stations, and more. What are you looking for today?",
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude Sonnet 4.5');
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, isLoading, error } = useChatApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');

    try {
      const response = await sendMessage(messageToSend, messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.tool_results && response.tool_results.length > 0 
          ? {
              text: response.message,
              toolResults: response.tool_results
            }
          : response.message,
        role: 'assistant',
        timestamp: new Date(),
        intent: response.intent,
        toolsUsed: response.tools_used,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Vehicle loan info", icon: "💰", color: "from-green-400 to-blue-500" },
    { text: "RC transfer", icon: "📄", color: "from-purple-400 to-pink-500" },
    { text: "Insurance help", icon: "🛡️", color: "from-blue-400 to-purple-500" },
    { text: "EV locations", icon: "⚡", color: "from-yellow-400 to-orange-500" }
  ];

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)]"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? 64 : 600
      }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Main chat container with glassmorphism */}
      <div className="relative h-full flex flex-col overflow-hidden shadow-2xl">
        {/* Glass background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(242,229,0,0.2)]" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f2e500]/5 via-transparent to-[#46443f]/5 rounded-2xl" />
        
        {/* Content wrapper */}
        <div className="relative h-full flex flex-col overflow-hidden rounded-2xl">
        
        {/* Enhanced Header with Glass Effect */}
        <motion.div 
          className="relative bg-gradient-to-r from-[#46443f]/95 to-[#36342f]/95 backdrop-blur-md px-5 py-3 cursor-pointer border-b border-white/20"
          onClick={() => setIsMinimized(!isMinimized)}
          whileHover={{ scale: 1.01, opacity: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-8 h-8 bg-[#f2e500] rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Bot size={16} className="text-[#46443f]" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-sm">Mahindra Assistant</h3>
                <div className="flex items-center space-x-1">
                  <motion.div 
                    className="w-1.5 h-1.5 bg-[#f2e500] rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-white/90 text-[10px] font-medium">Always here to help</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minimize2 size={10} className="text-white" />
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close chat"
              >
                <X size={10} className="text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Chat content - only visible when not minimized */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              className="flex flex-col flex-1 relative"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Messages area with glass scrollability */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent via-white/30 to-transparent backdrop-blur-sm min-h-0" style={{ maxHeight: '400px' }}>
                {messages.length === 1 && (
                  <motion.div 
                    className="mb-6 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="text-center mb-3">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-[#f2e500] to-[#d9cf00] rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-3 border-2 border-white"
                        animate={{ 
                          y: [0, -8, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles size={24} className="text-[#46443f]" />
                      </motion.div>
                      <p className="text-gray-700 text-sm font-semibold mb-1">
                        How can I help you today?
                      </p>
                      <p className="text-gray-500 text-xs">
                        Choose a quick action below
                      </p>
                    </div>

                    {/* Enhanced Quick action cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={action.text}
                          onClick={() => setInputValue(action.text)}
                          className="group relative bg-white hover:bg-gradient-to-br hover:from-[#f2e500] hover:to-[#d9cf00] p-4 rounded-xl border-2 border-gray-200 hover:border-[#f2e500] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ 
                            delay: 0.6 + index * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Animated background shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                          
                          <div className="relative flex flex-col items-center text-center space-y-2">
                            <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                              {action.icon}
                            </div>
                            <span className="text-xs font-semibold text-gray-700 group-hover:text-[#46443f] transition-colors leading-tight">
                              {action.text}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}

                {isLoading && <TypingIndicator />}
                
                {error && (
                  <motion.div 
                    className="text-center p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
                      <p className="text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Configuration Panel - Slides from Top */}
              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ y: -300, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -300, opacity: 0 }}
                    transition={{ duration: 0.3, type: "spring", damping: 20 }}
                    className="absolute top-0 left-0 right-0 z-30 bg-white border-b-2 border-[#f2e500] shadow-xl"
                  >
                    {/* Header */}
                    <div className="bg-[#f2e500] px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Settings size={14} className="text-[#46443f]" />
                        <h3 className="text-xs font-bold text-[#46443f]">Configuration Settings</h3>
                      </div>
                      <button
                        onClick={() => setShowConfig(false)}
                        className="w-5 h-5 bg-white/30 hover:bg-white/50 text-[#46443f] rounded-full flex items-center justify-center transition-all duration-200"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-3">
                      {/* Model Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">AI Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-gray-50 text-gray-800 text-xs font-medium rounded-lg px-2.5 py-2 border border-gray-300 focus:border-[#f2e500] focus:ring-1 focus:ring-[#f2e500]/20 focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="Claude Sonnet 4.5">Claude Sonnet 4.5</option>
                          <option value="GPT-4">GPT-4</option>
                          <option value="GPT-4 Turbo">GPT-4 Turbo</option>
                          <option value="Groq Llama">Groq Llama</option>
                          <option value="Mixtral 8x7B">Mixtral 8x7B</option>
                          <option value="Gemini Pro">Gemini Pro</option>
                        </select>
                      </div>

                      {/* Temperature Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-700">Temperature</label>
                          <span className="text-xs font-mono text-[#46443f] bg-[#f2e500]/30 px-2 py-0.5 rounded font-bold">
                            {temperature.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.01"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded appearance-none cursor-pointer slider-thumb"
                          style={{
                            background: `linear-gradient(to right, #60a5fa 0%, #f2e500 50%, #f87171 100%)`
                          }}
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                          <span>Precise</span>
                          <span>Balanced</span>
                          <span>Creative</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setShowConfig(false)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            console.log('Settings saved:', { selectedModel, temperature });
                            setShowConfig(false);
                          }}
                          className="px-4 py-1.5 text-xs font-bold text-[#46443f] bg-[#f2e500] hover:bg-[#d9cf00] rounded-lg shadow-sm transition-all duration-200"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Input area with Glass Effect */}
              <div className="relative pt-4 pb-3 px-3 bg-white/80 backdrop-blur-lg border-t border-white/30">
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#f2e500]/5 to-transparent pointer-events-none" />
                <div className="space-y-3.5">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about vehicles, loans, insurance..."
                      className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-lg px-3 py-2 pr-10 border border-gray-300 focus:border-[#f2e500] focus:ring-2 focus:ring-[#f2e500]/20 focus:outline-none transition-all duration-200 shadow-sm text-sm"
                      disabled={isLoading}
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-[#f2e500] hover:bg-[#d9cf00] text-[#46443f] rounded-lg flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                      whileHover={{ scale: inputValue.trim() && !isLoading ? 1.05 : 1 }}
                      whileTap={{ scale: inputValue.trim() && !isLoading ? 0.95 : 1 }}
                    >
                      <Send size={14} />
                    </motion.button>
                  </div>
                  
                  {/* Footer with Settings Button */}
                  <div className="flex items-center justify-between pt-0.5">
                    <motion.p 
                      className="text-[10px] text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      Powered by AKAIKE AI • Adopt AI
                    </motion.p>
                    
                    <motion.button
                      onClick={() => setShowConfig(!showConfig)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                        showConfig 
                          ? 'bg-[#f2e500] text-[#46443f]' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Model Settings"
                    >
                      <Settings size={12} className={showConfig ? 'rotate-90' : ''} style={{ transition: 'transform 0.3s' }} />
                      <span className="text-[10px] font-semibold">Config</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatbotPopup;