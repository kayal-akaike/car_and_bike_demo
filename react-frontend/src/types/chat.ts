export interface ToolResult {
  name: string;
  status: number;
  input?: any;
  output?: any;
  metadata?: any;
}

export interface MessageContent {
  text?: string;
  image?: string;
  data?: any;
  toolResults?: ToolResult[];
}

export interface Message {
  id: string;
  content: string | MessageContent;
  role: 'user' | 'assistant';
  timestamp: Date;
  intent?: string;
  toolsUsed?: string[];
}

export interface ChatResponse {
  message: string;
  intent?: string;
  tools_used?: string[];
  tool_results?: ToolResult[];
}