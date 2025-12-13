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

  if (loading) return <div className="p-8 text-lg">読み込み中...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {issues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-16 text-center border border-gray-200">
          <h3 className="mt-2 text-lg font-medium text-gray-900">課題がありません</h3>
          <p className="mt-2 text-base text-gray-700">新しい課題や依頼を登録して、開発プロジェクトを始めましょう。</p>
          <div className="mt-8">
            <Link href="/client/new-issue">
              <Button className="text-lg py-6 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                + 最初の課題を作成
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link 
                  href={issue.status === 'draft' ? `/client/issues/${issue.id}/edit` : `/client/issues/${issue.id}`} 
                  className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg font-medium text-blue-600 truncate">
                        #{issue.issue_code}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-4 py-1 inline-flex text-base leading-5 font-bold rounded-full ${
                          issue.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {issue.status === 'draft' ? '下書き' : issue.status.toUpperCase().replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {issue.title}
                      </p>
                      <div className="flex items-center text-base text-gray-700">
                        <span className="font-medium text-gray-500 mr-2">対象商品:</span>
                        <span className="font-bold">{issue.product_name}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-end justify-between text-base text-gray-500">
                        <div>
                            <p>作成日: {new Date(issue.created_at).toLocaleDateString()}</p>
                            {issue.creator_name && <p className="text-sm mt-1 text-gray-400">作成者: {issue.creator_name}</p>}
                        </div>
                        <p className="text-blue-600 font-medium">詳細を見る &rarr;</p>
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
