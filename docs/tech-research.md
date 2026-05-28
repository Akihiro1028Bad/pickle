# PBT Match — アプリ化 技術選定レポート（統合版）

> 調査日: 2026-05-28 / 調査体制: 3名の専門チーム（モバイルFW / バックエンド・認証・リアルタイム / アーキテクチャ・コード共有）が最新一次情報を並行調査し、本書に統合。
> 前提: **iOS先行のネイティブアプリ**、**個人〜小規模・TS/React中心**、重視軸＝**スピード / 低コスト / ネイティブ級品質 / 既存Web資産の再利用**。

---

## 0. 結論（エグゼクティブサマリ）

**推奨スタック：**

| 層 | 採用 |
|---|---|
| モバイル | **Expo (React Native)** ※New Architecture前提（SDK 54+） |
| バックエンド | **Supabase**（Auth + Postgres + Realtime + Storage + Edge Functions） |
| 認証 | **Googleログイン ＋ Sign in with Apple（iOSは必須）＋ メール** |
| リアルタイムDM | **Supabase Realtime（Broadcast from Database）** + Presence |
| プッシュ通知 | **Expo Push**（裏でAPNs/FCM）← Supabase DB Webhook → Edge Function |
| コード共有 | **モノレポ（pnpm + Turborepo）**。ロジック/型/API/トークンは共有、**UIは各最適化** |

**3チームの一致点**：4つの優先軸（速度・コスト・品質・再利用）を**同時に最も満たすのは Expo + Supabase**。Flutterは品質は高いがReact資産を全捨てするため本件では非推奨。Capacitor/PWAは最速だがネイティブ品質と審査(4.2)で不利。

---

## 1. モバイルフレームワーク比較

◎優れる ○良い △課題 ✕不向き

| 軸 | Expo(RN) | 素のRN | Flutter | Capacitor+Web | PWA | ネイティブ(Swift) |
|---|---|---|---|---|---|---|
| 学習/移行コスト | ◎ | ○ | △(Dart) | ◎ | ◎ | ✕ |
| React資産の再利用 | ○(ロジック流用/UI作直) | ○ | ✕ | ◎ | ◎ | ✕ |
| 開発速度(iOS先行) | ◎ | △ | ○ | ◎ | ◎ | △ |
| ネイティブ品質/性能 | ◎ | ◎ | ◎ | △ | △ | ◎ |
| ビルド/配信 | ◎(EAS) | △ | ○ | ○ | ✕(ストア不可) | △ |
| OTA更新 | ◎(EAS Update) | △ | ✕ | ○ | ◎ | ✕ |
| プッシュ通知 | ◎ | ○ | ○ | ○ | △(iOS制限) | ◎ |
| 少人数適性 | ◎ | △ | ○ | ◎ | ◎ | ✕ |

### 推奨 = Expo (React Native)
1. **React/TSがそのまま活きる** — ロジック・型・Supabaseクライアント・状態管理は移植可。作り直すのはUIのみ。
2. **品質が“実質ネイティブ並み”に到達** — New Architecture（Fabric/TurboModules）が標準化。SDK 53で既定化、SDK 55(2026/2, RN 0.83)で旧アーキ完全削除、SDK54の約83%が新アーキ採用。
3. **リリースが速い** — EAS Build（Mac不要のクラウドビルド）でTestFlight提出まで一気通貫。SDK 54+はiOSプリコンパイルでビルド高速化。
4. **OTA(EAS Update)標準** — JS/アセット修正は審査なしで即配信。
5. **Supabase公式統合あり**（Expoクイックスタート / Push公式パターン）。

**次点：Capacitor + 既存Web**（最速・移行コスト最小だが、WebView品質と審査リスク）。「数週間で検証MVPだけ」なら一時的に有効、ロジックをTSで共通化しておけば後でExpoへ移行可。

**Expo採用時の注意**：Node 20+必須 / EASはfrozen lockfile既定 / 新アーキ未対応の古いライブラリは不可 / RN 0.81.0は提出不可バグ→0.81.1+ / iOSプッシュにApple Developer(年99 USD)とAPNsキー。

---

## 2. バックエンド：Supabase vs Firebase

| 観点 | Supabase | Firebase | 本件評価 |
|---|---|---|---|
| データモデル | PostgreSQL(リレーショナル)+RLS | Firestore(ドキュメント) | マッチング/DMはリレーショナルが自然 → **Supabase** |
| Auth | Google/Apple/メール全対応, SQLポリシー | 全対応 | 互角 |
| Realtime(DM) | Postgres Changes/Broadcast/Presence | Firestore低遅延同期/オフライン成熟 | DMはSupabaseで十分実用 |
| プッシュ通知 | **非搭載**(Edge Fn経由) | FCM無料標準 | Firebase有利 → **Expo Pushで補完** |
| 料金/無料枠 | Free$0→Pro$25**固定** | 従量(Firestore読取課金) | 予測可能な **Supabase有利** |
| RN/Expo相性 | supabase-jsがExpo Goでほぼ動作 | RN Firebaseはdev build必須 | **Supabase有利** |
| ロックイン | OSS/標準Postgres/移行容易 | Google独自/移行困難 | **Supabase有利** |

