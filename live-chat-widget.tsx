import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, ChatSession } from "@shared/schema";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Create chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/sessions", {
        isActive: true
      });
      return response.json();
    },
    onSuccess: (session: ChatSession) => {
      setSessionId(session.id);
    },
  });

  // Get chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/sessions", sessionId, "messages"],
    enabled: !!sessionId,
    refetchInterval: 2000, // Poll for new messages every 2 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat/messages", {
        sessionId,
        message: messageText,
        isFromSupport: false
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", sessionId, "messages"] });
    },
  });

  const handleToggleChat = () => {
    if (!isOpen && !sessionId) {
      createSessionMutation.mutate();
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (message.trim() && sessionId) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Chat Button */}
      <Button
        onClick={handleToggleChat}
        className={`${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-artisan-green hover:bg-green-600'
        } text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-colors`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200">
          {/* Chat Header */}
          <div className="bg-artisan-green text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold">Support Team</h4>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleChat}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {/* Initial greeting */}
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-artisan-green rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                <p className="text-sm">Hi! How can I help you with your order today?</p>
              </div>
            </div>

            {/* Dynamic messages */}
            {messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${
                  msg.isFromSupport ? '' : 'flex-row-reverse space-x-reverse'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.isFromSupport ? 'bg-artisan-green' : 'bg-artisan-brown'
                }`}>
                  <User className="w-3 h-3 text-white" />
                </div>
                <div className={`rounded-lg p-3 max-w-[70%] ${
                  msg.isFromSupport ? 'bg-gray-100' : 'bg-artisan-brown text-white'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-full text-sm"
                disabled={!sessionId || sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !sessionId || sendMessageMutation.isPending}
                className="bg-artisan-green text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 transition-colors p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
