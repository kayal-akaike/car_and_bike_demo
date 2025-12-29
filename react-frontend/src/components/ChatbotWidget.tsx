import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';

interface ChatbotWidgetProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onClick, isOpen }) => {
  // Don't render the widget when chat is open
  if (isOpen) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 2 }}
    >
      <motion.button
        onClick={onClick}
        className="relative w-16 h-16 rounded-full overflow-hidden group bg-[#f2e500] hover:bg-[#d9cf00] text-[#46443f] shadow-2xl transition-all duration-300 border-4 border-white/20"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        {/* Sparkle effects */}
        <>
          <motion.div
            className="absolute top-1 right-1 w-1 h-1 bg-[#46443f] rounded-full"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute bottom-2 left-2 w-1 h-1 bg-[#46443f] rounded-full"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </>

        {/* Icon container */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="relative">
            <MessageCircle size={24} className="stroke-current text-[#46443f]" />
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-[#46443f] rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Pulse rings */}
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#f2e500]/50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#46443f]/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </>
      </motion.button>

      {/* Enhanced Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 3, duration: 0.6, type: "spring" }}
        className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4"
      >
        <div className="bg-white px-4 py-3 whitespace-nowrap shadow-xl border-2 border-[#f2e500] rounded-lg">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-[#f2e500]" />
            <span className="text-xs font-semibold text-[#46443f]">Need help? Let's chat!</span>
          </div>
          <div className="absolute left-full top-1/2 transform -translate-y-1/2">
            <div className="border-l-8 border-l-white border-t-8 border-t-transparent border-b-8 border-b-transparent filter drop-shadow-sm"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatbotWidget;