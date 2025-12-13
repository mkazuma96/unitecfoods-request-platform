"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Mail, User, MapPin, CheckCircle, Copy } from "lucide-react";

type NewCompanyForm = {
  name: string;
  representative_email: string;
  representative_name: string;
  address_default?: string;
};

export default function NewCompanyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<NewCompanyForm>();

  const onSubmit = async (data: NewCompanyForm) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/companies", data);
      setInviteLink(response.data.invitation_link);
    } catch (error: any) {
      console.error("Failed to create company", error);
      alert(error.response?.data?.detail || "登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("リンクをコピーしました");
    }
  };

  if (inviteLink) {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="bg-white shadow-lg rounded-lg border border-green-200 p-10 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">企業登録完了</h2>
          <p className="text-xl text-gray-600 mb-8">
            新しい企業と代表者アカウントが作成されました。<br />
            以下の招待リンクを代表者に共有してください。
          </p>
          
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mb-8 flex items-center justify-between">
            <code className="text-lg text-blue-800 break-all">{inviteLink}</code>
            <Button onClick={copyToClipboard} variant="ghost" className="ml-4 hover:bg-gray-200">
                <Copy className="h-6 w-6 text-gray-500" />
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            <Link href="/admin/companies">
              <Button variant="outline" className="px-8 py-6 text-lg">
                企業一覧へ戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/admin/companies" className="text-blue-600 hover:text-blue-800 flex items-center mb-4 text-lg">
          <ArrowLeft className="h-5 w-5 mr-1" />
          一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">新規企業登録</h1>
        <p className="mt-2 text-lg text-gray-500">
            新しいクライアント企業を登録し、代表者アカウントを発行します。
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3">企業情報</h3>
            
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-400" />
                    企業名 <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 text-lg text-gray-900 placeholder-gray-400"
                placeholder="例: 株式会社サンプル食品"
                {...register("name", { required: true })}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    住所 (任意)
                </div>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 text-lg text-gray-900 placeholder-gray-400"
                placeholder="例: 東京都千代田区..."
                {...register("address_default")}
              />
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3">代表者アカウント情報</h3>
            <p className="text-base text-gray-500">
                このメールアドレス宛に招待が送られ、企業の管理者（メインアカウント）として登録されます。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-lg font-medium text-gray-900 mb-2">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-400" />
                            代表者名 <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 text-lg text-gray-900 placeholder-gray-400"
                        placeholder="例: 山田 太郎"
                        {...register("representative_name", { required: true })}
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-gray-900 mb-2">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-gray-400" />
                            メールアドレス <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <input
                        type="email"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 text-lg text-gray-900 placeholder-gray-400"
                        placeholder="admin@example.com"
                        {...register("representative_email", { required: true })}
                    />
                </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-[#002B5C] hover:bg-[#002244] text-white px-10 py-6 text-xl font-bold rounded-lg shadow-lg">
              {isSubmitting ? "登録中..." : "企業を登録して招待を発行"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

