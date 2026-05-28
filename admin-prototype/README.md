# PBT Match — Admin Prototype（運営管理画面モック）

PBT Match 運営バックオフィスの**フロント・プロトタイプ**。
Next.js (App Router) + TypeScript + Tailwind CSS v4。データはダミー（バックエンドなし・メモリ保持）。

## 起動
```bash
cd pickle/admin-prototype
npm install        # 初回のみ
PORT=3220 npm run dev
# → http://localhost:3220
```
※ アプリ本体のプロトタイプ（`pickle/prototype/`）はポート 3210。別ポートで同時起動可。

## 画面（左サイドバー）
| ルート | 画面 | 主な内容 |
|---|---|---|
| `/` | ダッシュボード | KPIカード（DAU/新規/投稿/通報）＋7日推移＋最近の通報 |
| `/members` `/members/[id]` | 会員管理 | 一覧・検索・フィルタ／詳細（ステータス変更・メモ・投稿一覧） |
| `/posts` | 投稿管理 | 一覧＋非表示/締切/ピン留め |
| `/reports` `/reports/[id]` | 通報 / T&S | 通報キュー（SLA表示）／詳細（通報DM限定閲覧・対応アクション） |
| `/announcements` | お知らせ | 一覧＋新規作成 |
| `/inquiries` | 問い合わせ | 一覧＋ステータス更新 |
| `/settings` | 設定 / フラグ | メンテモード・機能ON/OFF・LaBOLA予約URL |
| `/audit` | 監査ログ | 管理操作の記録 |

## 動くこと（セッション内・保存なし）
- 投稿の非表示/締切/ピン留め、会員ステータス変更、通報の対応、問い合わせ状態更新、お知らせ作成、フラグ切替
- **各操作は自動的に「監査ログ」へ追記**される（リロードで初期データに戻る）

## スコープ外
施設・コートの管理（場所はフリーテキスト、空き状況はLaBOLA埋め込みのみ）。
認証・Supabase・実データ・権限制御の実装は本モックでは省略。

## 対応する要件
`../docs/admin-spec.md` のMVP項目を画面化。デザインは `../docs/design-direction.md` のPBT配色を流用。
