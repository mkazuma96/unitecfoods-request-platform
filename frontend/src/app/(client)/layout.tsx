import React from "react";
import Link from "next/link";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Unitec Connect</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            href="/client/issues" 
            className="block px-4 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
          >
            課題一覧
          </Link>
          <Link 
            href="/client/new-issue" 
            className="block px-4 py-2 rounded-md bg-blue-600 text-white shadow-md hover:bg-blue-700 font-medium mt-4 text-center"
          >
            + 新規課題登録
          </Link>
          <div className="mt-8 px-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">設定</p>
            <Link 
              href="/client/settings" 
              className="block mt-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 text-sm"
            >
              企業情報・担当者
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-gray-800">クライアントポータル</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Client User</p>
              <p className="text-xs text-gray-500">Client A Corp</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">CU</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

