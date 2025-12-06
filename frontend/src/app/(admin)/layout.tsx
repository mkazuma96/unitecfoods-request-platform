import React from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Unitec Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            href="/admin/dashboard" 
            className="block px-4 py-2 rounded-md bg-blue-50 text-blue-700 font-medium"
          >
            ダッシュボード
          </Link>
          <Link 
            href="/admin/issues" 
            className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50"
          >
            課題管理
          </Link>
          <Link 
            href="/admin/companies" 
            className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50"
          >
            企業管理
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-800">ダッシュボード</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Admin User</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

