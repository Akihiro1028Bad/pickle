# PBT Match — ローカル開発環境（Docker＋HTTPS＋独自ドメイン）設計

> 作成日: 2026-05-28 / 体制: 3名の設計チーム（コンテナ構成 / リバースプロキシ・HTTPS・ドメイン / Next.js×HTTPS・Supabase統合）が Context7＋Web で最新一次情報を調査し統合。
> 目的: ローカルでも `web`(Next.js) と `admin`(Next.js) を **Docker で起動**し、**HTTPS＋自分で決めた独自ドメイン**でアクセス（本番に構成を寄せる）。Supabase はローカル（Supabase CLI）。開発機 = macOS(Apple Silicon)。

---

## 0. 推奨スタック（結論）

| レイヤ | 採用 | 理由 |
|---|---|---|
| リバースプロキシ | **Caddy** | 自動HTTPS・WebSocket透過がゼロ設定。少数サービスの構成では最もシンプル（将来サービス増・本番もTraefik寄せなら Traefik も可） |
| ローカルTLS | **mkcert**（ワイルドカード `*.pbt.test`） | OS/ブラウザの信頼ストアに入り**証明書警告ゼロ**。プロキシを乗り換えても証明書資産を再利用可 |
| ドメイン解決 | **dnsmasq**（`*.test → 127.0.0.1`） | サブドメイン追加のたびの `/etc/hosts` 編集が不要（簡易版は hosts でも可） |
| TLD | **`.test`**（`.local` は不可） | `.test` は RFC予約で本番と衝突せず。**`.local` は macOS の mDNS と衝突する罠**。`.localhost` は Safari 非対応 |
| コンテナ | **web/admin を `next dev`（Webpack）＋ Compose Watch** | コンテナ内HMRを安定させる。Turbopackはコンテナ内ファイル監視の未解決バグあり |
| Supabase | **CLIスタックをそのまま使い、同一ネットワークに相乗り** | CLIのmigration/seed/Studio体験を維持。アプリは `kong:8000` で内部接続 |

ドメイン例：`https://app.pbt.test` / `https://admin.pbt.test` / `https://api.pbt.test`（Supabase）/ `https://studio.pbt.test`。
**ドメインは `.env` の `LOCAL_DOMAIN` 1行で総入れ替え可能**にする。

> ⚠️ ご指定の `pbt.local` の「`.local`」は macOS の Bonjour(mDNS) と衝突して名前解決が不安定になるため、**`.test`（例 `pbt.test`）を推奨**します。

---

## 1. 全体構成図

```
[ブラウザ] ──https/wss──▶ [Caddy（mkcert証明書でTLS終端）]
                              ├─ app.pbt.test   → web:3000   (内部はhttp/ws)
                              ├─ admin.pbt.test → admin:3000
                              ├─ api.pbt.test   → kong:8000  (Supabase API。Realtime wsも透過)
                              └─ studio.pbt.test→ studio:3000 (任意)

[Supabase CLI スタック]  kong(54321) / db(54322) / studio(54323) / inbucket(54324:メール)
[自前Composeのアプリ]    web / admin（Supabaseのdockerネットワークに external 参加）
```

**最重要の考え方＝接続URLは2系統**：
| 誰が見るか | Supateの参照先 | 理由 |
|---|---|---|
| ブラウザ（`NEXT_PUBLIC_SUPABASE_URL`） | `https://api.pbt.test` | Cookie secure・OAuthリダイレクト・wss を本番同様に |
| Next.jsサーバ（コンテナ内・SSR/Server Actions） | `http://kong:8000`（同一ネットワークのサービス名） | コンテナ内から独自ドメインは引けない＋TLS終端を経由しないので証明書問題も回避 |
| モバイル実機 | `https://api.pbt.test`（要DNS解決）or 開発機のLAN IP | `.test`を実機が引けない場合はLAN IP＋証明書SAN |

→ `NEXT_PUBLIC_*`（ブラウザ用）と `SUPABASE_INTERNAL_URL`（サーバ用）を分けるのが核。

---

## 2. ドメイン＆HTTPS（macOS セットアップ）

