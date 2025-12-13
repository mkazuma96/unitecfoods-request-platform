"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Search, X, Calendar, Filter, PlayCircle } from "lucide-react";

export default function AdminIssueListPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterCompany, setFilterCompany] = useState("");
  // Start/End Dates for Creation Date
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  // Start/End Dates for Deadline
  const [filterDeadlineStart, setFilterDeadlineStart] = useState("");
  const [filterDeadlineEnd, setFilterDeadlineEnd] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // Added Status Filter

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high": return "高";
      case "middle": return "中";
      case "low": return "低";
      default: return urgency;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600";
      case "middle": return "text-gray-900";
      case "low": return "text-blue-600";
      default: return "text-gray-900";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: {[key: string]: string} = {
      untouched: "未対応",
      in_progress: "対応中",
      completed: "対応完了",
      draft: "下書き",
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "untouched": return "bg-gray-100 text-gray-900";
      case "in_progress": return "bg-red-100 text-red-600";
      case "completed": return "bg-blue-100 text-blue-600";
      case "draft": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  useEffect(() => {
    fetchIssues();
  }, []);

  // Filtering Logic
  useEffect(() => {
    let result = issues;

    // 1. Filter by Company Name (Partial match)
    if (filterCompany.trim()) {
      const query = filterCompany.toLowerCase();
      result = result.filter((issue) => 
        issue.company_name?.toLowerCase().includes(query)
      );
    }

    // 2. Filter by Created Date (Range)
    if (filterDateStart || filterDateEnd) {
      result = result.filter((issue) => {
        if (!issue.created_at) return false;
        const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
        const isAfterStart = !filterDateStart || issueDate >= filterDateStart;
        const isBeforeEnd = !filterDateEnd || issueDate <= filterDateEnd;
        return isAfterStart && isBeforeEnd;
      });
    }

    // 3. Filter by Desired Deadline (Range)
    if (filterDeadlineStart || filterDeadlineEnd) {
      result = result.filter((issue) => {
        if (!issue.desired_deadline) return false;
        const deadline = issue.desired_deadline;
        const isAfterStart = !filterDeadlineStart || deadline >= filterDeadlineStart;
        const isBeforeEnd = !filterDeadlineEnd || deadline <= filterDeadlineEnd;
        return isAfterStart && isBeforeEnd;
      });
    }

    // 4. Filter by Urgency
    if (filterUrgency) {
      result = result.filter((issue) => 
        issue.urgency === filterUrgency
      );
    }

    // 5. Filter by Status
    if (filterStatus) {
      result = result.filter((issue) => 
        issue.status === filterStatus
      );
    }

    setFilteredIssues(result);
  }, [issues, filterCompany, filterDateStart, filterDateEnd, filterDeadlineStart, filterDeadlineEnd, filterUrgency, filterStatus]);

  const clearFilters = () => {
    setFilterCompany("");
    setFilterDateStart("");
    setFilterDateEnd("");
    setFilterDeadlineStart("");
    setFilterDeadlineEnd("");
    setFilterUrgency("");
    setFilterStatus("");
  };

  if (loading) return <div className="p-8 text-lg">読み込み中...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">課題一覧</h1>
      </div>

      {/* Search & Filter Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center mb-2">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-bold text-gray-800">検索・絞り込み</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Row 1: Company & Urgency & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Company Name */}
                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">企業名</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                            placeholder="社名を入力..."
                            className="w-full rounded-md border-gray-300 border p-2 pl-9 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C]"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                {/* Urgency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">緊急度</label>
                    <select
                        value={filterUrgency}
                        onChange={(e) => setFilterUrgency(e.target.value)}
                        className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C]"
                    >
                        <option value="">全て</option>
                        <option value="high">高</option>
                        <option value="middle">中</option>
                        <option value="low">低</option>
                    </select>
                </div>

                {/* Status (Added) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">対応ステータス</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C]"
                    >
                        <option value="">全て</option>
                        <option value="untouched">未対応</option>
                        <option value="in_progress">対応中</option>
                        <option value="completed">対応完了</option>
                        <option value="draft">下書き</option>
                    </select>
                </div>
            </div>

            {/* Row 2: Dates (Create & Deadline) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Created Date Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">作成日 (範囲)</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={filterDateStart}
                            onChange={(e) => setFilterDateStart(e.target.value)}
                            className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C] text-sm"
                        />
                        <span className="text-gray-500">~</span>
                        <input
                            type="date"
                            value={filterDateEnd}
                            onChange={(e) => setFilterDateEnd(e.target.value)}
                            className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C] text-sm"
                        />
                    </div>
                </div>

                {/* Deadline Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">希望回答期限 (範囲)</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={filterDeadlineStart}
                            onChange={(e) => setFilterDeadlineStart(e.target.value)}
                            className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C] text-sm"
                        />
                        <span className="text-gray-500">~</span>
                        <input
                            type="date"
                            value={filterDeadlineEnd}
                            onChange={(e) => setFilterDeadlineEnd(e.target.value)}
                            className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-[#002B5C] focus:ring-[#002B5C] text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-2">
            <Button 
                variant="outline" 
                onClick={clearFilters}
                className="text-gray-600 border-gray-300 hover:bg-gray-100"
                disabled={!filterCompany && !filterDateStart && !filterDateEnd && !filterDeadlineStart && !filterDeadlineEnd && !filterUrgency && !filterStatus}
            >
                <X className="h-4 w-4 mr-2" />
                検索条件をクリア
            </Button>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-16 text-center border border-gray-200">
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {issues.length === 0 ? "課題がありません" : "該当する課題が見つかりません"}
          </h3>
          {issues.length > 0 && (
              <p className="mt-2 text-gray-500">検索条件を変更して再度お試しください。</p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {filteredIssues.map((issue) => (
              <li key={issue.id}>
                <Link href={`/admin/issues/${issue.id}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-base font-medium bg-purple-100 text-purple-800">
                            {issue.company_name || "不明な企業"}
                        </span>
                        <span className="text-lg font-medium text-gray-500">
                            #{issue.issue_code}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-3">
                        <p className={`px-4 py-1 inline-flex text-base leading-5 font-bold rounded-full ${getStatusColor(issue.status)}`}>
                          {getStatusLabel(issue.status)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xl font-bold text-[#002B5C] mb-2">
                        {issue.title}
                      </p>
                      <div className="flex items-center text-base text-gray-700">
                        <span className="font-medium text-gray-500 mr-2">対象商品:</span>
                        <span className="font-bold">{issue.product_name}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-6 text-base">
                        <div className="flex items-center">
                            <span className="font-medium text-gray-500 mr-2">緊急度:</span>
                            <span className={`font-bold ${getUrgencyColor(issue.urgency)}`}>
                            {getUrgencyLabel(issue.urgency)}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-medium text-gray-500 mr-2">希望回答期限:</span>
                            <span className="font-bold text-gray-900">
                            {issue.desired_deadline ? new Date(issue.desired_deadline).toLocaleDateString() : "未定"}
                            </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-base text-gray-500">
                        <p>作成日: {new Date(issue.created_at).toLocaleDateString()}</p>
                        <p className="text-[#002B5C] font-medium">詳細を見る &rarr;</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
