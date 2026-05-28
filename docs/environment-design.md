# PBT Match — 開発/本番 環境設計（統合版）

> 作成日: 2026-05-28 / 体制: 3名の設計チーム（環境戦略&Supabase / CI・CD&デプロイ / シークレット&Observability&運用）が Context7＋Web で最新一次情報を調査し統合。
> 前提: モノレポ（pnpm + Turborepo）＝ `apps/mobile`(Expo/RN・iOS先行) ＋ `apps/web`(Next.js) ＋ `apps/admin`(Next.js/Refine) ＋ `packages/core,api,design-tokens`。バックエンド Supabase。個人〜小規模・コスト意識。**東京リージョン(ap-northeast-1)**。

---

## 0. 設計原則（結論サマリ）

1. **3環境を「別Supabaseプロジェクト」で土台化**：local（CLI/Docker）/ staging（専用）/ production（専用）。Supabase公式の推奨。
2. **Supabase Branching は PR preview の併用に限定**（常設stagingの代替にしない＝$10 compute creditがbranchに効かずコスト割高）。
3. **クライアントには anon key のみ**（`service_role`/`sb_secret_*`は絶対に出さない）。最後の砦は **RLS**。
4. **マイグレーションは Git＋CIが唯一の正**（ダッシュボード手動変更を“正”にしない＝環境ドリフト防止）。**RLSは宣言的diffで拾えないため手書きmigration**。
5. **CIは GitHub Actions + Turborepo `--affected` + Remote Cache**。Web/Admin=Vercel（PRプレビュー標準）、Mobile=EAS（channel中心・OTA活用）。
6. **少人数なので最初は最小**（Web/Admin自動デプロイ＋mobile手動EAS）。mobile完全自動化・Branchingは後回し。
7. **リージョンは作成時にTokyo固定**（後から変更不可）。

---

## 1. 環境マトリクス

| レイヤ | local | staging | production |
|---|---|---|---|
| **Git** | `feature/*` | PR（→Preview）/ 任意の `develop` | `main` |
| **web (Vercel)** | `vercel dev` / Development env | Preview Deployment（全PR or `develop`のCustom Env） | Production（`main`） |
| **admin (Vercel)** | 同上（別プロジェクト） | Preview | Production（`main`） |
| **mobile (EAS)** | dev client（`development` profile/channel） | `preview` profile/channel（Internal/TestFlight内部） | `production` profile/channel（TestFlight→ストア） |
| **Supabase** | `supabase start`（Docker） | staging プロジェクト | production プロジェクト |
| **データ** | seed（ダミー） | 匿名化/合成（本番コピー不可） | 実ユーザーデータ |

> preview（PRごとの使い捨て）は Supabase Branching を**必要なときだけ短命に**。stagingの置き換えではない。

---

## 2. Supabase 環境分離

### 方式比較（要点）
| | 別プロジェクト（土台） | Branching | 推奨 |
|---|---|---|---|
| 公式位置づけ | Managing Environmentsで**明示推奨** | PR/開発フローの補助 | 併用 |
| プラン/課金 | Freeでも作成可（Free=org内2プロジェクトまで・1週間無アクセスでpause）/ Pro $25/月/プロジェクト | **有料前提**・branchも従量（Micro≈$9.6/月常時）。**$10 compute creditはbranchに非充当** | prod/staging=別プロジェクト、preview=短命branch |
| コピー範囲 | 何もコピーされない（独立） | schema/migration/Edge Functions/config をコピー、**data-less** | — |

### 推奨構成（プラン）
- **production = Pro（$25/月）**：自動pause回避・日次バックアップ・本番運用。
- **staging = 当面Free可**（pause許容時。Freeはorg内2プロジェクトまで）。preview branch本格利用時にPro化検討。
- 両方とも作成時に **Region=Tokyo (ap-northeast-1)**。Edge Functionsもリージョン実行可。