→ **Supabase + Expo Push** が最適。プッシュという唯一の弱点はExpo Push（無料・APNs/FCM抽象化）で解決でき、Firebaseを丸ごと採る理由にならない。
（参考コスト：5万MAU規模でSupabase 月$100-200 / Firebase $400-800 という比較報告あり）

---

## 3. iOS必須要件チェックリスト（重要）

- [ ] **Sign in with Apple は必須**（App Store ガイドライン4.8）。Googleログインを出す時点で発火。メール登録のみなら不要だが、本件はGoogle採用のため**必須**。
  - iOSは `expo-apple-authentication`（ネイティブ）→ `supabase.auth.signInWithIdToken({provider:'apple'})`。**ネイティブ方式なら6ヶ月ごとのクライアントシークレット更新が不要**。
  - AppleのIDトークンは**氏名を含まない**→初回サインイン時にクライアントが受け取る氏名を自前でDB保存（初回しか取れない）。
- [ ] **審査用テストアカウント**を提出（ログイン必須アプリは必須）。
- [ ] **通報・ブロック・規約同意・モデレーション**（UGC＝掲示板/DMありのためGuideline 1.2でほぼ必須。MVPでも入れる）。
- [ ] **Privacy Manifest（PrivacyInfo.xcprivacy）** と **Privacy Nutrition Label**（収集データ申告）。
- [ ] **Purpose Strings**（通知/写真/位置を使うなら用途文字列）。
- [ ] **最小機能性(4.2)** を満たす（ネイティブナビ/プッシュ/ハプティクス等）。
- [ ] **ATT** は広告/トラッキングSDKを入れる場合のみ（入れないなら不要）。
- [ ] Apple Developer Program **年99 USD**、Xcode 16/iOS18 SDK（EASがクラウドで充足）。

---

## 4. リアルタイムDM / 通知アーキテクチャ

### DM（推奨：Broadcast from Database）
```
[送信RN] --INSERT messages--> [Postgres]
                                 | トリガ realtime.broadcast_changes()
                                 v
                        [Realtime: thread:{id} チャネル]  (RLS/Realtime Authorizationで参加者限定)
                                 v
[受信RN/Web] <-- broadcast -- 即時反映
- 既読: messages.read_at 更新→broadcastで相手UI反映
- 入力中: ephemeral Broadcast（DB不要） / オンライン: Presence
```
- **Postgres Changesは購読者ごとに認可走査が走りスケールに難** → 公式推奨の **Broadcast from Database**（2025/4導入, 数万接続）を主軸に。
- **RN留意**：`AppState`監視でバックグラウンド時はチャネルunsubscribe、復帰で再subscribe。**バックグラウンド着信はWSでなくプッシュで補完**。
- 大規模グループ/強い配信保証が将来コア化したらDM層のみ Stream/Ably 併用を再検討（現状の1対1・個人規模では不要）。

### プッシュ（DM着信）
```
messages へ INSERT → Supabase DB Webhook → Edge Function(Deno/TS)
  → 受信者の push_tokens 取得 → (オンライン/同スレッド閲覧中は抑制) → Expo Push API → APNs/FCM → 端末
```
- 端末起動/権限付与時に Expo Push Token を取得し `push_tokens` に保存（SecureStore併用）。

### 認証のRN統合の勘所
- Google=`@react-native-google-signin`、Apple=`expo-apple-authentication` → 取得IDトークンを `signInWithIdToken`。
- セッション永続化は **`expo-secure-store`** を Supabaseクライアントの storage に注入。`autoRefreshToken`+`AppState`。
- 全テーブルRLS。`auth.uid()` 基準。DMは「参加者のみ」を `thread_participants` の存在チェックで表現。Realtimeも Realtime Authorization で購読者限定。

---

## 5. データモデル（叩き台）

```sql
profiles(id PK=auth.users.id, display_name, handle, avatar_url, skill_level, dupr, home_facility, bio, created_at)
posts(id PK, author_id FK->profiles, body text, status, created_at)
threads(id PK, created_at)
thread_participants(thread_id FK, user_id FK->profiles, last_read_at, PK(thread_id,user_id))
messages(id PK, thread_id FK, sender_id FK->profiles, body text, read_at, created_at)
push_tokens(id PK, user_id FK->profiles, expo_token, platform, updated_at, UNIQUE(user_id, expo_token))
```
RLS方針：profiles=本人のみ更新/閲覧は認証者、posts=閲覧認証者・編集は著者、threads/messages=参加者のみ、push_tokens=本人のみ。未読は `thread_participants.last_read_at` で算出。

