import React from "react";
import api from "@/lib/api"; // Import api
import { Button } from "@/components/ui/button"; // Import Button
import { PlayCircle } from "lucide-react"; // Import Icon

// Type definition (Sync with IssueRead in backend)
type Issue = {
  id: number;
  issue_code: string;
  title: string;
  category: string;
  product_name: string;
  description: string;
  urgency: string;
  status: string;
  ball_holder: string;
  created_at: string;
  client_arbitrary_code?: string;
  desired_deadline?: string;
  is_sample_provided: boolean;
  sample_shipping_info?: string;
  ingredients: { name: string; amount: string }[];
  attachments: { file_name: string; file_path: string }[];
  company_name?: string;
  creator_name?: string;
};

type IssueDetailViewProps = {
  issue: Issue;
  isAdmin?: boolean;
};

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({ issue, isAdmin = false }) => {
  
  const getCategoryLabel = (cat: string) => {
    const map: {[key: string]: string} = {
      flavor: "フレーバー (味・香り)",
      texture: "テクスチャー (食感)",
      preservation: "保存性・物性",
      cost: "コストダウン",
      other: "その他",
    };
    return map[cat] || cat;
  };

  const getUrgencyLabel = (urgency: string) => {
    const map: {[key: string]: string} = {
      high: "高",
      middle: "中",
      low: "低",
    };
    return map[urgency] || urgency;
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

  const handleStartProgress = async () => {
    if (!confirm("この課題の対応を開始しますか？\nステータスが「対応中」に変更されます。")) return;

    try {
      await api.put(`/issues/${issue.id}`, { status: "in_progress" });
      window.location.reload(); // Simple reload to reflect changes
    } catch (error) {
      console.error("Failed to update status", error);
      alert("ステータス更新に失敗しました");
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-6 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold text-gray-900 leading-tight">
              {isAdmin && issue.company_name && (
                <div className="mb-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-base font-medium bg-purple-100 text-purple-800">
                    {issue.company_name}
                  </span>
                </div>
              )}
              {issue.title}
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-lg font-medium bg-gray-100 text-gray-800">
              #{issue.issue_code}
            </span>
            {issue.creator_name && !isAdmin && (
               <span className="inline-flex items-center px-3 py-1 rounded-md text-base font-medium bg-gray-100 text-gray-600">
                 登録者: {issue.creator_name}
               </span>
            )}
            {issue.client_arbitrary_code && (
               <span className="inline-flex items-center px-3 py-1 rounded-md text-lg font-medium bg-[#E6F0FA] text-[#002B5C] border border-blue-100">
                 Client Ref: {issue.client_arbitrary_code}
               </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 ml-4">
          <div className="flex space-x-3 items-center">
            {/* Start Progress Button (Admin only, UNTOUCHED only) */}
            {isAdmin && issue.status === 'untouched' && (
                <Button 
                    size="sm" 
                    onClick={handleStartProgress}
                    className="bg-[#002B5C] hover:bg-[#002244] text-white font-bold"
                >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    対応開始
                </Button>
            )}

            <span className={`px-4 py-1.5 inline-flex text-base leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>
              {getStatusLabel(issue.status)}
            </span>
          </div>
          <div className="text-base text-gray-500">
            作成日: {new Date(issue.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-8">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
          
          {/* Product & Category */}
          <div className="sm:col-span-1">
            <dt className="text-lg font-medium text-gray-500">対象商品</dt>
            <dd className="mt-2 text-xl font-bold text-gray-900">
              {issue.product_name}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-lg font-medium text-gray-500">カテゴリ</dt>
            <dd className="mt-2 text-xl font-bold text-gray-900">
              {getCategoryLabel(issue.category)}
            </dd>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 border-t border-gray-100 pt-8">
            <dt className="text-lg font-medium text-gray-500">詳細・要望</dt>
            <dd className="mt-3 text-lg text-gray-900 whitespace-pre-wrap bg-gray-50 p-6 rounded-md border border-gray-200 leading-relaxed">
              {issue.description}
            </dd>
          </div>

          {/* Urgency & Deadline */}
          <div className="sm:col-span-1 border-t border-gray-100 pt-8">
            <dt className="text-lg font-medium text-gray-500">緊急度</dt>
            <dd className={`mt-2 text-xl font-bold capitalize ${getUrgencyColor(issue.urgency)}`}>
              {getUrgencyLabel(issue.urgency)}
            </dd>
          </div>
          <div className="sm:col-span-1 border-t border-gray-100 pt-8">
            <dt className="text-lg font-medium text-gray-500">希望回答期限</dt>
            <dd className="mt-2 text-xl text-gray-900">
              {issue.desired_deadline ? new Date(issue.desired_deadline).toLocaleDateString() : "未定"}
            </dd>
          </div>

          {/* Ingredients */}
          <div className="sm:col-span-2 border-t border-gray-100 pt-8">
            <dt className="text-lg font-medium text-gray-500">現行配分 (レシピ)</dt>
            <dd className="mt-3 text-lg text-gray-900">
              {issue.ingredients.length > 0 ? (
                 <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">素材名</th>
                          <th scope="col" className="px-6 py-4 text-right text-base font-medium text-gray-500 uppercase tracking-wider">分量</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {issue.ingredients.map((ing, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{ing.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 text-right">{ing.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              ) : (
                <span className="text-gray-400 italic">情報なし</span>
              )}
            </dd>
          </div>

          {/* Sample Info */}
          <div className="sm:col-span-2 border-t border-gray-100 pt-8">
             <dt className="text-lg font-medium text-gray-500">サンプル送付情報</dt>
             <dd className="mt-3 text-lg text-gray-900">
                {issue.is_sample_provided ? (
                    <div className="bg-[#E6F0FA] border border-blue-100 rounded-md p-5">
                        <div className="flex items-center text-[#002B5C] font-bold mb-3 text-lg">
                             <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             現行品のサンプルを送付済み
                        </div>
                        {issue.sample_shipping_info && (
                            <div className="text-gray-800 ml-8 text-lg">
                                追跡/メモ: {issue.sample_shipping_info}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-500">サンプル送付なし</div>
                )}
             </dd>
          </div>

          {/* Attachments */}
           <div className="sm:col-span-2 border-t border-gray-100 pt-8">
            <dt className="text-lg font-medium text-gray-500">添付ファイル</dt>
            <dd className="mt-3 text-lg text-gray-900">
              {issue.attachments && issue.attachments.length > 0 ? (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {issue.attachments.map((file, idx) => (
                    <li key={idx} className="pl-4 pr-5 py-5 flex items-center justify-between text-lg">
                      <div className="w-0 flex-1 flex items-center">
                         <svg className="flex-shrink-0 h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3 flex-1 w-0 truncate">{file.file_name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a href="#" className="font-medium text-[#002B5C] hover:text-[#002244] underline">
                          ダウンロード
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                 <span className="text-gray-400 italic">なし</span>
              )}
            </dd>
          </div>

        </dl>
      </div>
    </div>
  );
};
