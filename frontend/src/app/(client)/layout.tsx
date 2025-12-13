"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { User as UserIcon, Building, Users, LayoutDashboard, LogOut, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
type UserRole = "CLIENT_ADMIN" | "CLIENT_MEMBER";
type User = {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    company_id: number;
};
type Company = {
    id: number;
    name: string;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
      const fetchData = async () => {
          try {
              const userRes = await api.get("/users/me");
              setUser(userRes.data);
              
              const companyRes = await api.get("/users/company");
              setCompany(companyRes.data);
          } catch (e) {
              console.error("Failed to fetch user info", e);
              // router.push("/auth/login"); // Optional: auto-redirect
          }
      };
      fetchData();
  }, [router]);

  const handleLogout = () => {
      localStorage.removeItem("token");
      router.push("/auth/login");
  };

  const displayName = user && company 
      ? `${company.name} ${user.name}`
      : user?.name || "ゲスト";

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex bg-[#FDFBF7]">
      {/* Sidebar: Width 72 to accommodate larger text */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Header: Height 20 */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#002B5C] tracking-wide">Unitec Connect</h1>
        </div>
        <nav className="p-6 space-y-4 flex-1">
          {/* 1. 新規課題登録 (Always Blue) - Text XL */}
          <Link 
            href="/client/new-issue" 
            className="flex items-center px-6 py-3 rounded-md font-bold transition-colors mb-4 bg-blue-600 text-white shadow-md hover:bg-blue-700 text-xl"
          >
            <FilePlus className="h-6 w-6 mr-3" />
            新規課題登録
          </Link>

          {/* 2. 課題一覧 - Text XL */}
          <Link 
            href="/client/issues" 
            className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors text-xl ${
                pathname === '/client/issues' ? 'bg-[#E6F0FA] text-[#002B5C] font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-[#002B5C]'
            }`}
          >
            <LayoutDashboard className="h-6 w-6 mr-3" />
            課題一覧
          </Link>
          
          <div className="mt-10 px-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">設定</p>
            {/* 3. 企業情報 - Text XL (slightly smaller maybe? keeping XL for consistency) */}
            <Link 
              href="/client/company" 
              className={`flex items-center px-4 py-2 rounded-md transition-colors text-lg ${
                  pathname === '/client/company' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building className="h-5 w-5 mr-3" />
              企業情報
            </Link>
            
            {user?.role === "CLIENT_ADMIN" && (
                <Link 
                  href="/client/members/invite" 
                  className={`flex items-center px-4 py-2 rounded-md transition-colors mt-2 text-lg ${
                      pathname === '/client/members/invite' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  担当者登録
                </Link>
            )}
          </div>
        </nav>
        
        <div className="p-6 border-t border-gray-200">
            <Button 
                onClick={handleLogout} 
                variant="ghost" 
                className="w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-700 text-lg py-6"
            >
                <LogOut className="h-6 w-6 mr-3" />
                ログアウト
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header: Height 20 */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
              {pathname === '/client/issues' ? '課題一覧' : 
               pathname === '/client/new-issue' ? '新規課題登録' :
               pathname === '/client/company' ? '企業情報' :
               pathname === '/client/members/invite' ? '担当者登録' :
               'クライアントポータル'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-base font-medium text-gray-900">
                  {displayName}
              </p>
              {user?.role === "CLIENT_ADMIN" && (
                  <p className="text-sm text-gray-500">メインアカウント</p>
              )}
            </div>
            <div className="h-10 w-10 rounded-full bg-[#002B5C] flex items-center justify-center text-white shadow-sm">
              <span className="text-sm font-bold">{userInitials}</span>
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
