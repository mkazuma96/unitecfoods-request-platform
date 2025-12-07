"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { IssueDetailView } from "@/features/issues/components/IssueDetailView";
import { ChatWindow } from "@/features/messages/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AdminIssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await api.get(`/issues/${id}`);
        setIssue(response.data);
      } catch (error) {
        console.error("Failed to fetch issue", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIssue();
    }
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (!issue) return <div>課題が見つかりません</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-bold">一覧に戻る</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">課題詳細 (管理者)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <IssueDetailView issue={issue} isAdmin={true} />
        </div>
        <div className="lg:col-span-1">
          <ChatWindow issueId={Number(id)} />
        </div>
      </div>
    </div>
  );
}

