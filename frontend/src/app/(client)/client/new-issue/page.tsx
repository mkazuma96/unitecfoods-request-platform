"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Mic, Calendar as CalendarIcon, Upload, X } from "lucide-react";

type IngredientForm = {
  name: string;
  amount: string;
};

type AttachmentForm = {
  file_name: string;
  file_path: string;
  file_type?: string;
};

type NewIssueForm = {
  title: string;
  product_name: string;
  category: string;
  description: string;
  ingredients: IngredientForm[];
  urgency: "high" | "middle" | "low";
  client_arbitrary_code?: string;
  desired_deadline?: string;
  is_sample_provided: boolean;
  sample_shipping_info?: string;
  attachments: AttachmentForm[];
};

export default function NewIssuePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { register, control, handleSubmit, setValue, watch } = useForm<NewIssueForm>({
    defaultValues: {
      ingredients: [{ name: "", amount: "" }],
      attachments: [],
      urgency: "middle",
      is_sample_provided: false,
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: "ingredients",
  });

  const { fields: attachmentFields, append: appendAttachment, remove: removeAttachment } = useFieldArray({
    control,
    name: "attachments",
  });

  const isSampleProvided = watch("is_sample_provided");

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]); // Single file upload for now, loop for multiple

      const response = await api.post("/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedFile = response.data;
      appendAttachment({
        file_name: uploadedFile.file_name,
        file_path: uploadedFile.file_path,
        file_type: uploadedFile.file_type,
      });
    } catch (error) {
      console.error("Upload failed", error);
      alert("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  // Mock Voice Input
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("お使いのブラウザは音声入力に対応していません。");
      return;
    }
    
    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentDesc = watch("description") || "";
      setValue("description", currentDesc + (currentDesc ? "\n" : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const onSubmit = async (data: NewIssueForm, status: "untouched" | "draft" = "untouched") => {
    setIsSubmitting(true);
    try {
      // Filter out empty ingredients
      const validIngredients = data.ingredients.filter(
        (ing) => ing.name.trim() !== "" && ing.amount.trim() !== ""
      );

      // Prepare payload
      const payload = {
        ...data,
        ingredients: validIngredients,
        status: status,
        // Ensure deadline format or null
        desired_deadline: data.desired_deadline ? data.desired_deadline : null,
      };

      await api.post("/issues", payload);
      router.push("/client/issues");
    } catch (error) {
      console.error("Failed to create issue", error);
      alert("登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規課題の登録</h1>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit((data) => onSubmit(data, "untouched"))} className="space-y-8">
          
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">基本情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-900">課題タイトル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
                  placeholder="例: 低糖質クッキーの食感改善"
                  {...register("title")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">対象商品名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
                  placeholder="例: ロカボクッキー"
                  {...register("product_name")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">カテゴリ</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                  {...register("category")}
                >
                  <option value="flavor">フレーバー (味・香り)</option>
                  <option value="texture">テクスチャー (食感)</option>
                  <option value="preservation">保存性・物性</option>
                  <option value="cost">コストダウン</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
               <div>
                <label className="block text-sm font-medium text-gray-900">任意管理コード</label>
                <input
                  type="text"
                  pattern="^[a-zA-Z0-9\-_]+$"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
                  placeholder="例: PROJ-001 (英数字のみ)"
                  {...register("client_arbitrary_code")}
                />
              </div>
            </div>
          </div>

          {/* Detail Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">詳細・要望</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                具体的な課題と要望 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={6}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 placeholder-gray-400"
                  placeholder="具体的な課題や目指したいゴールを入力してください..."
                  {...register("description")}
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`absolute bottom-2 right-2 p-2 rounded-full ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  title="音声入力"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">※マイクボタンを押して音声で入力できます。</p>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">現行配分 (レシピ)</h3>
            <p className="text-sm text-gray-500">食品の現行配分がわかる場合、入力してください。</p>
            
            <div className="space-y-2">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="素材名 (例: 小麦粉)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                    {...register(`ingredients.${index}.name` as const)}
                  />
                  <input
                    type="text"
                    placeholder="分量 (例: 100g / 30%)"
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                    {...register(`ingredients.${index}.amount` as const)}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendIngredient({ name: "", amount: "" })}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                素材を追加
              </Button>
            </div>
          </div>

          {/* Other Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">その他設定</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-900">緊急度</label>
                <div className="mt-2 flex space-x-4">
                  <label className="inline-flex items-center">
                    <input type="radio" value="low" className="text-blue-600 border-gray-300" {...register("urgency")} />
                    <span className="ml-2 text-gray-700">低</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" value="middle" className="text-blue-600 border-gray-300" {...register("urgency")} />
                    <span className="ml-2 text-gray-700">中</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" value="high" className="text-red-600 border-gray-300" {...register("urgency")} />
                    <span className="ml-2 text-red-600 font-bold">高</span>
                  </label>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-900">希望回答期限</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2 text-gray-900"
                    {...register("desired_deadline")}
                  />
                </div>
              </div>
            </div>

            {/* Sample */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="sample_provided"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    {...register("is_sample_provided")}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="sample_provided" className="font-medium text-gray-900">現行品のサンプルを送付する</label>
                  <p className="text-gray-500">チェックを入れると、Unitec Foodsへの送付方法が表示されます。</p>
                </div>
              </div>
              
              {isSampleProvided && (
                <div className="mt-4 pl-7 space-y-3">
                  <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="font-bold mb-1">【サンプル送付先】</p>
                    <p>〒103-0000 東京都中央区日本橋X-X-X</p>
                    <p>ユニテックフーズ株式会社 研究開発部 宛</p>
                    <p className="mt-2 text-xs">※ 送付状に、この課題の「任意管理コード」または自動発行される「課題コード」を記載してください。</p>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-900">追跡番号・送付メモ (任意)</label>
                     <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                      placeholder="例: ヤマト運輸 1234-5678-9012 / 明日発送予定"
                      {...register("sample_shipping_info")}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Attachments (Implemented) */}
            <div>
               <label className="block text-sm font-medium text-gray-900">添付ファイル</label>
               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#002B5C] hover:text-[#002244] focus-within:outline-none">
                        <span>{isUploading ? "アップロード中..." : "ファイルをアップロード"}</span>
                        <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                      </label>
                      {!isUploading && <p className="pl-1">またはドラッグ＆ドロップ</p>}
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, Excel up to 10MB
                    </p>
                  </div>
                </div>

                {/* File List */}
                {attachmentFields.length > 0 && (
                    <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 rounded-md">
                        {attachmentFields.map((field, index) => (
                            <li key={field.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <div className="w-0 flex-1 flex items-center">
                                    <span className="ml-2 flex-1 w-0 truncate text-gray-900">{field.file_name}</span>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        削除
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
            <Button
                type="button"
                variant="ghost"
                onClick={() => handleSubmit((data) => onSubmit(data, "draft"))()}
                className="text-gray-600"
            >
                下書き保存
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#002B5C] hover:bg-[#002244] text-white px-8">
              {isSubmitting ? "送信中..." : "課題を登録する"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
