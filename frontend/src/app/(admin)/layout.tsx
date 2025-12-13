"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/admin/dashboard") return "ダッシュボード";
    if (pathname?.startsWith("/admin/issues")) return "課題一覧";
    if (pathname?.startsWith("/admin/companies")) return "企業管理";
    return "管理者ポータル";
  };

  return (
    <div className="min-h-screen flex bg-[#FDFBF7]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-[#002B5C] tracking-wide hover:opacity-80 transition-opacity">
            Unitec Admin
          </Link>
        </div>
        <nav className="p-6 space-y-4 flex-1">
          <Link 
            href="/admin/dashboard" 
            className={`block px-6 py-3 rounded-md font-bold text-xl transition-colors ${
                pathname === '/admin/dashboard' 
                ? 'bg-[#E6F0FA] text-[#002B5C]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#002B5C]'
            }`}
          >
            ダッシュボード
          </Link>
          <Link 
            href="/admin/issues" 
            className={`block px-6 py-3 rounded-md font-bold text-xl transition-colors ${
                pathname?.startsWith('/admin/issues')
                ? 'bg-[#E6F0FA] text-[#002B5C]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#002B5C]'
            }`}
          >
            課題一覧
          </Link>
          <Link 
            href="/admin/companies" 
            className={`block px-6 py-3 rounded-md font-bold text-xl transition-colors ${
                pathname?.startsWith('/admin/companies')
                ? 'bg-[#E6F0FA] text-[#002B5C]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#002B5C]'
            }`}
          >
            企業管理
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-2xl font-semibold text-gray-800">{getTitle()}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
                <span className="text-base font-medium text-gray-900 block">Admin User</span>
                <span className="text-sm text-gray-500">Unitec Foods</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#002B5C] flex items-center justify-center text-white font-bold text-sm">
                AD
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
