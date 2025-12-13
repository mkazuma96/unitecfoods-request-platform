"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AlertCircle, Clock, CheckCircle, PlusCircle, ArrowRight } from "lucide-react";

type Issue = {
  id: number;
  issue_code: string;
  title: string;
  status: string;
  urgency: string;
  desired_deadline?: string;
  created_at: string;
  company_name?: string;
};

export default function AdminDashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get("/issues");
        setIssues(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  if (loading) return <div className="p-8 text-lg">読み込み中...</div>;

  // --- Logic for KPI & Lists ---
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(now.getDate() + 3);
  const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

  // 1. KPI Counts
  const untouchedCount = issues.filter(i => i.status === 'untouched').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  
  // Deadline approaching or overdue (and not completed)
  const deadlineIssues = issues.filter(i => {
    if (i.status === 'completed' || i.status === 'cancelled' || !i.desired_deadline) return false;
    return i.desired_deadline <= threeDaysLaterStr;
  });
  const deadlineCount = deadlineIssues.length;

  // New today
  const newTodayCount = issues.filter(i => i.created_at.startsWith(todayStr)).length;

  // 2. Action Lists
  // Sort by deadline (ascending) for "Approaching Deadline"
  const approachingDeadlineList = [...issues]
    .filter(i => i.status !== 'completed' && i.status !== 'cancelled' && i.desired_deadline)
    .sort((a, b) => (a.desired_deadline! > b.desired_deadline!) ? 1 : -1)
    .slice(0, 5);

  // High Urgency & Not Completed
  const highUrgencyList = issues.filter(i => 
    i.urgency === 'high' && i.status !== 'completed' && i.status !== 'cancelled'
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Untouched */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">未対応 (要着手)</h3>
            <AlertCircle className={`h-6 w-6 ${untouchedCount > 0 ? 'text-red-500' : 'text-gray-300'}`} />
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-gray-900">{untouchedCount}</p>
            <p className="text-sm text-gray-500 mt-1">件の課題が未着手です</p>
          </div>
        </div>

        {/* Deadline Alert */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">期限切迫・超過</h3>
            <Clock className={`h-6 w-6 ${deadlineCount > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
          </div>
          <div className="mt-auto">
            <p className={`text-4xl font-bold ${deadlineCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{deadlineCount}</p>
            <p className="text-sm text-gray-500 mt-1">件が3日以内または超過</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">進行中</h3>
            <CheckCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-gray-900">{inProgressCount}</p>
            <p className="text-sm text-gray-500 mt-1">件の課題に対応中</p>
          </div>
        </div>

        {/* New Today */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">本日の新規</h3>
            <PlusCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-gray-900">{newTodayCount}</p>
            <p className="text-sm text-gray-500 mt-1">件の新規登録</p>
          </div>
        </div>
      </div>

      {/* Action Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Approaching Deadline List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              期限が近い課題 (未完了)
            </h3>
            <Link href="/admin/issues" className="text-sm text-blue-600 hover:underline flex items-center">
              すべて見る <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {approachingDeadlineList.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-500">期限が迫っている未完了課題はありません</li>
            ) : (
              approachingDeadlineList.map((issue) => {
                const isOverdue = issue.desired_deadline! < todayStr;
                return (
                  <li key={issue.id} className="hover:bg-gray-50 transition">
                    <Link href={`/admin/issues/${issue.id}`} className="block px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              {issue.company_name}
                            </span>
                            <span className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                              {isOverdue ? '期限超過' : `期限: ${new Date(issue.desired_deadline!).toLocaleDateString()}`}
                            </span>
                          </div>
                          <p className="text-base font-bold text-gray-900">{issue.title}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300" />
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* 2. High Urgency List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              緊急度「高」の未完了課題
            </h3>
            <Link href="/admin/issues" className="text-sm text-blue-600 hover:underline flex items-center">
              すべて見る <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {highUrgencyList.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-500">緊急度「高」の未完了課題はありません</li>
            ) : (
              highUrgencyList.map((issue) => (
                <li key={issue.id} className="hover:bg-gray-50 transition">
                  <Link href={`/admin/issues/${issue.id}`} className="block px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            {issue.company_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(issue.created_at).toLocaleDateString()} 作成
                          </span>
                        </div>
                        <p className="text-base font-bold text-gray-900">{issue.title}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-600">
                        高
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
