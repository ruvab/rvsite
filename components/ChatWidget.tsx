import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, User, Bot, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load conversation history on first open
      loadConversationHistory();
    }
  }, [isOpen]);

  const loadConversationHistory = async () => {
    try {
      // Get session ID from storage
      let sessionId = sessionStorage.getItem('chat_session_id');
      
      if (!sessionId) {
        // No session yet, show welcome message
        if (messages.length === 0) {
          setTimeout(() => {
            addMessage({
              id: 'welcome',
              text: "Hi! 👋 I'm here to help you with any questions about Ruvab IT's services. Ask me about AI solutions, software development, or our tools!",
              sender: 'support',
              timestamp: new Date()
            });
          }, 500);
        }
        return;
      }

      // Fetch conversation history
      const response = await fetch(`/api/chat/conversation/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.messages && data.messages.length > 0) {
          // Load historical messages into state
          const historicalMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.sender === 'user' ? msg.message : (msg.response || ''),
            sender: msg.sender === 'user' ? 'user' : 'support',
            timestamp: new Date(msg.createdAt)
          }));

          // Set historical messages
          setMessages(historicalMessages);
        } else if (messages.length === 0) {
          // No history, show welcome message
          setTimeout(() => {
            addMessage({
              id: 'welcome',
              text: "Hi! 👋 I'm here to help you with any questions about Ruvab IT's services. Ask me about AI solutions, software development, or our tools!",
              sender: 'support',
              timestamp: new Date()
            });
          }, 500);
        }
      } else {
        // Error fetching history, show welcome message if empty
        if (messages.length === 0) {
          setTimeout(() => {
            addMessage({
              id: 'welcome',
              text: "Hi! 👋 I'm here to help you with any questions about Ruvab IT's services. Ask me about AI solutions, software development, or our tools!",
              sender: 'support',
              timestamp: new Date()
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      // Show welcome message on error if empty
      if (messages.length === 0) {
        setTimeout(() => {
          addMessage({
            id: 'welcome',
            text: "Hi! 👋 I'm here to help you with any questions about Ruvab IT's services. Ask me about AI solutions, software development, or our tools!",
            sender: 'support',
            timestamp: new Date()
          });
        }, 500);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    if (!isOpen && message.sender === 'support') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setNewMessage('');
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Generate session ID if not exists (store in sessionStorage)
      let sessionId = sessionStorage.getItem('chat_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('chat_session_id', sessionId);
      }

      // Call AI API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.text,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage({
          id: Math.random().toString(36).substr(2, 9),
          text: data.response,
          sender: 'support',
          timestamp: new Date()
        });
      } else {
        // Fallback to error message
        addMessage({
          id: Math.random().toString(36).substr(2, 9),
          text: "Sorry, I'm having trouble processing your request. Please try again or contact support@ruvabit.com.",
          sender: 'support',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        text: "I'm experiencing technical difficulties. Please contact support@ruvabit.com for assistance.",
        sender: 'support',
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openFullChat = () => {
    window.open('/live-chat', '_blank');
  };

  // Chat button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  // Chat widget when open
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-[400px]'
      } shadow-xl border-0 bg-white`}>
        {/* Header */}
        <CardHeader className="pb-2 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm">Ruvab IT Support</CardTitle>
                <CardDescription className="text-xs text-blue-100">
                  We're here to help!
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                onClick={openFullChat}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                title="Open Full Chat"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="h-72 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-1">
                      {message.sender === 'support' && (
                        <Bot className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-2 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-3 w-3" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="text-sm flex-1 h-9"
                  disabled={isTyping}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  size="sm"
                  className="px-3 h-9 w-9 flex items-center justify-center"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatWidget;