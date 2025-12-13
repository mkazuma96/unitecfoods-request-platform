"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Plus, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

type Company = {
  id: number;
  name: string;
  representative_email: string;
  address_default?: string;
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/companies");
        setCompanies(response.data);
      } catch (error) {
        console.error("Failed to fetch companies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <div className="p-8 text-lg">読み込み中...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">企業管理</h1>
        <Link href="/admin/companies/new">
          <Button className="bg-[#002B5C] hover:bg-[#002244] text-white text-lg px-6 py-6 font-bold">
            <Plus className="h-5 w-5 mr-2" />
            新規企業登録
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {companies.length === 0 ? (
            <li className="p-8 text-center text-gray-500 text-lg">登録されている企業はありません</li>
          ) : (
            companies.map((company) => (
              <li key={company.id} className="px-6 py-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Building className="h-6 w-6" />
                  </div>
                  <div className="ml-6">
                    <p className="text-xl font-bold text-gray-900">{company.name}</p>
                    <p className="text-base text-gray-500 mt-1">代表: {company.representative_email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Future actions like Edit/Delete could go here */}
                    <span className="text-gray-400 text-sm">ID: {company.id}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

