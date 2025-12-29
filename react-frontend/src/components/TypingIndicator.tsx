import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  const dotVariants = {
    initial: { y: 0, scale: 1 },
    animate: { 
      y: [-4, -8, -4], 
      scale: [1, 1.2, 1]
    },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8, x: -20 },
    animate: { 
      opacity: 1, 
      scale: 1,
      x: 0
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 24
      }}
      className="flex justify-start items-end space-x-3 mb-4"
    >
      {/* Enhanced Bot avatar */}
      <motion.div 
        className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mb-2 border-2 border-green-300 shadow-lg relative"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Bot size={18} className="text-white drop-shadow-sm" />
        </motion.div>
        
        {/* Sparkle effect */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles size={8} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Enhanced Typing bubble */}
      <motion.div 
        className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl rounded-bl-md" />
        
        <div className="relative flex items-center space-x-3">
          {/* Enhanced typing text */}
          <motion.span 
            className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Assistant is thinking
          </motion.span>
          
          {/* Beautiful animated dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-sm"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced tail/pointer */}
        <div className="absolute top-4 left-full">
          <div className="w-0 h-0 border-solid border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent filter drop-shadow-sm" />
        </div>

        {/* Subtle pulse animation around bubble */}
        <motion.div
          className="absolute inset-0 border-2 border-purple-300/30 rounded-2xl rounded-bl-md"
          animate={{ 
            scale: [1, 1.02, 1], 
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default TypingIndicator;