# PBT Match — モバイルアプリ プロトタイプ（Expo / React Native）

Webプロトタイプ（`../prototype`）を Expo (React Native) に移植したiOS向けプロトタイプです。
モックデータで動作し、常時ログイン済み（デモユーザー）でフル機能を確認できます。

## 技術
- Expo SDK 56 / React Native 0.85 / expo-router（ファイルベースルーティング）
- 状態管理: React Context（`src/lib/store.tsx`・インメモリ／モック）
- スタイル: React Native StyleSheet（デザイントークンは `src/lib/theme.ts`）

## 画面構成
- タブ: 掲示板 / コート / メッセージ / プロフィール（`src/app/(tabs)/`）
- 投稿詳細 `posts/[id]` / トーク `thread/[id]` / 募集作成 `compose`（モーダル）
- お知らせ `news` / PBTについて `about`

## 動かし方

### 1. 依存インストール（初回のみ）
```bash
cd mobile
npm install
```

### 2. 開発サーバー起動
```bash
npx expo start
```
ターミナルにQRコードと `exp://...` のURLが表示されます。

### 3. 実機（Expo Go）で見る
1. iPhone に App Store から **Expo Go** をインストール
2. **Macと同じWi-Fi**にiPhoneを接続
3. iPhoneの**カメラ or Expo Go アプリ**で、ターミナルのQRコードを読み取る
4. アプリが起動します（保存すると即リロード＝ホットリロード）

> うまく繋がらない場合は `npx expo start --tunnel`（同一Wi-Fi不要・やや遅い）を使用。

### 4. iOSシミュレータで見る（Mac・Xcode必要）
```bash
npx expo start
# 起動後、ターミナルで「i」キー → iOSシミュレータが立ち上がる
```

## ビルド検証（コンパイル確認）
```bash
npx tsc --noEmit                 # 型チェック
npx expo export --platform ios   # iOSバンドルの生成（エラー検出）
```

## メモ
- 認証・データ保存（Supabase等）は未接続のプロトタイプ段階です。
  本番化の計画は `../docs/implementation-roadmap.md` を参照。
- 配信用ビルド（TestFlight）は EAS（クラウド）で別途行います（Mac必須ではない）。
