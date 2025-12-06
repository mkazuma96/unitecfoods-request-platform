import React from "react";

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

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 leading-7">
              {issue.title}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
              #{issue.issue_code}
            </span>
            {issue.client_arbitrary_code && (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-800 border border-blue-100">
                 Client Ref: {issue.client_arbitrary_code}
               </span>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            対象商品: <span className="font-medium text-gray-900">{issue.product_name}</span> | 
            カテゴリ: <span className="font-medium text-gray-900">{getCategoryLabel(issue.category)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              issue.status === 'untouched' ? 'bg-red-100 text-red-800' : 
              issue.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-green-100 text-green-800'
            }`}>
              {issue.status.toUpperCase().replace("_", " ")}
            </span>
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              Ball: {issue.ball_holder}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            作成日: {new Date(issue.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          
          {/* Description */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">詳細・要望</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200">
              {issue.description}
            </dd>
          </div>

          {/* Urgency & Deadline */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">緊急度</dt>
            <dd className={`mt-1 text-sm font-bold capitalize ${
                issue.urgency === 'high' ? 'text-red-600' : 'text-gray-900'
            }`}>
              {issue.urgency}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">希望回答期限</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {issue.desired_deadline ? new Date(issue.desired_deadline).toLocaleDateString() : "未定"}
            </dd>
          </div>

          {/* Ingredients */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">現行配分 (レシピ)</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {issue.ingredients.length > 0 ? (
                 <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">素材名</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">分量</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {issue.ingredients.map((ing, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ing.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{ing.amount}</td>
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
          <div className="sm:col-span-2 border-t border-gray-100 pt-4">
             <dt className="text-sm font-medium text-gray-500">サンプル送付情報</dt>
             <dd className="mt-2 text-sm text-gray-900">
                {issue.is_sample_provided ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                        <div className="flex items-center text-blue-800 font-medium mb-1">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             現行品のサンプルを送付済み
                        </div>
                        {issue.sample_shipping_info && (
                            <div className="text-gray-600 ml-6">
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
           <div className="sm:col-span-2 border-t border-gray-100 pt-4">
            <dt className="text-sm font-medium text-gray-500">添付ファイル</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {issue.attachments && issue.attachments.length > 0 ? (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {issue.attachments.map((file, idx) => (
                    <li key={idx} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                         <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">{file.file_name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
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
