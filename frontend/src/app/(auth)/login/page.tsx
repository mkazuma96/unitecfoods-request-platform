"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("username", data.email);
      params.append("password", data.password);

      const response = await api.post("/auth/login/access-token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      
      if (data.email.includes("unitec")) {
          router.push("/admin/dashboard");
      } else {
          router.push("/client/issues");
      }
      
    } catch (err: any) {
      console.error(err);
      setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-unitec-dark-blue tracking-wider uppercase">
            UNITEC FOODS
          </h1>
          <div className="flex justify-center mt-2 mb-8">
             <div className="h-1 w-16 bg-unitec-dark-blue"></div>
             <div className="h-1 w-16 bg-unitec-yellow"></div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800">
            食品開発ナレッジプラットフォーム
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ログインしてご利用ください
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                ユーザー名
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-unitec-dark-blue focus:border-unitec-dark-blue focus:z-10 text-base"
                placeholder="ユーザー名 (メールアドレス)"
                {...register("email")}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-unitec-dark-blue focus:border-unitec-dark-blue focus:z-10 text-base"
                placeholder="パスワード"
                {...register("password")}
              />
            </div>
          </div>

          {(errors.email || errors.password) && (
             <div className="text-sm text-red-600 space-y-1">
                {errors.email && <p>{errors.email.message}</p>}
                {errors.password && <p>{errors.password.message}</p>}
             </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#002B5C] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002B5C]"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </div>

          {/* Helper Info */}
          <div className="text-center text-xs text-gray-400 mt-8 space-y-1">
             <p className="font-medium">初期アカウント</p>
             <p>admin@unitec.com / admin123</p>
             <p>user@client-a.com / client123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