```bash
# 1) ツール導入
brew install mkcert nss dnsmasq      # nss は Firefox 利用時
mkcert -install                       # ローカルCAをOS信頼ストアへ（全ブラウザが信頼）

# 2) ワイルドカード証明書（*.pbt.test を1枚でカバー）
mkdir -p ./infra/certs
mkcert -cert-file ./infra/certs/pbt.test.pem \
       -key-file  ./infra/certs/pbt.test-key.pem \
       "pbt.test" "*.pbt.test" localhost 127.0.0.1 ::1

# 3) dnsmasq で *.test を 127.0.0.1 へ
echo 'address=/.test/127.0.0.1' >> "$(brew --prefix)/etc/dnsmasq.conf"
sudo mkdir -p /etc/resolver
echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/test
sudo brew services start dnsmasq
# 確認: dscacheutil -q host -a name app.pbt.test → 127.0.0.1
```
- 簡易版（dnsmasq入れない）：`/etc/hosts` に `127.0.0.1 app.pbt.test admin.pbt.test api.pbt.test studio.pbt.test`。
- チーム共有：各自 `mkcert -install` を実行（CAは各マシンローカル）。CA(`mkcert -CAROOT` の `rootCA.pem`)を配布して各自インストールでもOK。

---

## 3. リバースプロキシ（Caddy）

`infra/Caddyfile`（`LOCAL_DOMAIN` で可変化）：
```caddyfile
app.{$LOCAL_DOMAIN} {
  tls /certs/pbt.test.pem /certs/pbt.test-key.pem
  reverse_proxy web:3000          # HMR(WebSocket)は自動透過
}
admin.{$LOCAL_DOMAIN} {
  tls /certs/pbt.test.pem /certs/pbt.test-key.pem
  reverse_proxy admin:3000
}
api.{$LOCAL_DOMAIN} {
  tls /certs/pbt.test.pem /certs/pbt.test-key.pem
  reverse_proxy kong:8000         # Supabase API。Realtime(wss)も透過
}
studio.{$LOCAL_DOMAIN} {
  tls /certs/pbt.test.pem /certs/pbt.test-key.pem
  reverse_proxy studio:3000
}
```
- Caddyの `reverse_proxy` は `Upgrade/Connection` を自動処理 → HMR・Realtimeの wss が無設定で通る。
- Traefikを使う場合は static で entrypoint、file provider で mkcert 証明書（`tls.certificates`）、各サービスに `traefik.http.routers.*.rule=Host(...)` ラベル。

---

## 4. コンテナ構成（web / admin）

### dev用 Dockerfile（`infra/docker/Dockerfile.dev`、単一ステージ）
```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dev
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1 \
    WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true   # macOSのファイル監視対策
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/ packages/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
EXPOSE 3000
```
> 本番用は別途マルチステージ（`turbo prune --docker` → install → build → `output:"standalone"`、非rootユーザ）。

### `infra/docker-compose.dev.yml`（抜粋・コメント付き）
```yaml
name: pbt-match-app
services:
  caddy:
    image: caddy:2-alpine
    ports: ["443:443", "80:80"]
    environment: { LOCAL_DOMAIN: "${LOCAL_DOMAIN:-pbt.test}" }
    volumes:
      - ./infra/Caddyfile:/etc/caddy/Caddyfile:ro
      - ./infra/certs:/certs:ro
    networks: [default, supabase]

  web:
    build: { context: ., dockerfile: infra/docker/Dockerfile.dev }
    command: pnpm --filter web exec next dev -p 3000 -H 0.0.0.0   # Turbopackは付けない
    environment:
      NODE_ENV: development
      WATCHPACK_POLLING: "true"
      NEXT_PUBLIC_SUPABASE_URL: "https://api.${LOCAL_DOMAIN:-pbt.test}"  # ブラウザ用
      SUPABASE_INTERNAL_URL: "http://kong:8000"                          # サーバ用
      SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
    volumes:                                # node_modules/.next はコンテナ内に閉じる
      - /repo/node_modules
      - /repo/apps/web/node_modules
      - /repo/apps/web/.next
    develop:
      watch:
        - { action: sync, path: ./apps/web, target: /repo/apps/web, ignore: [node_modules/, .next/] }
        - { action: sync, path: ./packages, target: /repo/packages, ignore: [node_modules/, dist/] }
        - { action: rebuild, path: pnpm-lock.yaml }
    networks: [default, supabase]

  admin:
    build: { context: ., dockerfile: infra/docker/Dockerfile.dev }
    command: pnpm --filter admin exec next dev -p 3000 -H 0.0.0.0
    environment:
      NEXT_PUBLIC_SUPABASE_URL: "https://api.${LOCAL_DOMAIN:-pbt.test}"
      SUPABASE_INTERNAL_URL: "http://kong:8000"
      SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
      WATCHPACK_POLLING: "true"
    volumes: [ /repo/node_modules, /repo/apps/admin/node_modules, /repo/apps/admin/.next ]
    develop:
      watch:
        - { action: sync, path: ./apps/admin, target: /repo/apps/admin, ignore: [node_modules/, .next/] }
        - { action: sync, path: ./packages, target: /repo/packages, ignore: [node_modules/, dist/] }
        - { action: rebuild, path: pnpm-lock.yaml }
    networks: [default, supabase]

networks:
  default:
  supabase:
    external: true
    name: ${SUPABASE_NETWORK:-supabase_network_pbt-match}   # docker network ls で実名確認
```
起動：`supabase start` → `docker compose -f infra/docker-compose.dev.yml up --watch --build`

