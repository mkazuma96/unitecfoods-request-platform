"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

// Simple form type for MVP
type NewIssueForm = {
  title: string;
  category: string;
  product_name: string;
  description: string;
  urgency: "high" | "middle" | "low";
  is_sample_provided: boolean;
};

export default function NewIssuePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<NewIssueForm>();

  const onSubmit = async (data: NewIssueForm) => {
    setIsSubmitting(true);
    try {
      // MVP: Send minimal data
      await api.post("/issues", {
        ...data,
        ingredients: [] // Empty for now
      });
      router.push("/client/issues");
    } catch (error) {
      console.error("Failed to create issue", error);
      alert("登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規課題の登録</h1>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900">課題タイトル</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
              placeholder="例: 低糖質クッキーの食感改善"
              {...register("title")}
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900">対象商品名</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
              placeholder="例: ロカボクッキー"
              {...register("product_name")}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900">カテゴリ</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
              {...register("category")}
            >
              <option value="flavor">フレーバー (味・香り)</option>
              <option value="texture">テクスチャー (食感)</option>
              <option value="preservation">保存性・物性</option>
              <option value="other">その他</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900">詳細・要望</label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
              placeholder="具体的な課題や目指したいゴールを入力してください..."
              {...register("description")}
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-900">緊急度</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input type="radio" value="low" className="text-blue-600 border-gray-300" {...register("urgency")} />
                <span className="ml-2 text-gray-700">低</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" value="middle" className="text-blue-600 border-gray-300" defaultChecked {...register("urgency")} />
                <span className="ml-2 text-gray-700">中</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" value="high" className="text-red-600 border-gray-300" {...register("urgency")} />
                <span className="ml-2 text-red-600 font-bold">高</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "課題を登録する"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

