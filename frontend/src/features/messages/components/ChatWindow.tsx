"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

type Message = {
  id: number;
  content: string;
  sender_name: string;
  sender_id: number; // Added sender_id
  sent_at: string;
  has_attachment: boolean;
};

type ChatWindowProps = {
  issueId: number;
  currentUserId?: number; // Ideally passed from parent, but can also be inferred from role context
  isAdmin?: boolean; // To determine coloring logic if currentUserId is not available
};

type MessageForm = {
  content: string;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ issueId, isAdmin = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<MessageForm>();

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/issues/${issueId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Polling could be implemented here for real-time updates
  }, [issueId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data: MessageForm) => {
    if (!data.content.trim()) return;
    
    try {
      await api.post(`/issues/${issueId}/messages`, {
        content: data.content,
        has_attachment: false
      });
      reset();
      fetchMessages(); // Refresh list
    } catch (error) {
      console.error("Failed to send message", error);
      alert("送信に失敗しました");
    }
  };

  if (loading) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 flex flex-col h-[600px]">
      <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-900">メッセージ</h3>
      </div>
      
      {/* Message List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-base mt-10">メッセージはまだありません</p>
        ) : (
          messages.map((msg) => {
            // Determine if message is from Unitec (Admin) side
            const isUnitecSender = msg.sender_name.includes("Unitec") || msg.sender_name.includes("Admin");
            
            return (
              <div key={msg.id} className={`flex flex-col ${isUnitecSender ? 'items-start' : 'items-end'}`}>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className={`text-xs font-bold ${isUnitecSender ? 'text-unitec-blue-gray' : 'text-unitec-gray'}`}>
                    {msg.sender_name}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(msg.sent_at).toLocaleString()}</span>
                </div>
                <div className={`
                  max-w-[85%] p-4 rounded-2xl shadow-sm text-base whitespace-pre-wrap
                  ${isUnitecSender 
                    ? 'bg-gray-100 text-unitec-gray rounded-tl-none border border-gray-200' 
                    : 'bg-white text-unitec-gray rounded-tr-none border border-gray-200'}
                `}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <input
            type="text"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-unitec-yellow focus:ring-unitec-yellow border p-3 text-base text-gray-900"
            placeholder="メッセージを入力..."
            autoComplete="off"
            {...register("content")}
          />
          <Button type="submit" className="px-6 font-bold bg-[#002B5C] hover:bg-[#002244] text-white">送信</Button>
        </form>
      </div>
    </div>
  );
};
