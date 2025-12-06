"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

type Message = {
  id: number;
  content: string;
  sender_name: string;
  sent_at: string;
  has_attachment: boolean;
};

type ChatWindowProps = {
  issueId: number;
};

type MessageForm = {
  content: string;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ issueId }) => {
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
      <div className="px-4 py-5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">メッセージ</h3>
      </div>
      
      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-700 text-sm mt-10">メッセージはまだありません</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-sm text-gray-900">{msg.sender_name}</span>
                <span className="text-xs text-gray-600">{new Date(msg.sent_at).toLocaleString()}</span>
              </div>
              <div className="mt-1 bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-900 whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
            placeholder="メッセージを入力..."
            autoComplete="off"
            {...register("content")}
          />
          <Button type="submit">送信</Button>
        </form>
      </div>
    </div>
  );
};

