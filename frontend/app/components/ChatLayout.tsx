"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ConversationSidebar } from "./ConversationSidebar";
import { ChatArea } from "./ChatArea";
import { Conversation } from "../types/chat";

export function ChatLayout() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBackToMain = () => {
    setSelectedConversation(null);
    setSearchQuery("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-soft"
      >
        <ConversationSidebar
          selectedConversation={selectedConversation}
          onConversationSelect={setSelectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 flex flex-col"
      >
        <ChatArea
          conversation={selectedConversation}
          onBack={selectedConversation ? handleBackToMain : undefined}
        />
      </motion.div>
    </div>
  );
}
