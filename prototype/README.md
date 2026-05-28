# THE PICKLE BANG THEORY — Match · Prototype

PBT 公式マッチングサービスの**フロント・プロトタイプ**。
Next.js (App Router) + TypeScript + Tailwind CSS v4。データはモック（バックエンド・認証なし）。

## 起動

```bash
cd pickle/prototype
npm install        # 初回のみ
PORT=3210 npm run dev
# → http://localhost:3210
```

`npm run build` で本番ビルド、`npm start` で本番起動も可能。

## 画面（7）と動線

| ルート | 画面 |
|---|---|
| `/` | 掲示板（投稿一覧） |
| `/posts/[id]` | 投稿詳細 → 「投稿者にDMを送る」 |
| `/compose` | 投稿作成（自由記述） |
| `/court` | PBTコート空き状況（表示のみ・reserva.beへリンク） |
| `/messages` | DM一覧 |
| `/messages/[id]` | DM 1対1 |
| `/profile` | プロフィール |

下部4タブ（掲示板 / コート / メッセージ / プロフィール）で切替。

### 動くこと（セッション内のみ・保存なし）
- 掲示板 → 投稿タップ → 詳細 → DM送る → チャット
- FAB「投稿する」→ 作成 → **一覧の先頭に即反映**（メモリ保持）
- チャットでメッセージ送信 → **ローカル state に追加**
- コート「この時間で投稿を作る」→ 投稿作成へ

### スコープ外
認証 / Supabase / 実データ保存 / 通知 / コート予約の実処理。
※リロードすると初期モックデータに戻ります。

## デザイン
`../docs/design-direction.md` のPBT世界観トークンを Tailwind `@theme` 化（`src/app/globals.css`）。
ロゴは `public/logos/yoko-neon.png`。

## 構成
```
src/
  app/            # ルート（App Router）
  components/     # BottomNav 等
  lib/            # types / mockData / store(Context)
```
状態は `src/lib/store.tsx` の React Context（投稿・DMスレッドのメモリ管理）。
