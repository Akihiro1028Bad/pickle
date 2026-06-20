# Pickle [仮] — 実装ロードマップ（プロトタイプ → 本番アプリ）

> 作成日: 2026-05-29
> 前提スタック（`tech-research.md` で確定）: **Expo (React Native) + Supabase + pnpm/Turborepo モノレポ**、iOS先行。
> 目的: 現在のWebプロトタイプ（モックデータ）を、App Store配信可能な本番アプリに育てるための**実行可能なタスク計画**。
> 全体目安: **1人実働で約25〜45人日**（フェーズ0〜4）。

---

## 0. ゴールと現在地

| | 現在（プロトタイプ） | ゴール（本番） |
|---|---|---|
| フロント | Next.js Web（`prototype/`） | Expo iOSアプリ（+ Web は LP/規約用に縮小） |
| 管理画面 | Next.js Web（`admin-prototype/`） | そのままWeb管理画面として本番化 |
| データ | モックデータ + localStorage | Supabase（Postgres + RLS） |
| 認証 | 擬似ログイン（デモユーザー自動） | Google / Apple / メール（Supabase Auth） |
| DM | モックスレッド | Supabase Realtime（Broadcast） |
| 通知 | なし | Expo Push（APNs） |
| 配信 | Vercel プレビュー | TestFlight → App Store |

**設計の核（tech-research.md より）**: ロジック・型・データ層・デザイントークンは**共有**、UIはプラットフォーム別に**作り直す**。UIまでの完全共有（Solito/Tamagui）は小規模には過剰投資なので採らない。

---

## 前提・事前準備（フェーズ0開始前）

- [ ] **Apple Developer Program 登録**（年99 USD）※審査・TestFlightに必須、申請に数日かかるので最初に着手
- [ ] **Supabase アカウント作成**（無料枠開始 → 本番はPro $25/月）
- [ ] **Node 20+ / pnpm / EAS CLI** をローカル準備（`npm i -g eas-cli pnpm`）
- [ ] **Expo アカウント**作成（EAS Build 用）
- [ ] GitHub リポジトリ（既存 `Akihiro1028Bad/pickle` を継続利用）

---

## フェーズ0：モノレポ化（目安 2〜4日）

**目的**: 共有コードを置ける器を作り、既存Nextを移設する。

### タスク
- [ ] ルートに pnpm workspace を導入（`pnpm-workspace.yaml`）
- [ ] Turborepo 導入（`turbo.json`）
- [ ] 既存 `prototype/` → `apps/web/` に移設
- [ ] 既存 `admin-prototype/` → `apps/admin/` に移設
- [ ] 空パッケージの骨組み作成：`packages/core` `packages/api` `packages/design-tokens`
- [ ] 共有 `tsconfig.base.json` を作り各アプリ/パッケージから継承
- [ ] ルート `package.json` に scripts（`turbo run build/lint/typecheck`）

### 目標ディレクトリ構成
```
pickle/
├─ apps/
│  ├─ web/        # 既存Next.js（当面はLP/プレビュー/規約）
│  ├─ admin/      # 管理画面（本番化）
│  └─ mobile/     # ★フェーズ2で追加（Expo）
├─ packages/
│  ├─ core/          # 型・Zodスキーマ・ドメインロジック・定数（UI非依存）
│  ├─ api/           # Supabaseアクセス層（storageアダプタは注入で分岐）
│  ├─ design-tokens/ # 色/間隔/タイポ（単一真実源・中立TS）
│  ├─ ui-web/        # Web専用UI（任意）
│  └─ ui-native/     # iOS専用UI（フェーズ3）
├─ turbo.json
└─ pnpm-workspace.yaml
```

### 完了条件 (DoD)
- `pnpm install` が通り、`apps/web` と `apps/admin` が従来どおりローカル起動・ビルドできる
- Vercel の2プロジェクトの Root Directory を新パス（`apps/web` / `apps/admin`）に更新し、デプロイが緑

---

## フェーズ1：共有部分の抽出（目安 3〜5日）★最重要

**目的**: Web/モバイルで使い回す「頭脳」をUIから切り離す。ここが後続の速度を決める。

### タスク（順序が大事：core → api → tokens）
- [ ] `packages/core`：
  - [ ] ドメイン型（`Post` `Thread` `Message` `Profile` `Announcement` など）を集約
  - [ ] **Zodスキーマ**で入力バリデーションを定義（型は `z.infer` で導出）
  - [ ] 純粋ロジック（未読数算出、ソート、公式投稿の並び順 等）を関数化
  - [ ] 定数（公式/提携バッジ種別、地域、レベル、募集人数、投稿ステータスのラベル/トーン）
