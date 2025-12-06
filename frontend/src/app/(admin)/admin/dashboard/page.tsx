"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboardPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/issues");
        console.log("Fetched Issues:", response.data);
        setIssues(response.data);
      } catch (err: any) {
        console.error(err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">全案件数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{issues.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">未着手 (要対応)</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {issues.filter((i: any) => i.status === "untouched").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">今月の新規</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
        </div>
      </div>

      {/* Data Dump Table (Temporary) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">API取得データ確認</h3>
        </div>
        <div className="p-6">
          {issues.length === 0 ? (
            <p className="text-gray-500 text-center py-8">データがありません</p>
          ) : (
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(issues, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

