# 『夏影山荘』ChatGPT確認ガイド

## 主要ファイル

- `docs/README_CODEX.md`：実装仕様・物語上の正
- `docs/ASSET_MANIFEST.md`：画像素材仕様
- `lib/game/scenes.ts`：全scene、会話、選択肢、END分岐
- `lib/game/state.ts`：進行状況、保存、解放条件
- `lib/game/answers.ts`：INVESTIGATIONと最終捜査の正答判定
- `lib/game/evidence.ts`：ARCHIVE資料
- `lib/game/assets.ts`：asset slotと画像ファイルの対応
- `app/page.tsx`：画面表示、メニュー、調査、COMPARE
- `app/globals.css` / `app/scene-overrides.css`：UIとレスポンシブ表示
- `tests/game-rules.test.ts`：END15、TRUE ROUTE、情報開示条件のテスト
- `render.yaml`：Render無料Web Service設定

## 画像

- `public/assets/reference/`：提供された参照ボード4枚
- `public/assets/generated/`：各場面用に生成して接続した画像

## 確認時の重要事項

- 前作『404号室には誰もいない』とは別作品です。
- 七人目調査以前に「相沢直樹」という完全名を表示しません。
- TRUE ROUTE以前に「再現システム」という語を表示しません。
- 通常ENDはEND01〜END15、TRUE ENDはEND16『七人目の夏』です。
- セーブデータはブラウザの `localStorage` に保存されます。

## 公開URL

https://natsukage-sanso.onrender.com/