- [ ] `packages/api`：
  - [ ] Supabaseクライアント初期化（**storageアダプタは注入**：Web=localStorage / Native=SecureStore）
  - [ ] リポジトリ関数（`posts.list()` `messages.send()` `profiles.update()` …）
  - [ ] API応答は共通エンベロープ（success/data/error）に統一
- [ ] `packages/design-tokens`：
  - [ ] 既存の色（ダーク＋ネオン: accent `#f6ff54` 等）・間隔・タイポを**中立TS**で定義
  - [ ] Web側は Tailwind v4 `@theme` へ、Native側は後で参照
- [ ] 既存 `apps/web` を、抽出した `core`/`api` を使う形にリファクタ（モック→共有ロジック経由）

### 完了条件 (DoD)
- `apps/web` がモックデータではなく `packages/core` の型・ロジックを通して動く
- `packages/api` 経由でSupabaseの読み書きができる（まずは posts/profiles で疎通）

---

## フェーズ1.5：Supabase バックエンド構築（フェーズ1と並行可）

**目的**: データの置き場とアクセス制御を作る。

### タスク
- [ ] Supabase プロジェクト作成（リージョンは東京 `ap-northeast-1`）
- [ ] テーブル作成（`tech-research.md` §5 のスキーマ）：
  ```sql
  profiles(id PK=auth.users.id, display_name, handle, avatar_url, skill_level, dupr, home_area, home_facility, bio, created_at)
  facility_links(id PK, name, prefecture, city, booking_url, partner bool, active bool, sort_order int, created_at)
  posts(id PK, author_id FK->profiles, prefecture, area_text, place_name, starts_at, ends_at, headcount, level_hint, price_note, body, display_until, status, official bool, pinned bool, created_at)
  threads(id PK, created_at)
  thread_participants(thread_id FK, user_id FK, last_read_at, PK(thread_id,user_id))
  messages(id PK, thread_id FK, sender_id FK, body, read_at, created_at)
  push_tokens(id PK, user_id FK, expo_token, platform, updated_at, UNIQUE(user_id, expo_token))
  announcements(id PK, title, body, status, published_at)
  -- 管理者: admin_users(user_id, role, status) ※RBACは admin-spec.md 準拠
  ```
- [ ] **RLS（行レベルセキュリティ）を全テーブル有効化**：
  - profiles=本人のみ更新・閲覧は認証者
  - posts=閲覧はゲスト可または認証者可（公開方針で決定）・編集は著者（公式投稿は運営ロールのみ作成）
  - facility_links=公開中のみ閲覧可・編集は管理者のみ
  - threads/messages=参加者のみ（`thread_participants` 存在チェック）
  - push_tokens=本人のみ
- [ ] マイグレーションをコード管理（`supabase/migrations/`、Supabase CLI）
- [ ] seed スクリプトでテストデータ投入
- [ ] **service_role キーは絶対にクライアントへ入れない**（Edge Function内のみ）

### 完了条件 (DoD)
- ローカル/本番Supabaseでテーブル＋RLSが適用され、`packages/api` から認可付きで読み書きできる

---

## フェーズ2：Expoアプリ立ち上げ（目安 4〜7日）

**目的**: iOSアプリの土台＋ログイン＋セッション保持。

### タスク
- [ ] `apps/mobile` を Expo SDK 54+（**New Architecture前提**）で作成
- [ ] **Expo Router** 導入（タブ：募集/コート/メッセージ/プロフィール）
- [ ] Supabaseクライアントを `expo-secure-store` をstorageに注入して初期化（`autoRefreshToken` + `AppState`）
- [ ] 認証実装：
  - [ ] Google = `@react-native-google-signin` → `signInWithIdToken`
  - [ ] **Apple = `expo-apple-authentication`（iOS必須）** → `signInWithIdToken`（ネイティブ方式で鍵ローテ回避）
  - [ ] メール（任意）
  - [ ] **Appleは初回しか氏名を返さない**→初回サインイン時にDB保存
- [ ] モノレポでExpoを動かす設定（`metro.config.js` の workspace 対応）

### 完了条件 (DoD)
- 実機/シミュレータでアプリ起動 → Google/Appleでログイン → セッションが再起動後も保持される

---

## フェーズ3：画面実装（目安 10〜20日）

**目的**: プロトタイプの各画面を、共有ロジックの上にネイティブUIで作り直す。

**実装順（依存の浅い順）**: プロフィール → 募集 → コート → DM → ログイン仕上げ → お知らせ/オンボーディング

### タスク
- [ ] `packages/ui-native`：基本コンポーネント（Card/Badge/Avatar/Button、トークン参照）
  - [ ] ※ **NativeWind v5 は本番非推奨**。当面 RN StyleSheet（または NativeWind v4）で実装
