"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Smile } from "lucide-react";
import { ChatMessage } from "@/types";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatDrawer({ isOpen, onClose, messages, onSendMessage }: ChatDrawerProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <aside className="w-80 bg-[#1E232A] border-l border-white/10 flex flex-col h-full text-white z-20 shrink-0 select-none animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Meeting Chat</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center p-4">
            <p>No messages yet.</p>
            <p className="mt-1">Messages are visible to all meeting participants.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="font-medium text-gray-300">
                  {msg.isSelf ? "You" : msg.displayName}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words ${
                  msg.isSelf
                    ? "bg-[#0E71EB] text-white rounded-tr-xs"
                    : "bg-[#282D35] text-gray-200 rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#171B21]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to Everyone..."
            className="w-full bg-[#242728] border border-white/10 focus:border-[#0E71EB] rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder:text-gray-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 p-1.5 text-[#0E71EB] hover:text-blue-400 disabled:opacity-30 disabled:hover:text-[#0E71EB] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