---

## 6. コード共有・モノレポ構成

**方針：ロジック・型・データ層・デザイントークンは共有、UIはプラットフォーム別に最適化。**（Solito/Tamaguiでの“UI完全共有”は iOS先行・小規模には**過剰投資**＝採用しない）

```
pbt-match/
├─ apps/
│  ├─ web/                # 既存Next.js（当面はLP/プレビュー/規約に縮小）
│  └─ mobile/             # Expo（本番主戦場・iOS先行）
├─ packages/
│  ├─ core/               # ★型・Zodスキーマ・ドメインロジック・定数（UI非依存・完全共有）
│  ├─ api/                # Supabaseアクセス層（storageアダプタは注入で分岐）
│  ├─ design-tokens/      # 色/間隔/タイポ（ダーク+ネオン）の単一真実源(中立TS)
│  ├─ ui-web/             # Web専用UI（Tailwind v4）
│  └─ ui-native/          # iOS専用UI（RN純正 + NativeWind/StyleSheet）
└─ turbo.json / pnpm-workspace.yaml
```

| 共有できる | 作り直す |
|---|---|
| 型 / Zod / ドメインロジック / 定数 | 画面UI（掲示板/コート/DM/プロフィール/ログイン） |
| Supabaseクエリ（client初期化のstorage層のみ分岐） | ナビゲーション（Next App Router ↔ Expo Router） |
| デザイントークン（Tailwind v4 `@theme` ↔ RN） | アニメーション/ハプティクス/プッシュ |

**注意**：**NativeWind v5 はプレリリースのため本番非推奨**。当面はトークンを中立TSで持ち、RN側は v4 / StyleSheet で実装。

---

## 7. MVPロードマップ（1人実働の目安：合計 約25〜45人日）

| フェーズ | 内容 | 目安 |
|---|---|---|
| 0. モノレポ化 | pnpm+Turborepo骨組み、既存Nextを `apps/web` へ移設、共有tsconfig | 2〜4日 |
| 1. 共有抽出 | `core`(型/Zod/ロジック)→`api`(Supabase)→`design-tokens` の順で抽出（**最優先**） | 3〜5日 |
| 2. Expo立上げ | SDK54+(新アーキ)、Expo Router、認証、SecureStoreセッション | 4〜7日 |
| 3. 画面実装 | プロフィール→掲示板→コート→DM→ログイン（依存の浅い順、UIはiOS最適化） | 10〜20日 |
| 4. 配信準備 | Apple Developer登録、EAS Build/Submit、TestFlight、審査メタデータ、通報/ブロック | 3〜5日 |

CI/CD：GitHub Actions + EAS（PRでlint/typecheck、mainで build→submit）。`EXPO_PUBLIC_*` で公開値、**service_role keyはクライアントに絶対入れない**。OTAは `runtimeVersion` 管理が肝（ネイティブ変更時は必ず上げる）。

---

## 8. 主要リスク

| リスク | 対策 |
|---|---|
| App Store 4.2(最小機能)/1.2(UGC) リジェクト | ネイティブ体験＋通報/ブロック/規約をMVPから |
| Sign in with Apple 未対応 | iOSはネイティブApple認証を必須実装（鍵ローテ回避） |
| NativeWind v5 未成熟 | トークンは中立TS、当面v4/StyleSheet |
| 新アーキ未対応ライブラリ | 導入前に対応確認、必要ならSDK選定で調整 |
| 過度なコード共有(UIまで共有) | ロジック層に共有を限定、UIは作り直し |
| Realtimeスケール(Postgres Changes) | Broadcast from Database を主軸に |

---

## 9. 主要参考URL（抜粋・日付付き）
- Expo SDK 55 Changelog（2026-02, RN0.83・旧アーキ削除） / Expo New Architecture Guide（2026-01時点83%）
- React Native 0.82（2025-10 旧アーキ無効化削除）/ 0.81（2025-08 iOSプリコンパイル）
- Supabase × Expo クイックスタート / Sending Push Notifications / Realtime: Broadcast from Database（2025-04）
- Supabase Login with Apple / Auth with React Native / Realtime Authorization
- Apple App Review Guidelines（4.8/4.2/1.2）/ App Privacy Details / Apple Developer Program(年99USD)
- Expo: Work with monorepos / EAS Update runtime-versions / Privacy manifests
- NativeWind v5（プレリリース・本番非推奨）
- 比較記事: Supabase vs Firebase for RN 2026（applighter / bytebase）

> 各チームの詳細レポート（出典URL網羅）はセッション記録に保持。必要なら個別トピックを深掘りできます。