- [ ] プロフィール（閲覧/編集、レベル・DUPR・よく行く地域）
- [ ] 募集（地域/場所/日時/表示時間つき投稿一覧、公式投稿の強調、おすすめ、投稿作成）
- [ ] コート/施設リンク（予約在庫は持たず外部予約URLへ誘導）
- [ ] **DM（Realtime）**：
  - [ ] Broadcast from Database で即時反映（`thread:{id}` チャネル、Realtime Authorizationで参加者限定）
  - [ ] 既読（`read_at`）・入力中（ephemeral Broadcast）・オンライン（Presence）
  - [ ] `AppState` でバックグラウンド時 unsubscribe、復帰で再subscribe
  - [ ] 運営サポート窓口（公式アカウント）スレッドを固定表示
- [ ] お知らせ（運営公開分の表示）、オンボーディング
- [ ] ナビゲーション/アニメーション/ハプティクスのネイティブ最適化

### 完了条件 (DoD)
- 全主要画面が実データ（Supabase）で動作、DMが2端末間で即時同期する

---

## フェーズ3.5：プッシュ通知

### タスク
- [ ] 端末起動/権限付与時に Expo Push Token を取得 → `push_tokens` に保存（SecureStore併用）
- [ ] `messages` INSERT → **Supabase DB Webhook → Edge Function(Deno/TS)** → 受信者トークン取得 → Expo Push API
- [ ] オンライン/同スレッド閲覧中は通知抑制
- [ ] iOS: APNsキー設定（Apple Developer）

### 完了条件 (DoD)
- バックグラウンドのDM着信でプッシュが届く

---

## フェーズ4：配信準備・審査（目安 3〜5日）

### タスク
- [ ] **EAS Build**（クラウドビルド、Mac不要）でiOSビルド作成
- [ ] **EAS Submit** で TestFlight へ提出 → 内部テスト
- [ ] **App Store 審査対策**（`tech-research.md` §3 必須リスト）：
  - [ ] Sign in with Apple 実装済み（Googleを出すなら必須）
  - [ ] **通報・ブロック・規約同意・モデレーション**（UGCのためGuideline 1.2）※管理画面側は着手済み、アプリ側に通報UIを実装
  - [ ] 審査用テストアカウント提出
  - [ ] Privacy Manifest（`PrivacyInfo.xcprivacy`）＋ Privacy Nutrition Label
  - [ ] Purpose Strings（通知/写真/位置を使う場合）
  - [ ] 最小機能性(4.2)を満たすネイティブ体験
- [ ] App Store メタデータ（説明・スクショ・年齢区分）

### 完了条件 (DoD)
- TestFlightで配布でき、審査提出の必須項目が揃う

---

## 横断トピック

### CI/CD
- GitHub Actions + EAS
- PR：`turbo run lint typecheck`（Web/管理は従来どおりVercelプレビュー）
- main：mobileは EAS Build → Submit
- **OTA更新（EAS Update）**：JS/アセット修正は審査なしで即配信。ネイティブ変更時は `runtimeVersion` を必ず上げる

### シークレット管理
- 公開可：`EXPO_PUBLIC_*`（Supabase URL / anon key）
- **service_role key はクライアントに絶対入れない**（Edge Function専用）
- `.env` はコミットしない（`.gitignore` 済み）

### 主要リスクと対策（再掲）
| リスク | 対策 |
|---|---|
| App Store 4.2/1.2 リジェクト | ネイティブ体験＋通報/ブロック/規約をMVPから |
| Sign in with Apple 未対応 | iOSネイティブApple認証を必須実装（鍵ローテ回避） |
| NativeWind v5 未成熟 | トークンは中立TS、当面v4/StyleSheet |
| 新アーキ未対応ライブラリ | 導入前に対応確認、SDK選定で調整 |
| 過度なコード共有（UIまで） | 共有はロジック層に限定、UIは作り直し |
| Realtimeスケール | Broadcast from Database を主軸に |

---

## プロトタイプ → 本番 対応表

| 共有できる（移植） | 作り直す（ネイティブ） |
|---|---|
| 型 / Zod / ドメインロジック / 定数 | 各画面UI（掲示板/コート/DM/プロフィール/ログイン） |
| Supabaseクエリ（storage層のみ分岐） | ナビゲーション（Next App Router ↔ Expo Router） |
| デザイントークン（Tailwind `@theme` ↔ RN） | アニメーション/ハプティクス/プッシュ |

---

## 次の一手（推奨）
1. **Apple Developer 登録**と**Supabaseプロジェクト作成**を先に走らせる（待ち時間があるため）
2. **フェーズ0（モノレポ化）** に着手 — これは私が実行可能
3. 並行して **フェーズ1.5（Supabaseスキーマ＋RLS）** の雛形を用意

> 詳細な技術選定の根拠は `docs/tech-research.md`、機能仕様は `docs/spec.md`、管理画面仕様は `docs/admin-spec.md` を参照。
