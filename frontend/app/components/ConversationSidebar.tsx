"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageCircle } from "lucide-react";
import { Conversation } from "../types/chat";
import { supabase } from "../../lib/supabase";
import { getRandomAvatar } from "../constants/avatars";

interface ConversationSidebarProps {
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Create a mapping of conversation IDs to avatars to keep them consistent
const conversationAvatars: { [key: string]: string } = {};

export function ConversationSidebar({
  selectedConversation,
  onConversationSelect,
  searchQuery,
  onSearchChange,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Assign consistent avatars to conversations
      data?.forEach((conversation) => {
        if (!conversationAvatars[conversation.id]) {
          // Simple logic to assign gender based on name
          const isGirl = ["Sarah", "Emma", "Jessica", "Maria", "Anna"].some(
            (name) => conversation.title.includes(name)
          );
          conversationAvatars[conversation.id] = getRandomAvatar(
            isGirl ? "girls" : "men"
          );
        }
      });

      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shadow-soft">
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          <span className="text-blue-600">Wh.AI.t's</span> Messages
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-soft"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => onConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50 border-r-2 border-r-blue-500 shadow-soft"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar Image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-soft flex-shrink-0">
                    <img
                      src={conversationAvatars[conversation.id]}
                      alt={conversation.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hidden">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.last_message.date)}
                        </span>
                      )}
                    </div>

                    {conversation.last_message && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
