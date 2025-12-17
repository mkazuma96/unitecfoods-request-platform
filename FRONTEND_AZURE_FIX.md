# フロントエンド Azure デプロイ修正ガイド

## 🚨 問題の本質

`NEXT_PUBLIC_API_URL` が正しく反映されていない理由：
1. Next.js の環境変数はビルド時に埋め込まれる
2. Azure App Service の環境変数はランタイムのみ有効
3. フロントエンドのビルドは GitHub Actions で行われる
4. GitHub Actions でビルド時に環境変数を設定しているが、それが反映されていない

## 🔧 完全な解決手順

### ステップ1: Azure App Service のキャッシュをクリア

#### 方法A: Kudu Console で手動削除

1. Azure Portal → `unitech-request-platform-frontend`
2. **「高度なツール」** → **「移動」**
3. **「Debug Console」** → **「CMD」**
4. 以下のコマンドを実行：

```bash
cd /home/site/wwwroot
rm -rf *
rm -rf .next
```

5. Azure Portal に戻り、**「停止」** → 30秒待つ → **「開始」**

#### 方法B: Azure Portal で再デプロイ

1. Azure Portal → `unitech-request-platform-frontend`
2. **「デプロイ センター」**
3. **「同期」** ボタンをクリック（強制的に最新のコードを取得）

### ステップ2: GitHub Actions のビルドログを確認

1. GitHub → **「Actions」** タブ
2. 最新のワークフロー **「fix: API接続先をAzureバックエンドに固定」** を開く
3. **「build」** ジョブをクリック
4. **「npm install, build, and test」** を展開
5. 環境変数が正しく設定されているか確認：

```
env:
  NEXT_PUBLIC_API_URL: https://unitech-request-platform-backend.azurewebsites.net/api/v1
```

### ステップ3: ブラウザのキャッシュを完全にクリア

#### Service Worker を削除

1. **F12** で開発者ツールを開く
2. **「Application」** タブ
3. **「Service Workers」** を選択
4. **「Unregister」** をクリック

#### キャッシュストレージを削除

1. **「Application」** タブ
2. **「Storage」** → **「Clear site data」**
3. すべてにチェックを入れて **「Clear data」**

#### ハードリフレッシュ

- **Ctrl + Shift + R**（Windows）
- **Cmd + Shift + R**（Mac）

### ステップ4: 実際のコードを確認

#### Kudu Console で確認

```bash
cd /home/site/wwwroot
cat server.js | head -50
```

または

```bash
cd /home/site/wwwroot/.next
cat BUILD_ID
ls -la static/
```

---

## 🔧 代替案：環境変数を使わない方法（最も確実）

すでに `api.ts` を修正済みですが、念のため再確認：

### frontend/src/lib/api.ts の内容

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "https://unitech-request-platform-backend.azurewebsites.net/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**環境変数を一切使わず、直接URLを指定**

この変更がデプロイされていれば、必ず `https://unitech-request-platform-backend.azurewebsites.net/api/v1` に接続するはずです。

---

## 🐛 デバッグ：実際の接続先を確認

### ブラウザで確認

1. フロントエンドを開く
2. **F12** で開発者ツールを開く
3. **Console** タブで以下を実行：

```javascript
import("/src/lib/api.ts").then(module => console.log(module.default.defaults.baseURL))
```

または、Network タブでログイン時のリクエストURLを確認。

---

## ✅ 確認チェックリスト

- [ ] GitHub Actions のビルドが成功している
- [ ] `api.ts` に環境変数の記述がない（ハードコード）
- [ ] Azure App Service のキャッシュをクリア（再起動）
- [ ] ブラウザのキャッシュとService Workerをクリア
- [ ] Kudu Console でデプロイされたコードを確認
- [ ] ログイン時のNetwork タブで接続先URLを確認

---

## 📝 最終手段：完全な再デプロイ

1. **Azure Portal でフロントエンドを停止**
2. **Kudu Console でファイルを全削除**
3. **GitHub Actions を手動で再実行**
4. **Azure Portal でフロントエンドを開始**
5. **ブラウザのキャッシュを完全にクリア**

---

**作成日**: 2025年12月16日

