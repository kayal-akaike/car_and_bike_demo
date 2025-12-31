import { useState, useCallback } from 'react';
import axios from 'axios';
import { Message, MessageContent } from '../types/chat';

interface ChatApiResponse {
  message: string;
  intent?: string;
  tools_used?: string[];
  tool_results?: Array<{
    name: string;
    status: number;
    input?: any;
    output?: any;
    metadata?: any;
  }>;
  conversation_id?: string;
}

interface ChatApiMessage {
  content: string;
  role: string;
  timestamp?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string, 
    conversationHistory: Message[]
  ): Promise<ChatApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert conversation history to API format
      const history: ChatApiMessage[] = conversationHistory.map(msg => {
        // Extract text content from Message (handle both string and MessageContent)
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : (msg.content as MessageContent).text || '';
        
        return {
          content,
          role: msg.role,
          timestamp: msg.timestamp.toISOString(),
        };
      });

      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message,
        conversation_history: history,
      }, {
        timeout: 180000, // 120 second timeout (2 minutes) for complex queries
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data) {
        return response.data;
      } else {
        throw new Error('No response data received');
      }
    } catch (err: any) {
      console.error('Chat API error:', err);
      
      let errorMessage = 'Sorry, I\'m having trouble connecting. Please try again.';
      
      if (err.response?.status === 500) {
        errorMessage = 'I\'m experiencing technical difficulties. Please try again in a moment.';
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the chat service. Please check if the backend is running.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try a shorter message.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendStreamMessage = useCallback(async (
    message: string,
    conversationHistory: Message[],
    onChunk: (chunk: any) => void
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const history: ChatApiMessage[] = conversationHistory.map(msg => {
        // Extract text content from Message (handle both string and MessageContent)
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : (msg.content as MessageContent).text || '';
        
        return {
          content,
          role: msg.role,
          timestamp: msg.timestamp.toISOString(),
        };
      });

      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_history: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              onChunk(data);
            } catch (parseError) {
              console.warn('Failed to parse chunk:', line);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Stream API error:', err);
      setError('Connection error. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    sendStreamMessage,
    isLoading,
    error,
  };
};