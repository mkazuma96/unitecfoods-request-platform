# Azure App Service 環境変数設定ガイド

このガイドでは、Azure App Service（Backend）に設定すべき環境変数の完全なリストと設定手順を説明します。

## 📋 設定すべき環境変数の完全リスト

### 🔐 Security Settings（必須）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `SECRET_KEY` | `uB4@7Pqks4z6qwpZ` | JWT トークンの署名キー（本番では変更推奨） |
| `ALGORITHM` | `HS256` | JWT アルゴリズム |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `11520` | トークン有効期限（8日） |

### 🗄️ Database Settings（必須）

#### オプション1: 個別形式（推奨 - 左側のアプリと同じ形式）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `MYSQL_HOST` | `gen10-mysql-dev-01.mysql.database.azure.com` | MySQLサーバーのホスト名 |
| `MYSQL_PORT` | `3306` | MySQLポート番号 |
| `MYSQL_DATABASE` | `unitech_request_portal` | データベース名 |
| `MYSQL_USER` | `students` | データベースユーザー名 |
| `MYSQL_PASSWORD` | `10th-tech0` | データベースパスワード |

#### オプション2: URL形式（現在使用中）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DATABASE_URL` | `mysql+mysqldb://students:10th-tech0@gen10-mysql-dev-01.mysql.database.azure.com/unitech_request_portal` | データベース接続URL |

> **💡 推奨:** オプション1（個別形式）とオプション2（URL形式）の**両方を設定**することで、柔軟性が高まります。

#### MySQL SSL設定（必須）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `MYSQL_SSL_MODE` | `REQUIRED` | SSL接続を必須にする |
| `MYSQL_SSL_CA` | `/etc/ssl/certs/ca-certificates.crt` | SSL証明書のパス |

#### 接続プール設定（推奨）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DB_POOL_SIZE` | `10` | コネクションプールのサイズ |
| `DB_MAX_OVERFLOW` | `20` | プール満杯時の追加接続数 |
| `DB_POOL_RECYCLE` | `3600` | 接続の再作成間隔（秒） |
| `DB_POOL_PRE_PING` | `true` | 接続使用前の確認 |

### 🌐 CORS Settings（必須）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `BACKEND_CORS_ORIGINS` | `https://unitech-request-platform-frontend.azurewebsites.net,http://localhost:3000` | CORS許可オリジン（カンマ区切り） |

### 🖥️ Server Settings（必須）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `HOST` | `0.0.0.0` | サーバーホスト |
| `PORT` | `8000` | サーバーポート |
| `WEBSITES_PORT` | `8000` | Azure App Service用ポート |
| `WORKERS` | `4` | Gunicorn ワーカー数 |
| `TIMEOUT` | `600` | リクエストタイムアウト（秒） |

### ☁️ Azure Settings（必須）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` | デプロイ時のビルドを無効化 |
| `WEBSITES_CONTAINER_START_TIME_LIMIT` | `600` | コンテナ起動タイムアウト（秒） |

### 📱 Application Settings（推奨）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `APP_NAME` | `Unitec Foods Request Platform` | アプリケーション名 |
| `ENVIRONMENT` | `production` | 実行環境 |
| `DEBUG` | `false` | デバッグモード（本番では false） |
| `LOG_LEVEL` | `INFO` | ログレベル |

### 📁 File Upload Settings（推奨）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `UPLOAD_DIR` | `./uploads` | アップロードディレクトリ |
| `MAX_FILE_SIZE` | `10` | 最大ファイルサイズ（MB） |
| `ALLOWED_EXTENSIONS` | `.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif` | 許可する拡張子 |

### 🚩 Feature Flags（オプション）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `ENABLE_EMAIL` | `false` | メール送信機能 |
| `ENABLE_FILE_UPLOAD` | `true` | ファイルアップロード機能 |
| `ENABLE_RATE_LIMIT` | `false` | APIレート制限 |

---

## 🔧 Azure Portal での設定手順

### ステップ1: App Service を開く