### コンテナHMRの肝
- macOSはVM越しで inotify が届かないため **ポーリング必須**（`WATCHPACK_POLLING=true`）。
- **Turbopackはコンテナ内でファイル変更を検知しない既知バグ**（next.js#68255 / docker compose#12827, 2025）→ dev は `--turbopack` を付けず **Webpack** で動かす。速度が欲しい時はホストで `pnpm dev` 直叩き。
- `node_modules` は匿名volumeで分離（pnpmのsymlink地獄＋I/O激重を回避）。`-H 0.0.0.0` 必須。

---

## 5. Next.js 側の設定

```ts
// next.config.ts（web/admin 共通方針）
const nextConfig = {
  allowedDevOrigins: ["app.pbt.test", "admin.pbt.test", "api.pbt.test"], // 独自ドメイン経由の403/HMR切断対策
  experimental: { serverActions: { allowedOrigins: ["app.pbt.test", "admin.pbt.test", "*.pbt.test"] } },
};
export default nextConfig;
```
- **TLSはプロキシで終端。Next の `--experimental-https` は使わない**（二重TLS・HMR回帰の温床）。
- プロキシは `X-Forwarded-Proto: https` / `X-Forwarded-Host` を転送（OAuthコールバック・絶対URL生成のため）。
- HTTPS＋独自ドメインなので **Cookie `secure` が効く**＝本番に近い（localhost直叩きより良い）。
- もしHMRが繋がらない場合の最終手段：プロキシで `/_next/webpack-hmr` の `Origin` を空に（Next 15.2.2+ の回帰回避）。Caddyなら基本不要。

---

## 6. Supabase ローカルを独自ドメイン/HTTPS化

`supabase/config.toml`（抜粋）：
```toml
[api]
port = 54321

[auth]
site_url = "https://app.pbt.test"
additional_redirect_urls = [
  "https://app.pbt.test", "https://app.pbt.test/auth/callback",
  "https://admin.pbt.test", "https://admin.pbt.test/auth/callback",
  "pbtmatch://auth/callback"        # モバイル ディープリンク
]

[auth.email]
enable_confirmations = true          # 確認メールは Inbucket(localhost:54324) で受信

[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"

[inbucket]
port = 54324
```
- 変更後は **`supabase stop && supabase start` で再起動**が必要。
- ブラウザが `https://api.pbt.test` を見る場合：Realtimeは `wss://api.pbt.test/realtime/v1/websocket` を通る（プロキシでWS透過）。Studio→各サービスはコンテナ内通信なので影響なし。
- Google/Apple のリダイレクトURIに `https://api.pbt.test/auth/v1/callback` を登録（Googleは `localhost`/正規ドメイン要求＝独自ドメインが有利。Appleは公開到達性を要する場面があり純ローカルは制約あり→必要時はトンネル）。
- `54321` 直叩きとの違い：直叩きは Cookie secure が効かず ws/http で**本番と乖離**。独自ドメイン+HTTPS化で SameSite/secure/wss を本番同等に検証できる。

---

## 7. 本番との整合（差分は env だけ）

