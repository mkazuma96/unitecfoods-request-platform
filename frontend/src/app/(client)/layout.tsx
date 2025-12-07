"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { usePathname } from "next/navigation";
import { User as UserIcon, Building, Users } from "lucide-react"; // Added icons

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

  useEffect(() => {
      const fetchData = async () => {
          try {
              const userRes = await api.get("/users/me");
              setUser(userRes.data);
              
              const companyRes = await api.get("/users/company");
              setCompany(companyRes.data);
          } catch (e) {
              console.error("Failed to fetch user info", e);
          }
      };
      fetchData();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Unitec Connect</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link 
            href="/client/issues" 
            className={`block px-4 py-2 rounded-md font-medium transition-colors ${
                pathname === '/client/issues' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
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
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">設定</p>
            <Link 
              href="/client/company" 
              className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
                  pathname === '/client/company' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building className="w-4 h-4 mr-2" />
              企業情報
            </Link>
            
            {user?.role === "CLIENT_ADMIN" && (
                <Link 
                  href="/client/members/invite" 
                  className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors mt-1 ${
                      pathname === '/client/members/invite' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  担当者登録
                </Link>
            )}
          </div>
        </nav>
        
        {/* User Profile Summary in Sidebar (Optional) */}
        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 truncate w-32">{user?.name || "Loading..."}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-gray-800">
              {pathname === '/client/issues' ? '課題・依頼一覧' : 
               pathname === '/client/new-issue' ? '新規課題登録' :
               pathname === '/client/company' ? '企業情報' :
               pathname === '/client/members/invite' ? '担当者登録' :
               'クライアントポータル'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                  {user?.role === "CLIENT_ADMIN" ? (
                      company?.name ? `${company.name} メイン` : "Main Account"
                  ) : (
                      user?.name || "Client Member"
                  )}
              </p>
              <p className="text-xs text-gray-500">{company?.name || "Loading..."}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-500" />
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
