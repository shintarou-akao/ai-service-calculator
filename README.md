# What is AI Service Calculator?

AI Service Calculator は、様々な AI サービスの料金プランや API の利用料金のざっくりとした見積もりを行うことができる Web アプリケーションです。

## 主な機能

- 複数の AI サービスの料金プランを比較
- API モデルの入出力トークン数に基づいた料金計算
- 月額・年額プランの選択と数量指定
- 総額の自動計算と内訳の表示
- 選択した内容の共有機能

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase

## 開発環境のセットアップ

1. リポジトリをクローンします：

```bash
git clone git@github.com:shintarou-akao/ai-service-calculator.git
cd ai-service-calculator
```

2. 依存関係をインストールします：

```bash
npm install
```

3. Docker を起動します。

4. ローカルの Supabase を起動します。

```bash
supabase start
```

5. `.env.local` ファイルを作成し、環境変数の値を設定します：

```bash
cp .env.example .env.local
```

6. 開発サーバーを起動します：

```bash
npm run dev
```

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
