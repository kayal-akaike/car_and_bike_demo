import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Message, MessageContent, ToolResult } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [expandedTools, setExpandedTools] = React.useState<Set<number>>(new Set());

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getIntentInfo = (intent: string) => {
    const intentMap = {
      greeting: { 
        color: 'from-blue-400 to-blue-600', 
        icon: '👋', 
        label: 'Greeting' 
      },
      car_recommendation: { 
        color: 'from-green-400 to-green-600', 
        icon: '🚗', 
        label: 'Car Info' 
      },
      bike_recommendation: { 
        color: 'from-purple-400 to-purple-600', 
        icon: '🏍️', 
        label: 'Bike Info' 
      },
      car_comparison: { 
        color: 'from-orange-400 to-orange-600', 
        icon: '⚖️', 
        label: 'Car Comparison' 
      },
      bike_comparison: { 
        color: 'from-pink-400 to-pink-600', 
        icon: '🔄', 
        label: 'Bike Comparison' 
      },
      find_ev_charger_location: { 
        color: 'from-yellow-400 to-orange-500', 
        icon: '⚡', 
        label: 'EV Charging' 
      },
      general_qna: { 
        color: 'from-gray-400 to-gray-600', 
        icon: '💬', 
        label: 'General' 
      },
      book_ride: { 
        color: 'from-red-400 to-red-600', 
        icon: '📅', 
        label: 'Booking' 
      },
      default: { 
        color: 'from-purple-400 to-blue-500', 
        icon: '🤖', 
        label: 'Assistant' 
      }
    };
    return intentMap[intent as keyof typeof intentMap] || intentMap.default;
  };

  const toggleTool = (index: number) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTools(newExpanded);
  };

  const renderToolResult = (tool: ToolResult, index: number) => {
    const isExpanded = expandedTools.has(index);
    const statusIcon = tool.status === 1 ? '✅' : '❌';

    return (
      <div key={index} className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <button
          onClick={() => toggleTool(index)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <span className="text-xs font-medium text-gray-700">
            {statusIcon} Tool: {tool.name}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isExpanded && (
          <div className="px-3 py-2 border-t border-gray-200 space-y-2">
            {tool.input && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Input:</p>
                <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                  {JSON.stringify(tool.input, null, 2)}
                </pre>
              </div>
            )}
            {tool.output && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Output:</p>
                <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto max-h-32">
                  {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const parseMarkdown = (text: string) => {
    // Parse markdown formatting
    let parsed = text;
    
    // Bold text: **text** or __text__
    parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
    parsed = parsed.replace(/__(.+?)__/g, '<strong class="font-bold">$1</strong>');
    
    // Italic: *text* or _text_
    parsed = parsed.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    parsed = parsed.replace(/_(.+?)_/g, '<em class="italic">$1</em>');
    
    // Code: `code`
    parsed = parsed.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>');
    
    return parsed;
  };

  const renderContent = () => {
    const content = message.content;
    
    // Handle string content
    if (typeof content === 'string') {
      // Parse markdown images ![alt](url) and render them as actual images
      const parts = [];
      let lastIndex = 0;
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        // Add text before the image
        if (match.index > lastIndex) {
          const textBefore = content.substring(lastIndex, match.index);
          textBefore.split('\n').forEach((line, idx) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              // Check if it's a header
              if (trimmedLine.startsWith('###')) {
                const headerText = trimmedLine.replace(/^###\s*/, '');
                parts.push(
                  <h3 key={`h3-${lastIndex}-${idx}`} className="text-lg font-bold mt-3 mb-2 text-gray-900">
                    {headerText}
                  </h3>
                );
              } else if (trimmedLine.startsWith('##')) {
                const headerText = trimmedLine.replace(/^##\s*/, '');
                parts.push(
                  <h2 key={`h2-${lastIndex}-${idx}`} className="text-xl font-bold mt-3 mb-2 text-gray-900">
                    {headerText}
                  </h2>
                );
              } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                // List item
                const itemText = trimmedLine.replace(/^[-*]\s*/, '');
                parts.push(
                  <div key={`li-${lastIndex}-${idx}`} className="flex items-start ml-2 my-1">
                    <span className="mr-2">•</span>
                    <span 
                      className="text-sm font-medium flex-1"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(itemText) }}
                    />
                  </div>
                );
              } else {
                // Regular paragraph
                parts.push(
                  <p 
                    key={`text-${lastIndex}-${idx}`} 
                    className="text-sm font-medium my-1"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }}
                  />
                );
              }
            }
          });
        }
        
        // Add the image
        parts.push(
          <img 
            key={`img-${match.index}`}
            src={match[2]} 
            alt={match[1]} 
            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm my-2"
            onError={(e) => {
              // Hide broken images
              e.currentTarget.style.display = 'none';
            }}
          />
        );
        
        lastIndex = imageRegex.lastIndex;
      }
      
      // Add remaining text after the last image
      if (lastIndex < content.length) {
        const remainingText = content.substring(lastIndex);
        remainingText.split('\n').forEach((line, idx) => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            // Check if it's a header
            if (trimmedLine.startsWith('###')) {
              const headerText = trimmedLine.replace(/^###\s*/, '');
              parts.push(
                <h3 key={`h3-end-${idx}`} className="text-lg font-bold mt-3 mb-2 text-gray-900">
                  {headerText}
                </h3>
              );
            } else if (trimmedLine.startsWith('##')) {
              const headerText = trimmedLine.replace(/^##\s*/, '');
              parts.push(
                <h2 key={`h2-end-${idx}`} className="text-xl font-bold mt-3 mb-2 text-gray-900">
                  {headerText}
                </h2>
              );
            } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
              // List item
              const itemText = trimmedLine.replace(/^[-*]\s*/, '');
              parts.push(
                <div key={`li-end-${idx}`} className="flex items-start ml-2 my-1">
                  <span className="mr-2">•</span>
                  <span 
                    className="text-sm font-medium flex-1"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(itemText) }}
                  />
                </div>
              );
            } else {
              // Regular paragraph
              parts.push(
                <p 
                  key={`text-end-${idx}`} 
                  className={`${idx > 0 ? 'mt-1' : ''} text-sm font-medium`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }}
                />
              );
            }
          }
        });
      }
      
      return parts.length > 0 ? parts : content.split('\n').map((line, index) => (
        <p 
          key={index} 
          className={`${index > 0 ? 'mt-2' : ''} text-sm font-medium`}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }}
        />
      ));
    }

    // Handle rich content
    const richContent = content as MessageContent;
    
    // Parse the text content with markdown
    const parseTextContent = (text: string) => {
      const parts = [];
      let lastIndex = 0;
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = imageRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const textBefore = text.substring(lastIndex, match.index);
          parts.push({ type: 'text', content: textBefore });
        }
        parts.push({ type: 'image', alt: match[1], src: match[2] });
        lastIndex = imageRegex.lastIndex;
      }
      
      if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.substring(lastIndex) });
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', content: text }];
    };
    
    const renderParsedText = (text: string) => {
      return text.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;
        
        if (trimmedLine.startsWith('###')) {
          const headerText = trimmedLine.replace(/^###\s*/, '');
          return (
            <h3 key={`h3-${index}`} className="text-lg font-bold mt-3 mb-2 text-gray-900">
              {headerText}
            </h3>
          );
        } else if (trimmedLine.startsWith('##')) {
          const headerText = trimmedLine.replace(/^##\s*/, '');
          return (
            <h2 key={`h2-${index}`} className="text-xl font-bold mt-3 mb-2 text-gray-900">
              {headerText}
            </h2>
          );
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const itemText = trimmedLine.replace(/^[-*]\s*/, '');
          return (
            <div key={`li-${index}`} className="flex items-start ml-2 my-1">
              <span className="mr-2">•</span>
              <span 
                className="text-sm font-medium flex-1"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(itemText) }}
              />
            </div>
          );
        } else {
          return (
            <p 
              key={`text-${index}`} 
              className={`${index > 0 ? 'mt-1' : ''} text-sm font-medium`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }}
            />
          );
        }
      }).filter(Boolean);
    };
    
    return (
      <div className="space-y-3">
        {/* Show tool results FIRST (before message text) - like Streamlit */}
        {richContent.toolResults && richContent.toolResults.length > 0 && (
          <div className="space-y-2 mb-3">
            {richContent.toolResults.map((tool, index) => renderToolResult(tool, index))}
          </div>
        )}
        
        {richContent.text && (
          <div className="text-sm font-medium space-y-1">
            {parseTextContent(richContent.text).map((part, idx) => {
              if (part.type === 'image') {
                return (
                  <img 
                    key={`img-${idx}`}
                    src={part.src} 
                    alt={part.alt} 
                    className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm my-2"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                );
              } else if (part.content) {
                return <div key={`text-${idx}`}>{renderParsedText(part.content)}</div>;
              }
              return null;
            })}
          </div>
        )}
        
        {richContent.image && (
          <img 
            src={richContent.image} 
            alt="Content" 
            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
          />
        )}
        
        {richContent.data && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs">
            <pre className="overflow-x-auto">
              {JSON.stringify(richContent.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} mb-4`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {/* Avatar */}
      <motion.div 
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg ${
          isUser 
            ? 'bg-[#f2e500] border-[#d9cf00] text-[#46443f]' 
            : 'bg-[#46443f] border-gray-500 text-white'
        }`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {isUser ? (
          <User size={18} className="drop-shadow-sm" />
        ) : (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Bot size={18} className="drop-shadow-sm" />
          </motion.div>
        )}
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[280px] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <motion.div 
          className={`
            relative px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border
            ${isUser 
              ? 'bg-[#f2e500] text-[#46443f] border-[#d9cf00] rounded-br-md' 
              : 'bg-white/90 text-gray-800 border-gray-200/50 rounded-bl-md'
            }
          `}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Sparkle effect for assistant messages */}
          {!isUser && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-[#f2e500] rounded-full flex items-center justify-center shadow-sm"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={8} className="text-[#46443f]" />
            </motion.div>
          )}

          {/* Message content */}
          <div className={`${isUser ? 'text-[#46443f]' : 'text-gray-800'} leading-relaxed`}>
            {renderContent()}
          </div>

          {/* Tail/pointer */}
          <div className={`absolute top-4 ${isUser ? 'right-full' : 'left-full'}`}>
            <div className={`
              w-0 h-0 border-solid 
              ${isUser 
                ? 'border-l-8 border-l-[#f2e500] border-t-8 border-t-transparent border-b-8 border-b-transparent' 
                : 'border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
              }
            `} />
          </div>
        </motion.div>

        {/* Message metadata */}
        <div className={`flex items-center space-x-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatTime(message.timestamp)}</span>
          </div>
          
          {/* Intent badge for assistant messages */}
          {!isUser && message.intent && (
            <motion.div 
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                bg-gradient-to-r ${getIntentInfo(message.intent).color} text-white shadow-sm
              `}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <span>{getIntentInfo(message.intent).icon}</span>
              <span>{getIntentInfo(message.intent).label}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;