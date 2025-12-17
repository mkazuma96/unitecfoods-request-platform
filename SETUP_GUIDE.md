# Unitec Foods Request Platform - セットアップガイド

このガイドでは、Unitec Foods Request Platform のローカル開発環境のセットアップから Azure へのデプロイまでの完全な手順を説明します。

## 📋 目次

1. [前提条件](#-前提条件)
2. [Azureリソースの概要](#-azureリソースの概要)
3. [ローカル開発環境のセットアップ](#-ローカル開発環境のセットアップ)
4. [データベースの初期化](#-データベースの初期化)
5. [Azureへのデプロイ](#-azureへのデプロイ)
6. [トラブルシューティング](#-トラブルシューティング)
7. [運用とメンテナンス](#-運用とメンテナンス)

---

## 🔧 前提条件

### 必要なソフトウェア

- **Python**: `3.11.7` 以上
- **Node.js**: `22.15.0` 以上（推奨: `20.x` LTS以上）
- **npm**: `10.9.2` 以上
- **Git**: 最新版
- **Azure サブスクリプション**: アクセス権限
- **GitHub アカウント**: リポジトリへのアクセス権限

### 推奨ツール

- **IDE**: Cursor / VS Code
- **OS**: Windows / macOS / Linux
- **ブラウザ**: Chrome / Edge（開発者ツール使用）

---

## ☁️ Azureリソースの概要

### リソースグループ

- **名前**: `rg-001-gen10`
- **リージョン**: 複数（リソースにより異なる）

### MySQL Flexible Server

- **サーバー名**: `gen10-mysql-dev-01.mysql.database.azure.com`
- **リージョン**: `Canada Central`
- **MySQLバージョン**: `8.0`
- **コンピューティング**: `汎用目的_D4ads_v5 (4 vCore, 16 GiB RAM)`
- **ストレージ**: `64 GiB`（自動拡張: 有効）
- **IOPS**: `自動スケール IOPS`
- **バックアップ保持期間**: `7日`
- **ネットワーク**: `パブリック アクセス (許可されている IP アドレス)`
- **SSL/TLS**: `必須`
- **管理者ユーザー名**: `students`
- **管理者パスワード**: `10th-tech0`
- **データベース名**: `unitech_request_portal`

### App Service - Backend

- **名前**: `unitech-request-platform-backend`
- **URL**: `https://unitech-request-platform-backend.azurewebsites.net`
- **リージョン**: `East US`
- **App Service プラン**: `asp-east-us`
- **SKU**: `Basic (B2)`
- **ランタイム**: `Python 3.11`
- **OS**: `Linux`
- **デプロイ方法**: `GitHub Actions`

### App Service - Frontend

- **名前**: `unitech-request-platform-frontend`
- **URL**: `https://unitech-request-platform-frontend.azurewebsites.net`
- **リージョン**: `East US`
- **App Service プラン**: `asp-east-us`
- **SKU**: `Basic (B2)`
- **ランタイム**: `Node 24-lts`
- **OS**: `Linux`
- **デプロイ方法**: `GitHub Actions`

### GitHub Repository

- **URL**: `https://github.com/mkazuma96/unitecfoods-request-platform`
- **メインブランチ**: `main`

---

## 💻 ローカル開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/mkazuma96/unitecfoods-request-platform.git
cd unitecfoods-request-platform
```

### 2. バックエンドのセットアップ

#### 2.1 仮想環境の作成と有効化

**Windows（PowerShell）:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
```

#### 2.2 依存関係のインストール

```bash
pip install -r requirements.txt
```

#### 2.3 環境変数の設定

`backend/.env` ファイルを作成：

```bash
# ローカル開発用（SQLite）
SECRET_KEY="YOUR_SUPER_SECRET_KEY_FOR_DEV_ONLY"
DATABASE_URL="sqlite:///./sql_app.db"
BACKEND_CORS_ORIGINS="http://localhost:3000,http://localhost:8000"

# Azure MySQL用（本番環境）
# SECRET_KEY="your-production-secret-key-here"
# DATABASE_URL="mysql+mysqldb://students:10th-tech0@gen10-mysql-dev-01.mysql.database.azure.com/unitech_request_portal?ssl_ca=/etc/ssl/certs/ca-certificates.crt"
# BACKEND_CORS_ORIGINS="https://unitech-request-platform-frontend.azurewebsites.net,http://localhost:3000"
```

> **⚠️ セキュリティ注意:**
> - `.env` ファイルは `.gitignore` に含まれており、Gitにコミットされません
> - 本番環境の `SECRET_KEY` は必ず変更してください
> - パスワードなどの機密情報を直接コードに書かないでください

### 3. フロントエンドのセットアップ

別のターミナルウィンドウを開いて：

#### 3.1 依存関係のインストール

```bash
cd frontend
npm install
```

#### 3.2 環境変数の設定（オプション）

フロントエンドの環境変数は主にビルド時に GitHub Actions で設定されますが、ローカルでテストする場合は `.env.local` を作成できます：

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

> **📝 Note:** Next.js では `NEXT_PUBLIC_` で始まる環境変数のみがクライアント側で利用可能です。

---

## 🗄️ データベースの初期化

### ローカル開発（SQLite）

#### 1. データベースのリセット（必要な場合）

**Windows（PowerShell）:**
```powershell
taskkill /F /IM python.exe
Remove-Item -Path "backend/sql_app.db" -Force -ErrorAction SilentlyContinue
```

**macOS / Linux:**
```bash
rm -f backend/sql_app.db
```

#### 2. バックエンドサーバーの起動

バックエンドを起動すると、`init_db()` が自動的に実行され、テーブルと初期データが作成されます。

```bash
cd backend
uvicorn app.main:app --reload
```

起動後、以下のURLでAPIドキュメントにアクセスできます：
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

#### 3. 初期アカウント

初期セットアップ後、以下のアカウントが利用可能です：

| メールアドレス | パスワード | ロール | 企業 |
|--------------|-----------|--------|------|
| `admin@unitec.com` | `admin123` | `UNITEC_ADMIN` | Unitec Foods |
| `user@client-a.com` | `client123` | `CLIENT_ADMIN` | テックゼロ食品株式会社 |

#### 4. 初期課題データ

以下のサンプル課題が登録されています：
- **REQ-001**: 低糖質クッキーの食感改善（緊急度: 高）
- **REQ-002**: 新商品向けイチゴフレーバーの提案（緊急度: 中）

### Azure MySQL（本番環境）

#### 1. ファイアウォール規則の設定

Azure Portal で MySQL サーバーを開き、接続元IPアドレスを許可：

1. Azure Portal → `gen10-mysql-dev-01`
2. **「ネットワーク」** → **「ファイアウォール規則」**
3. **「現在のクライアント IP アドレスを追加」** をクリック
4. または、**「Azure サービスへのパブリック アクセスを許可する」** を有効化

#### 2. データベースの作成

データベース `unitech_request_portal` が存在することを確認：

1. Azure Portal → `gen10-mysql-dev-01`
2. **「データベース」** タブ
3. `unitech_request_portal` が存在しない場合は作成

#### 3. 初期データの投入

バックエンド App Service が起動すると、`backend/app/db/init_db.py` が自動的に実行され、テーブルと初期データが作成されます。

手動で実行する場合（ローカルから Azure MySQL に接続）：

```bash
# backend/.env を Azure MySQL用に変更してから
cd backend
python -c "from app.db.init_db import init_db; init_db()"
```

---

## 🚀 ローカルでのアプリケーション起動

### バックエンドの起動

```bash
cd backend
# 仮想環境が有効化されていることを確認
uvicorn app.main:app --reload
```

**起動確認:**
- バックエンドAPI: `http://localhost:8000`
- APIドキュメント: `http://localhost:8000/docs`

### フロントエンドの起動

別のターミナルで：

```bash
cd frontend
npm run dev
```

**起動確認:**
- フロントエンド: `http://localhost:3000`
- ログイン画面が表示されることを確認

### 動作確認

1. ブラウザで `http://localhost:3000` にアクセス
2. 管理者アカウントでログイン: `admin@unitec.com` / `admin123`
3. ダッシュボードが表示されることを確認
4. 課題一覧で初期課題が表示されることを確認

---

## ☁️ Azureへのデプロイ

### GitHub Actions による自動デプロイ

このプロジェクトは GitHub Actions を使用して、`main` ブランチへのプッシュ時に自動的にデプロイされます。

#### デプロイワークフロー

1. **バックエンド**: `.github/workflows/main_unitech-request-platform-backend.yml`
   - トリガー: `backend/**` または ワークフローファイル自体の変更
   - ビルド: Python 3.11、依存関係インストール
   - デプロイ: Azure App Service (Backend)

2. **フロントエンド**: `.github/workflows/main_unitech-request-platform-frontend.yml`
   - トリガー: `frontend/**` または ワークフローファイル自体の変更
   - ビルド: Next.js Standalone Mode
   - デプロイ: Azure App Service (Frontend)

#### デプロイ手順

1. **ローカルで変更をコミット:**

```bash
git add .
git commit -m "機能: XXXを追加"
git push origin main
```

2. **GitHub Actions の実行を確認:**

- GitHub リポジトリ → **「Actions」** タブ
- ワークフローの実行状況を確認
- エラーがある場合はログを確認

3. **デプロイ完了後の確認:**

- バックエンド: `https://unitech-request-platform-backend.azurewebsites.net/docs`
- フロントエンド: `https://unitech-request-platform-frontend.azurewebsites.net`

### Azure App Service の環境変数設定

#### バックエンド環境変数

Azure Portal → `unitech-request-platform-backend` → **「環境変数」**

| 名前 | 値 |
|------|-----|
| `DATABASE_URL` | `mysql+mysqldb://students:10th-tech0@gen10-mysql-dev-01.mysql.database.azure.com/unitech_request_portal` |
| `SECRET_KEY` | `your-production-secret-key-here` |
| `BACKEND_CORS_ORIGINS` | `https://unitech-request-platform-frontend.azurewebsites.net,http://localhost:3000` |

#### フロントエンド環境変数

GitHub Actions の `.github/workflows/main_unitech-request-platform-frontend.yml` の `build` ステップで設定：

```yaml
env:
  NEXT_PUBLIC_API_URL: https://unitech-request-platform-backend.azurewebsites.net/api/v1
```

> **📝 Note:** Next.js のビルド時環境変数は、GitHub Actions で設定します。Azure App Service の環境変数ではありません。

#### スタートアップコマンド

**バックエンド:**

Azure Portal → `unitech-request-platform-backend` → **「構成」** → **「全般設定」** → **「スタートアップコマンド」**

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --timeout 600
```

**フロントエンド:**

Azure Portal → `unitech-request-platform-frontend` → **「構成」** → **「全般設定」** → **「スタートアップコマンド」**

```bash
/bin/sh start.sh
```

> **📝 Note:** `start.sh` は GitHub Actions のビルドステップで自動生成されます。

---

## 🐛 トラブルシューティング

### ローカル開発

#### エラー: `ModuleNotFoundError: No module named 'XXX'`

**原因:** 依存関係がインストールされていない、または仮想環境が有効化されていない

**解決方法:**
```bash
# 仮想環境を有効化
cd backend
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # macOS/Linux

# 依存関係を再インストール
pip install -r requirements.txt
```

#### エラー: `CORS policy: No 'Access-Control-Allow-Origin' header`

**原因:** バックエンドのCORS設定が正しくない

**解決方法:**
1. `backend/.env` の `BACKEND_CORS_ORIGINS` にフロントエンドのURLが含まれているか確認
2. バックエンドサーバーを再起動

#### エラー: ログインできない

**原因:** データベースが初期化されていない、または認証情報が間違っている

**解決方法:**
1. バックエンドのログを確認: `uvicorn app.main:app --reload`
2. データベースをリセットして再起動
3. 初期アカウントでログイン: `admin@unitec.com` / `admin123`

### Azure デプロイ

#### エラー: GitHub Actions のビルドが失敗

**原因:** 依存関係のインストールエラー、Python/Node.jsバージョンの不一致

**解決方法:**
1. GitHub Actions のログを確認
2. ローカルで同じコマンドを実行してエラーを再現
3. `requirements.txt` または `package.json` を確認
4. ワークフローファイルの Python/Node.js バージョンを確認

#### エラー: デプロイは成功するがアプリが起動しない

**原因:** 環境変数の設定ミス、スタートアップコマンドのエラー

**解決方法:**
1. Azure Portal → App Service → **「ログストリーム」** でエラーを確認
2. **「環境変数」** が正しく設定されているか確認
3. **「スタートアップコマンド」** が正しいか確認
4. **「ファイアウォール規則」** でデータベース接続が許可されているか確認

#### エラー: `MySQL server has gone away`

**原因:** データベース接続がタイムアウトした

**解決方法:**
- `backend/app/db/session.py` で接続プーリングが正しく設定されているか確認
- 現在の設定:
  ```python
  pool_pre_ping=True
  pool_recycle=3600
  pool_size=10
  max_overflow=20
  ```

#### エラー: `SSL connection error`

**原因:** SSL/TLS設定が正しくない

**解決方法:**
- `backend/app/db/session.py` のSSL設定を確認:
  ```python
  connect_args = {
      "ssl_mode": "REQUIRED",
      "ssl": {"check_hostname": False}
  }
  ```

#### エラー: フロントエンドがバックエンドに接続できない

**原因:** `NEXT_PUBLIC_API_URL` が正しく設定されていない

**解決方法:**
1. `.github/workflows/main_unitech-request-platform-frontend.yml` の `env` セクションを確認:
   ```yaml
   env:
     NEXT_PUBLIC_API_URL: https://unitech-request-platform-backend.azurewebsites.net/api/v1
   ```
2. `/api/v1` のサフィックスが含まれているか確認
3. 変更後、再デプロイ（push to main）

#### エラー: `Table 'XXX' already exists`

**原因:** データベーステーブルが既に存在する状態で再作成しようとした

**解決方法:**
- `backend/app/db/init_db.py` にはエラーハンドリングが実装されており、このエラーは無視されます
- ログに警告として表示されますが、アプリは正常に起動します

### ログの確認方法

#### Azure App Service のログストリーム

1. Azure Portal → App Service
2. **「ログストリーム」** をクリック
3. **「Lookback period」** を **「Last 10 minutes」** に設定
4. リアルタイムでログを確認

#### Kudu Console（高度なトラブルシューティング）

1. Azure Portal → App Service → **「高度なツール」** → **「移動」**
2. メニューから **「Debug Console」** → **「CMD」** または **「PowerShell」**
3. ファイルシステムを確認:
   ```bash
   cd /home/site/wwwroot
   ls -la
   ```

#### GitHub Actions のログ

1. GitHub リポジトリ → **「Actions」** タブ
2. 失敗したワークフローをクリック
3. 各ステップのログを展開して確認

---

## 🔐 セキュリティのベストプラクティス

### 環境変数の管理

- ❌ **絶対にしないこと:** `.env` ファイルをGitにコミット
- ✅ **すべきこと:** `.gitignore` に `.env` を追加（既に設定済み）
- ✅ **すべきこと:** 本番環境では強力な `SECRET_KEY` を使用
- ✅ **すべきこと:** Azure Key Vault の使用を検討（将来的に）

### データベース接続

- ✅ **SSL/TLS接続を必須にする** （既に設定済み）
- ✅ **ファイアウォール規則で接続元を制限**
- ✅ **強力なパスワードを使用**

### CORS設定

- ✅ **本番環境では特定のオリジンのみ許可**
- ❌ **`*`（ワイルドカード）を使用しない**

---

## 📊 運用とメンテナンス

### データベースのバックアップ

Azure MySQL Flexible Server は自動バックアップを提供します：

- **保持期間**: 7日間（設定で変更可能）
- **復元方法**: Azure Portal → MySQL サーバー → **「復元」**

### コスト管理

#### 現在の構成（月額概算）

| リソース | SKU/構成 | 推定コスト |
|---------|----------|-----------|
| MySQL Flexible Server | Standard_D4ads_v5, 64 GiB | ¥15,000-20,000 |
| App Service (Backend) | Basic B2 | ¥4,000-6,000 |
| App Service (Frontend) | Basic B2 | ¥4,000-6,000 |
| **合計** | | **¥23,000-32,000** |

#### コスト削減のヒント

- **開発環境**: 使用しない時間帯は App Service を停止
- **MySQL**: 小規模な開発には `Burstable` プランを検討
- **App Service プラン**: 同じプランで複数のアプリをホスト可能

### モニタリング

#### Azure Monitor

1. Azure Portal → リソース → **「メトリック」**
2. 監視項目:
   - CPU使用率
   - メモリ使用率
   - データベース接続数
   - HTTPレスポンスタイム

#### アラートの設定

1. Azure Portal → リソース → **「アラート」** → **「新しいアラートルール」**
2. 推奨アラート:
   - CPU使用率 > 80%
   - メモリ使用率 > 90%
   - HTTPエラー率 > 5%

### スケーリング

#### 垂直スケーリング（スケールアップ）

- MySQL: より大きなコンピューティングサイズに変更
- App Service: より上位のSKUに変更（B2 → S1 → P1V2）

#### 水平スケーリング（スケールアウト）

- App Service: インスタンス数を増やす（自動スケーリングも可能）

---

## 📚 参考資料

### 公式ドキュメント

- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/docs)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Azure Database for MySQL](https://docs.microsoft.com/ja-jp/azure/mysql/flexible-server/)
- [Azure App Service](https://docs.microsoft.com/ja-jp/azure/app-service/)

### プロジェクト構成

```
unitecfoods-request-platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPIアプリケーションのエントリーポイント
│   │   ├── db/
│   │   │   ├── session.py       # データベース接続設定
│   │   │   └── init_db.py       # 初期データ作成
│   │   ├── models/              # SQLAlchemyモデル
│   │   ├── schemas/             # Pydanticスキーマ
│   │   ├── api/                 # APIエンドポイント
│   │   └── core/                # 認証・セキュリティ
│   ├── requirements.txt         # Python依存関係
│   └── .env                     # 環境変数（gitignore）
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # Reactコンポーネント
│   │   └── lib/                 # ユーティリティ（API client等）
│   ├── package.json             # Node.js依存関係
│   └── next.config.ts           # Next.js設定
├── .github/
│   └── workflows/               # GitHub Actions
└── .gitignore
```

---

## 🎓 よくある質問（FAQ）

### Q1: ローカルでSQLiteを使いたいのですが？

**A:** デフォルトでは SQLite を使用します。`backend/.env` で以下のように設定：
```bash
DATABASE_URL="sqlite:///./sql_app.db"
```

### Q2: Azure MySQL に接続したいのですが？

**A:** `backend/.env` で以下のように設定：
```bash
DATABASE_URL="mysql+mysqldb://students:10th-tech0@gen10-mysql-dev-01.mysql.database.azure.com/unitech_request_portal"
```

ファイアウォール規則で接続元IPを許可することも忘れずに。

### Q3: デプロイ時にバックエンドだけ/フロントエンドだけをデプロイしたい

**A:** GitHub Actions のワークフローは `paths` フィルタを使用しています：
- バックエンドのみ変更: `backend/**` のファイルを変更してpush
- フロントエンドのみ変更: `frontend/**` のファイルを変更してpush

### Q4: 初期データをリセットしたい

**A:**
- **ローカル（SQLite）**: データベースファイルを削除して再起動
- **Azure MySQL**: Azure Portal でデータベースを削除して再作成、またはテーブルを手動削除

### Q5: エラーログはどこで確認できますか？

**A:**
- **ローカル**: ターミナルの出力
- **Azure**: Azure Portal → App Service → **「ログストリーム」**
- **GitHub Actions**: GitHub リポジトリ → **「Actions」** タブ

---

## 📞 サポート

### 問題が解決しない場合

1. **エラーメッセージ全文**を確認
2. **ログストリーム**を確認（Azure）
3. **GitHub Issues** でissueを作成（該当する場合）
4. このガイドの **「トラブルシューティング」** セクションを再確認

---

**最終更新日**: 2025年12月16日
**バージョン**: 1.0.0

