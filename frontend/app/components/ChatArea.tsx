"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { Conversation, Message } from "../types/chat";
import { supabase } from "../../lib/supabase";

interface ChatAreaProps {
  conversation: Conversation | null;
  onBack?: () => void;
}

// Personality styles for different contacts
const PERSONALITY_STYLES = {
  "john-doe": {
    style: "friendly and enthusiastic",
    prompt:
      "Respond in a friendly, enthusiastic way. Use exclamation marks and positive language.",
    name: "John",
  },
  "sarah-wilson": {
    style: "professional and direct",
    prompt:
      "Respond in a professional, direct manner. Be concise and business-like.",
    name: "Sarah",
  },
  "mike-brown": {
    style: "casual and supportive",
    prompt:
      "Respond in a casual, supportive way. Use encouraging language and be helpful.",
    name: "Mike",
  },
  "emma-davis": {
    style: "creative and quirky",
    prompt:
      "Respond in a creative, quirky way. Use emojis and be playful with language.",
    name: "Emma",
  },
  "alex-johnson": {
    style: "analytical and thoughtful",
    prompt:
      "Respond in an analytical, thoughtful manner. Ask questions and provide detailed insights.",
    name: "Alex",
  },
  "jessica-martinez": {
    style: "warm and empathetic",
    prompt:
      "Respond in a warm, empathetic way. Show understanding and care for others.",
    name: "Jessica",
  },
};

const generateAIResponse = async (
  userMessage: string,
  userId: string,
  conversationHistory: Message[]
): Promise<string> => {
  try {
    const personality =
      PERSONALITY_STYLES[userId as keyof typeof PERSONALITY_STYLES];
    if (!personality) {
      return "Thanks for your message! I'll get back to you soon.";
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        personality: personality.prompt,
        conversationHistory: conversationHistory,
        currentUserId: userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    return data.response || "Thanks for your message!";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Thanks for your message! I'll get back to you soon.";
  }
};

// Typing indicator component
const TypingIndicator = ({ userName }: { userName: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex justify-start"
  >
    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-soft bg-gray-200 text-gray-900">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-600">{userName} is typing</span>
        <div className="flex space-x-1">
          <motion.div
            className="w-1 h-1 bg-gray-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1 h-1 bg-gray-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-1 h-1 bg-gray-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

export function ChatArea({ conversation, onBack }: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickMessageInput, setQuickMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || []);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      user_id: "current-user",
      content: messageInput.trim(),
      date: new Date().toISOString(),
    };

    // Optimistically update UI
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessageInput("");
    setLoading(true);

    try {
      // Update conversation in Supabase
      const { error } = await supabase
        .from("conversations")
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);

      if (error) throw error;

      // Generate AI response after a short delay
      setTimeout(async () => {
        // Find the other participant (not current-user)
        const otherParticipant = conversation.participants.find(
          (p) => p !== "current-user"
        );

        if (otherParticipant) {
          // Show typing indicator
          const personality =
            PERSONALITY_STYLES[
              otherParticipant as keyof typeof PERSONALITY_STYLES
            ];
          setTypingUser(personality?.name || otherParticipant);
          setIsTyping(true);

          const aiResponse = await generateAIResponse(
            newMessage.content,
            otherParticipant,
            messages
          );

          // Hide typing indicator
          setIsTyping(false);
          setTypingUser("");

          const aiMessage: Message = {
            id: crypto.randomUUID(),
            user_id: otherParticipant,
            content: aiResponse,
            date: new Date().toISOString(),
          };

          const messagesWithAI = [...updatedMessages, aiMessage];
          setMessages(messagesWithAI);

          // Update Supabase with AI response
          await supabase
            .from("conversations")
            .update({
              messages: messagesWithAI,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversation.id);
        }
        setLoading(false);
      }, 800); // Reduced delay before showing typing indicator
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert optimistic update on error
      setMessages(messages);
      setMessageInput(newMessage.content);
      setLoading(false);
      setIsTyping(false);
      setTypingUser("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!conversation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex items-center justify-center bg-gray-50"
      >
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to <span className="text-blue-600">Wh.AI.t's</span> app
            </h1>
            <p className="text-gray-600 mb-8">
              Start a conversation or write your thoughts below
            </p>
          </div>

          {/* Big Textarea */}
          <div className="mb-6">
            <textarea
              value={quickMessageInput}
              onChange={(e) => setQuickMessageInput(e.target.value)}
              placeholder="What's on your mind? Start typing here..."
              className="w-full h-64 p-6 border border-gray-200 rounded-2xl shadow-soft resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Conversations
              </button>
            )}
            <button
              disabled={!quickMessageInput.trim()}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-soft"
            >
              Send Quick Message
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 border-b border-gray-200 bg-white shadow-soft"
      >
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.title}
            </h2>
            <p className="text-sm text-gray-500">
              {conversation.participants.length} participants
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.15,
                delay: Math.min(index * 0.02, 0.3), // Professional timing with max delay
                ease: "easeOut",
              }}
              className={`flex ${
                message.user_id === "current-user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-soft ${
                  message.user_id === "current-user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.user_id === "current-user"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatMessageTime(message.date)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && <TypingIndicator userName={typingUser} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-4 border-t border-gray-200 bg-white shadow-soft"
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-soft"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || loading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-soft"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