```bash
# .env.local（ローカル）
LOCAL_DOMAIN=pbt.test
NEXT_PUBLIC_SUPABASE_URL=https://api.pbt.test     # ブラウザ
SUPABASE_INTERNAL_URL=http://kong:8000            # サーバ（コンテナ内）
NODE_EXTRA_CA_CERTS=/certs/rootCA.pem             # NodeにmkcertのCAを信頼させる
```
```bash
# 本番（Vercel env）
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_INTERNAL_URL=https://<ref>.supabase.co
# NODE_EXTRA_CA_CERTS は不要（公的CA）
```
コードは `SUPABASE_INTERNAL_URL ?? NEXT_PUBLIC_SUPABASE_URL`（サーバ）/ `NEXT_PUBLIC_SUPABASE_URL`（ブラウザ）で分岐。**コードは変えず env だけで local↔prod 切替**。

---

## 8. 落とし穴チェックリスト
- [ ] **`.local` を使わない**（mDNS衝突）→ `.test`。Safariは `*.localhost` 非対応。
- [ ] **Turbopackはコンテナ内HMR不可** → dev は Webpack（`--turbopack`なし）。
- [ ] **接続URLの2系統**（ブラウザ=https独自ドメイン / サーバ=`kong:8000`）を取り違えない。
- [ ] **node_modules はホスト共有しない**（匿名volume）。`next dev -H 0.0.0.0`。
- [ ] **mkcert CA をコンテナ/Nodeにも信頼させる**（`NODE_EXTRA_CA_CERTS`、証明書SANに全サブドメイン）。
- [ ] **HMR 403 → まず `allowedDevOrigins`**、次に proxy の `Origin ""`。`X-Forwarded-*` 転送。
- [ ] **Supabaseネットワーク名はproject依存** → `docker network ls` で確認し `SUPABASE_NETWORK` 変数化。`supabase start` を先に。
- [ ] **config.toml変更後は supabase 再起動**。`additional_redirect_urls` は完全一致（末尾スラッシュ/localhost vs 127.0.0.1差に注意）。
- [ ] **`--experimental-https` 不使用**（TLSはプロキシ一箇所）。443ポート競合確認（`sudo lsof -i :443`）。
- [ ] **モバイル実機は `.test` を引けないことが多い** → LAN IP＋SAN or 専用DNS。

---

## 9. セットアップ最短手順
1. `brew install mkcert nss dnsmasq` → `mkcert -install`
2. `mkcert ... "pbt.test" "*.pbt.test"` でワイルドカード証明書
3. dnsmasq `address=/.test/127.0.0.1` ＋ `/etc/resolver/test` → `sudo brew services start dnsmasq`
4. `.env` に `LOCAL_DOMAIN=pbt.test`、証明書を `infra/certs/`
5. `supabase start`（CLIスタック）→ `docker network ls` でネットワーク名確認し `SUPABASE_NETWORK` に設定
6. `docker compose -f infra/docker-compose.dev.yml up --watch --build`
7. `supabase/config.toml` の `site_url`/`additional_redirect_urls` を `https://app.pbt.test` 等に → `supabase stop && supabase start`
8. ブラウザで `https://app.pbt.test` / `https://admin.pbt.test`（警告なしHTTPS）

> ドメイン変更時：`.env` の `LOCAL_DOMAIN` を変更 → 新ドメインで `mkcert` 再発行 → `docker compose up -d`。`.test` 内の変更ならDNSはそのまま。

---

## 10. 主要参考URL（2026-05取得・抜粋）
- Docker: Compose file-watch / develop reference / Next.js develop guide
- Next.js: 16 Blog / allowedDevOrigins / data-security(serverActions allowedOrigins) / upgrading(v12 WS) / issues #68255・#77073・#77253
- Supabase: Local Development(CLI getting started) / CLI config(config.toml) / CLI v2 Config as Code / Redirect URLs / Login with Google・Apple / discussion #36296・#35616
- Caddy: reverse_proxy / tls directives｜Traefik: HTTPS TLS｜mkcert(GitHub) / wildcard手順
- dnsmasq wildcard on macOS(Simon Willison TIL) / localias(TLD・HSTS注意) / pnpm Docker / turbo prune

> 各チームの詳細レポート（全コマンド例・nginx版設定・出典URL）はセッション記録に保持。