1. [Azure Portal](https://portal.azure.com) にログイン
2. **`unitech-request-platform-backend`** を検索して開く

### ステップ2: 環境変数ページに移動

1. 左メニューから **「設定」** → **「環境変数」** をクリック
2. **「アプリ設定」** タブを選択

### ステップ3: 環境変数を追加

#### 方法A: 1つずつ追加

1. **「+ 追加」** ボタンをクリック
2. **名前** と **値** を入力
3. **「OK」** をクリック
4. すべての変数を追加するまで繰り返す
5. 最後に **「保存」** をクリック

#### 方法B: JSON で一括追加（推奨）

1. **「高度な編集」** をクリック
2. 以下のJSONをコピー＆ペースト

```json
[
  {
    "name": "SECRET_KEY",
    "value": "uB4@7Pqks4z6qwpZ",
    "slotSetting": false
  },
  {
    "name": "ALGORITHM",
    "value": "HS256",
    "slotSetting": false
  },
  {
    "name": "ACCESS_TOKEN_EXPIRE_MINUTES",
    "value": "11520",
    "slotSetting": false
  },
  {
    "name": "MYSQL_HOST",
    "value": "gen10-mysql-dev-01.mysql.database.azure.com",
    "slotSetting": false
  },
  {
    "name": "MYSQL_PORT",
    "value": "3306",
    "slotSetting": false
  },
  {
    "name": "MYSQL_DATABASE",
    "value": "unitech_request_portal",
    "slotSetting": false
  },
  {
    "name": "MYSQL_USER",
    "value": "students",
    "slotSetting": false
  },
  {
    "name": "MYSQL_PASSWORD",
    "value": "10th-tech0",
    "slotSetting": false
  },
  {
    "name": "MYSQL_SSL_MODE",
    "value": "REQUIRED",
    "slotSetting": false
  },
  {
    "name": "MYSQL_SSL_CA",
    "value": "/etc/ssl/certs/ca-certificates.crt",
    "slotSetting": false
  },
  {
    "name": "DATABASE_URL",
    "value": "mysql+mysqldb://students:10th-tech0@gen10-mysql-dev-01.mysql.database.azure.com/unitech_request_portal",
    "slotSetting": false
  },
  {
    "name": "DB_POOL_SIZE",
    "value": "10",
    "slotSetting": false
  },
  {
    "name": "DB_MAX_OVERFLOW",
    "value": "20",
    "slotSetting": false
  },
  {
    "name": "DB_POOL_RECYCLE",
    "value": "3600",
    "slotSetting": false
  },
  {
    "name": "DB_POOL_PRE_PING",
    "value": "true",
    "slotSetting": false
  },
  {
    "name": "BACKEND_CORS_ORIGINS",
    "value": "https://unitech-request-platform-frontend.azurewebsites.net,http://localhost:3000",
    "slotSetting": false
  },
  {
    "name": "HOST",
    "value": "0.0.0.0",
    "slotSetting": false
  },
  {
    "name": "PORT",
    "value": "8000",
    "slotSetting": false
  },
  {
    "name": "WEBSITES_PORT",
    "value": "8000",
    "slotSetting": false
  },
  {
    "name": "WORKERS",
    "value": "4",
    "slotSetting": false
  },
  {
    "name": "TIMEOUT",
    "value": "600",
    "slotSetting": false
  },
  {
    "name": "SCM_DO_BUILD_DURING_DEPLOYMENT",
    "value": "false",
    "slotSetting": false
  },
  {
    "name": "WEBSITES_CONTAINER_START_TIME_LIMIT",
    "value": "600",
    "slotSetting": false
  },
  {
    "name": "APP_NAME",
    "value": "Unitec Foods Request Platform",
    "slotSetting": false
  },
  {
    "name": "ENVIRONMENT",
    "value": "production",
    "slotSetting": false
  },
  {
    "name": "DEBUG",
    "value": "false",
    "slotSetting": false
  },
  {
    "name": "LOG_LEVEL",
    "value": "INFO",
    "slotSetting": false
  },
  {
    "name": "UPLOAD_DIR",
    "value": "./uploads",
    "slotSetting": false
  },
  {
    "name": "MAX_FILE_SIZE",
    "value": "10",
    "slotSetting": false
  },
  {
    "name": "ALLOWED_EXTENSIONS",
    "value": ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif",
    "slotSetting": false
  },
  {
    "name": "ENABLE_EMAIL",
    "value": "false",
    "slotSetting": false
  },
  {
    "name": "ENABLE_FILE_UPLOAD",
    "value": "true",
    "slotSetting": false
  },
  {
    "name": "ENABLE_RATE_LIMIT",
    "value": "false",
    "slotSetting": false
  }
]
```

3. **「OK」** をクリック
4. **「保存」** をクリック

### ステップ4: アプリケーションを再起動

1. 上部メニューから **「再起動」** をクリック
2. 確認ダイアログで **「はい」** をクリック

### ステップ5: 動作確認

1. **「ログストリーム」** を開いて起動ログを確認
2. ブラウザで以下のURLにアクセス:
   - API Docs: `https://unitech-request-platform-backend.azurewebsites.net/docs`
3. フロントエンドからログインを試行

---

## ✅ 確認チェックリスト

設定後、以下を確認してください：

- [ ] すべての環境変数が正しく設定されている
- [ ] `SECRET_KEY` が設定されている
- [ ] MySQL接続情報（個別形式 or URL形式）が設定されている
- [ ] `BACKEND_CORS_ORIGINS` にフロントエンドURLが含まれている
- [ ] `WEBSITES_PORT` が `8000` に設定されている
- [ ] `WEBSITES_CONTAINER_START_TIME_LIMIT` が設定されている
- [ ] アプリケーションが再起動されている
- [ ] ログストリームでエラーが出ていない
- [ ] API Docs (`/docs`) にアクセスできる
- [ ] フロントエンドからログインできる

---

## 🔄 現在の設定との違い

### 現在設定されている環境変数（5個）
1. `BACKEND_CORS_ORIGINS`
2. `DATABASE_URL`
3. `SCM_DO_BUILD_DURING_DEPLOYMENT`
4. `SECRET_KEY`
5. `WEBSITES_PORT`

### 追加すべき主要な環境変数（必須）
1. `MYSQL_HOST`
2. `MYSQL_PORT`
3. `MYSQL_DATABASE`
4. `MYSQL_USER`
5. `MYSQL_PASSWORD`
6. `MYSQL_SSL_MODE`
7. `MYSQL_SSL_CA`
8. `WEBSITES_CONTAINER_START_TIME_LIMIT` ⭐ **重要！**
9. `ALGORITHM`
10. `ACCESS_TOKEN_EXPIRE_MINUTES`

### 追加すべき推奨環境変数
- 接続プール設定（`DB_POOL_*`）
- サーバー設定（`HOST`, `PORT`, `WORKERS`, `TIMEOUT`）
- アプリケーション設定（`APP_NAME`, `ENVIRONMENT`, `LOG_LEVEL`）

---

## 🐛 トラブルシューティング

### 問題: 環境変数を設定しても反映されない

**解決方法:**
1. 設定後に必ず **「保存」** をクリック
2. アプリケーションを **「再起動」**
3. 数分待ってから確認

### 問題: ログインできない

**確認項目:**
1. `SECRET_KEY` が設定されているか
2. `DATABASE_URL` が正しいか（または `MYSQL_*` 変数が設定されているか）
3. `BACKEND_CORS_ORIGINS` にフロントエンドURLが含まれているか
4. ログストリームでエラーを確認

### 問題: "MySQL server has gone away"

**解決方法:**
- 接続プール設定（`DB_POOL_*`）を追加

### 問題: アプリが起動タイムアウトする

**解決方法:**
- `WEBSITES_CONTAINER_START_TIME_LIMIT=600` を設定

---

## 📝 補足情報

### 環境変数の読み込み順序

1. **システム環境変数**（Azure App Service の環境変数）
2. **`.env` ファイル**（ローカル開発のみ）
3. **デフォルト値**（コード内）

Azure App Service では、`.env` ファイルは無視され、ポータルで設定した環境変数が使用されます。

### セキュリティのベストプラクティス

- ❌ **`SECRET_KEY` を GitHub にコミットしない**
- ✅ **本番環境では強力な `SECRET_KEY` を使用**
- ✅ **データベースパスワードは Azure Key Vault の使用を検討**
- ✅ **`DEBUG=false` に設定**

---

**作成日**: 2025年12月16日
**対象アプリ**: `unitech-request-platform-backend`

