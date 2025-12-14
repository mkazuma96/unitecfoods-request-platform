"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

const inviteSchema = z.object({
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type InviteFormValues = z.infer<typeof inviteSchema>;

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
      if (!token) {
          setError("無効な招待リンクです。");
      }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormValues) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/users/accept-invite", {
          token: token,
          password: data.password
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "パスワードの設定に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-green-600">登録完了</h2>
                <p className="text-gray-600 mt-4">
                    パスワードの設定が完了しました。<br/>
                    新しいパスワードでログインしてください。
                </p>
                <div className="mt-8">
                    <Button 
                        onClick={() => router.push("/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        ログイン画面へ
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Unitec Connect</h1>
          <p className="mt-2 text-sm text-gray-600">アカウント登録（パスワード設定）</p>
        </div>

        {error ? (
             <div className="rounded-md bg-red-50 p-4 text-center">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                {!token && (
                    <Button variant="link" onClick={() => router.push("/login")} className="mt-2 text-red-600 underline">
                        ログイン画面へ戻る
                    </Button>
                )}
            </div>
        ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    新しいパスワード
                </label>
                <input
                    id="password"
                    type="password"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-base"
                    {...register("password")}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                </div>

                <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                    パスワード（確認）
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-base"
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
                </div>
            </div>

            <div>
                <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                {isSubmitting ? "設定中..." : "パスワードを設定して登録"}
                </Button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