### 接続先切替
- `packages/api` に **supabase client factory** を集約し、`apps/*` は env を渡すだけ。
- Expo：`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`（profile/channelで切替）。
- Next：`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Vercel env Production/Preview/Development）。
- `service_role` はサーバ/Edge Functionsのみ（`NEXT_PUBLIC_`を付けない）。

---

## 3. ローカル開発（Supabase CLI）

```bash
supabase init
supabase start         # Postgres/Auth/Storage/Realtime/Edge/Studio をDockerで起動
supabase link --project-ref <REF>          # 環境ごとにref切替
supabase functions serve                    # Edge Functions ローカル実行
supabase gen types typescript --local > packages/api/src/database.types.ts
```
- リポジトリ直下に `supabase/` を1つ置き全アプリ共有。
- メール確認はローカルではInbucket(54324)で捕捉。
- Google/Apple OAuthの redirect URL は**環境ごとに別**（ローカル/staging/prodで登録）。

---

## 4. マイグレーション運用

### 手法の使い分け（ハイブリッド推奨）
- **宣言的スキーマ** `supabase/schemas/*.sql`（テーブル/ビュー/関数）→ `supabase db diff -f <name>` で migration 生成。
- **versioned migration（手書き）**：**RLSポリシー（ALTER POLICY）・データ操作・ビューの security_invoker・カラム型変更**は diff が拾えないので手書き必須。
- down migration は破壊的になりがち → **ロールフォワード＋多段階デプロイ（expand→contract）**を基本。

### 安全な適用フロー
```
ローカル変更 → db diff / migration new → supabase db reset で検証 → PR
 → (必要なら preview branch で実環境確認)
 → develop マージ: CI が staging に supabase db push
 → QA合格 → main マージ: CI が production に db push（GitHub Environments で required reviewers 承認ゲート）
```
- **ローカルから直接 prod に push しない**（CIで適用）。`SUPABASE_ACCESS_TOKEN`等はGitHub Secrets（環境別）。
- **スキーマは新コードのデプロイ「前」に当てる**（後方互換／expand→contract）。
- seedは開発/テスト用ダミーのみ。**本番にseedを流さない**。

---

## 5. CI/CD ＆ デプロイ

### CI（GitHub Actions × Turborepo）
- `pnpm turbo run build test lint typecheck --affected` で**影響範囲のみ**実行。
- `actions/checkout` は `fetch-depth: 0`（`--affected`の差分比較に必要）。
- 2層キャッシュ：`setup-node` の `cache: pnpm` ＋ **Turborepo Remote Cache**（`TURBO_TOKEN`=Secret / `TURBO_TEAM`=Variable、Vercel Remote Cacheを無料利用可）。
- `turbo.json`：Nextの `outputs` から `!.next/cache/**` を除外、公開envを `env`/`globalEnv` に列挙（キャッシュ正確性）。

### Web/Admin（Vercel）
- 同一リポを**2プロジェクト**化（Root Directory=`apps/web` / `apps/admin`）。`turbo-ignore` で無関係PRのビルドをスキップ。
- **PRごとPreview Deploymentは標準機能で自動**。`main`=Production。
- env対応：Production→prod Supabase / Preview→staging Supabase / Development→local。固定stagingURLが要れば Vercel Custom Environment（`develop`割当）。

### Mobile（EAS）
- profile × channel を環境名で統一（development / preview / production）。
- **`runtimeVersion: { policy: "appVersion" }`** を基本。JS/アセットのみ→`eas update`（OTA）、**ネイティブ変更→必ず新ビルド＋提出**。
- `eas.json`（抜粋）：

```jsonc
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "channel": "development" },
    "preview":     { "distribution": "internal", "channel": "preview",
                     "env": { "EXPO_PUBLIC_ENV": "staging", "EXPO_PUBLIC_SUPABASE_URL": "https://<staging>.supabase.co" } },
    "production":  { "channel": "production", "autoIncrement": true,
                     "env": { "EXPO_PUBLIC_ENV": "production", "EXPO_PUBLIC_SUPABASE_URL": "https://<prod>.supabase.co" } }
  },
  "submit": { "production": { "ios": { "appleId": "...", "ascAppId": "...", "appleTeamId": "..." } } }
}
```
- CIからは `eas build/submit --non-interactive`（認証は `EXPO_TOKEN`、runnerはubuntuでOK）。
- EAS Workflows は将来の選択肢。当面は GitHub Actions + `eas` 直叩きで十分。

### リリースフロー
```
push/PR → CI(turbo --affected) → Vercel が web/admin の Preview 自動
       → （任意）eas build --profile preview / eas update --channel preview で実機確認
main マージ → Vercel が web/admin を Production / Supabase migration を prod 適用(承認ゲート)
           → eas build -p ios --profile production → eas submit（TestFlight→審査→公開）
           → 軽微修正は eas update --channel production（OTA）
```

---

## 6. シークレット管理（レイヤー別配置）

**大原則**：クライアント（ブラウザ/モバイルバイナリ/OTA）に渡る値は**すべて公開済みとみなす**。

| 値 | local `.env` | Vercel | EAS | GitHub Actions | Supabase | 公開可否 |
|---|---|---|---|---|---|---|
| `SUPABASE_URL` / `anon`(`sb_publishable_*`) | `NEXT_PUBLIC_*`/`EXPO_PUBLIC_*` | Prod/Preview/Dev | plain text | 不要 | — | **公開可（RLS前提）** |
| `service_role`(`sb_secret_*`) | `.env`(gitignore・管理タスクのみ) | サーバ用env(公開接頭辞**禁止**) | **置かない** | Secrets | Edge Functions secrets | **非公開** |
| Sentry DSN(client) | `*_PUBLIC_*` | plain text(環境別) | plain text | 不要 | — | 公開可 |
| `SENTRY_AUTH_TOKEN`(ソースマップ) | `.env.sentry-build-plugin`(gitignore) | Secrets | **sensitive**(secret不可・OTAで使うため) | Secrets | — | 非公開 |
| DB接続文字列/外部APIシークレット | `.env`(gitignore) | Secrets | 置かない | Secrets | Edge Functions secrets | 非公開 |

- `.env.example`（キーのみ）をコミットして構成共有。`.env*` は ignore。
- **Supabase新APIキー（2025/6〜 `sb_publishable_*`/`sb_secret_*`）**：secret keyがGitHub公開リポで検知されると自動失効。クライアント=publishable、サーバ=secret を厳守。
- EAS：旧 `eas secret` は **EAS Environment Variables**（plain/sensitive/secret）に置換。SDK55+は `eas update --environment` 必須。
- 一元管理ツール（Doppler等）は当面**過剰**。各プラットフォーム機能＋docsの台帳（上表）でSSOT。

---

## 7. Observability

| 種別 | ツール | 対象 | 備考 |
|---|---|---|---|
| エラー追跡 | **Sentry** | mobile(`@sentry/react-native`) / web・admin(`@sentry/nextjs`) / Edge(`@sentry/deno`) | **プロジェクトは3分割＋environmentタグ**で local/staging/prod 区別。ソースマップ：EAS Buildは自動、**OTAはCIで明示アップロード** |
| サーバ/DBログ | Supabase Logs | Postgres/Auth/Edge/API | 一次調査 |
| デプロイ/関数ログ | Vercel Logs | web/admin | |
| Webアナリティクス | Vercel Web Analytics | web/admin | |
| プロダクト分析 | **PostHog**（推奨）/ GA4 | mobile+web | リテンション/ファネル/フラグ |
| アラート | Sentry（本番エラースパイク）＋ Vercel/Supabase 使用量アラート | — | 最小はこの2系統 |

- コスト節約：Sentryは `tracesSampleRate`/Replayを絞り、**本番のみ送信**（local/stagingは低レート or 送らない）。

---

## 8. 本番リリース前 セキュリティチェックリスト

- [ ] **全テーブルRLS有効化**（SQL作成テーブルは手動ON）＋最小権限ポリシー
- [ ] **service_role/sb_secret_ 非露出**（クライアント/OTA/公開envに無いことをgrep確認）
- [ ] **Auth リダイレクトURL許可リスト**を本番ドメインに限定（ワイルドカード乱用しない）
- [ ] **CORS**：REST APIは許可Origin限定。**Edge Functionsは手動でCORS処理**
- [ ] **Edge Functions JWT検証**（`verify_jwt=true` 維持）
- [ ] **Storageバケットのポリシー**（publicバケット誤公開の点検）
- [ ] **SSL強制 / Network Restrictions / アカウントMFA / CAPTCHA(signup・signin・reset)**
- [ ] Authレート制限の調整
- [ ] （DB 4GB超なら）**PITR** 有効化を検討

---

## 9. バックアップ / 復旧

- **Pro=日次バックアップ（7日保持）** で開始。
- **PITR**（$100/月〜・Small compute以上必須、有効化すると日次は停止）はデータ重要度が上がってから。
- 保険として `supabase db dump` を **GitHub Actions cronで週次オフサイト保存**（ほぼ無料）。
- **リストア手順を文書化＋年1回リストア訓練**（復旧できないバックアップは無意味）。
- メンテモード：Next.jsは `MAINTENANCE_MODE` を middleware で503／Supabase側は書込みフラグ参照。

---

## 10. コスト概観（小規模・MAU数百〜数千、2026-05）

| サービス | 無料枠 | 小規模時の月額 | 跳ねやすい点 |
|---|---|---|---|
| Supabase | Free（pauseあり） | **$25（Pro）** | PITR($100〜)・compute・egress・DBサイズ |
| Vercel | Hobby無料 | **$0〜$20** | 帯域・ビルド分・Image Optimization・人数課金 |
| EAS | Free（ビルド本数制限） | **$0〜$19** | ビルド本数・同時数（OTA活用で削減） |
| Sentry | Developer無料(5,000err/月) | **$0〜$26** | エラー/トレース/Replay従量 |
| PostHog | 無料枠大きめ | **$0** | イベント/録画急増 |
| **合計（典型）** | — | **約 $25〜$90/月** | PITR・Sentry従量・Vercel帯域 |

---

## 11. 段階導入（少人数の現実解）

**Phase 1（最小）**
1. GitHub Actions CI 1本（`turbo --affected`＋pnpm/Remote Cache）
2. Vercel 2プロジェクト（web/admin、Root Directory、turbo-ignore）＝Previewは標準で自動
3. Supabase：prod(Pro)＋staging(Free)を作成、`supabase/`をGit化、`develop→staging`/`main→prod`のmigration CIレーン（prodは承認ゲート）
4. EASは手動（`eas.json`の3profile＋`runtimeVersion:appVersion`、`eas build/submit`）
5. `.env.example`＋シークレット台帳、Sentry 3プロジェクト＋本番アラート、本番前チェックリスト運用

**Phase 2以降**
- mobileの完全自動化（タグ→ビルド→自動Submit、OTA自動配信＋手動承認）
- Supabase Branching（PR分離DB）、Vercel固定stagingURL、E2E(Maestro/Playwright)のCI組込み、PITR、週次dumpオフサイト保存

---

## 12. 主要な落とし穴（再掲）
- 宣言的diffはRLS/データ操作/ビュー設定を拾わない → RLSは手書きmigration。
- staging に本番スキーマ済みプロジェクトを流用するとCLIが壊す → stagingは新規作成。
- Branchingは$10 creditが効かず常設staging代替は割高 → previewは短命。
- `--affected`は`fetch-depth`不足で全ビルド化／`turbo.json`のenv未列挙でキャッシュ事故。
- OTAはネイティブ変更を配れない（runtimeVersionが守る）。
- EASの`secret`はOTAで取得不可 → `SENTRY_AUTH_TOKEN`等は`sensitive`。
- Edge FunctionsのCORSは手動。Region作成時Tokyo固定。service_role非露出。

---

## 13. 主要参考URL（抜粋・2026-05取得）
- Supabase: Managing Environments / Branching(+2.0) / Manage Branching usage / Declarative schemas / Regions / Going into prod / Backups / PITR usage / API keys / Functions(secrets,auth,cors) / Pricing
- Turborepo: CI with GitHub Actions / `--affected` / Remote Cache｜Vercel: Monorepos(Turborepo) / Env across environments / Custom environments / Environments / Pricing / Web Analytics pricing
- Expo: EAS Update deployment / Runtime versions / Building on CI / eas-cli env / EAS Workflows｜Sentry: Expo guide / Next.js manual setup / sourcemaps / Pricing｜PostHog

> 各チームの詳細レポート（コマンド例・設定例・全出典URL）はセッション記録に保持。個別領域の深掘り可。
