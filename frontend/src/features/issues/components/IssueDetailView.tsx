import React from "react";

// Type definition (Ideally import from types/issue.ts)
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
  ingredients: { name: string; amount: string }[];
};

type IssueDetailViewProps = {
  issue: Issue;
  isAdmin?: boolean;
};

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({ issue, isAdmin = false }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {issue.title} <span className="text-gray-500 text-sm ml-2">#{issue.issue_code}</span>
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {issue.product_name} ({issue.category})
          </p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            issue.status === 'untouched' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {issue.status}
          </span>
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {issue.ball_holder}
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">詳細・要望</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
              {issue.description}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">緊急度</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
              {issue.urgency}
            </dd>
          </div>
          {issue.ingredients.length > 0 && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">現行配分</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {issue.ingredients.map((ing, idx) => (
                    <li key={idx} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">{ing.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0 font-medium">
                        {ing.amount}
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

