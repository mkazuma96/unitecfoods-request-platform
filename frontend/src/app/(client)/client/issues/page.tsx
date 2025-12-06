"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ClientIssueListPage() {
  const [issues, setIssues] = useState<any[]>([]);
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

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">課題・依頼一覧</h1>
        <Link href="/client/new-issue">
          <Button>新規課題を登録する</Button>
        </Link>
      </div>

      {issues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <h3 className="mt-2 text-sm font-medium text-gray-900">課題がありません</h3>
          <p className="mt-1 text-sm text-gray-700">新しい課題や依頼を登録して、開発プロジェクトを始めましょう。</p>
          <div className="mt-6">
            <Link href="/client/new-issue">
              <Button>+ 最初の課題を作成</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link 
                  href={issue.status === 'draft' ? `/client/issues/${issue.id}/edit` : `/client/issues/${issue.id}`} 
                  className="block hover:bg-gray-50 transition"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{issue.issue_code}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          issue.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {issue.status === 'draft' ? '下書き' : issue.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-900 font-bold">
                          {issue.title}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-700 sm:mt-0">
                        <p>商品名: {issue.product_name}</p>
                      </div>
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

