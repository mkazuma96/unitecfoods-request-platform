"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";

type InviteForm = {
    name: string;
    email: string;
};

export default function InviteMemberPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invitationLink, setInvitationLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<InviteForm>();

    const onSubmit = async (data: InviteForm) => {
        setIsSubmitting(true);
        setError(null);
        setInvitationLink(null);

        try {
            const response = await api.post("/users/invite", data);
            setInvitationLink(response.data.invitation_link);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "招待に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        if (invitationLink) {
            navigator.clipboard.writeText(invitationLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                 <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
                   <ArrowLeft className="h-4 w-4 mr-2" />
                   戻る
                 </Button>
                 <h1 className="text-2xl font-bold text-gray-900">担当者登録</h1>
            </div>

            <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
                {!invitationLink ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800 mb-6">
                            新しい担当者を招待します。登録されたメールアドレス宛に招待メール（デバッグ中は画面表示）が送信されます。
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">担当者名</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                placeholder="例: 山田 太郎"
                                {...register("name", { required: "担当者名は必須です" })}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">メールアドレス (ログインID)</label>
                            <input
                                type="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                placeholder="user@example.com"
                                {...register("email", { 
                                    required: "メールアドレスは必須です",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "有効なメールアドレスを入力してください"
                                    }
                                })}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSubmitting ? "送信中..." : "招待メールを送信"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">招待を作成しました</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            以下のリンクをコピーして、招待する担当者に共有してください。<br/>
                            (本来はメールで送信されますが、開発環境のためここに表示しています)
                        </p>
                        
                        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border border-gray-200 mb-6">
                            <input 
                                type="text" 
                                readOnly 
                                value={invitationLink} 
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-600 w-full"
                            />
                            <Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <Button onClick={() => { setInvitationLink(null); router.refresh(); }} variant="outline">
                            続けて登録する
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

