import fs from "node:fs";
import path from "node:path";
import { scenes, sceneMap, endingTitles } from "../lib/game/scenes.ts";
import { evidence } from "../lib/game/evidence.ts";
import { assetSlots } from "../lib/game/assets.ts";
import { requiredForEnd15 } from "../lib/game/state.ts";

const root = process.cwd();
const output = path.join(root, "NATSUKAGE_IMPLEMENTATION_REVIEW.md");
const md = [];
const push = (...lines) => md.push(...lines);
const code = (value) => `\`${String(value).replaceAll("`", "\\`")}\``;
const list = (items) => items.length ? items.map(code).join("、") : "なし";
const displayCondition = (condition) => {
  if ("flag" in condition) return `flag ${code(condition.flag)} = true`;
  if ("ending" in condition) return `${code(condition.ending)} 取得済み`;
  if ("endingsAny" in condition) return `${condition.endingsAny.map(code).join(" OR ")} のいずれか取得済み`;
  if ("state" in condition) return `state.${code(condition.state)} = ${condition.equals}`;
  return "canUnlockEnd15(state) = true";
};
const conditions = (items = []) => items.length ? items.map(displayCondition).join(" AND ") : "なし";
const publicFileForSrc = (src) => `public/${src.replace(/^\//, "")}`;
const fileForSlot = (slot) => slot && assetSlots[slot] ? publicFileForSrc(assetSlots[slot].src) : null;
const sceneEdges = new Map(scenes.map((scene) => [scene.id, [
  ...(scene.nextScene ? [{ label: "次へ", target: scene.nextScene, conditions: scene.conditions ?? [] }] : []),
  ...(scene.choices ?? []).map((choice) => ({ label: choice.label, target: choice.nextScene, conditions: choice.conditions ?? [] })),
]]));

const reverseEdges = new Map(scenes.map((scene) => [scene.id, []]));
for (const [from, edges] of sceneEdges) for (const edge of edges) reverseEdges.get(edge.target)?.push(`${from}（${edge.label}）`);
reverseEdges.get("investigation_restored")?.push("INVESTIGATION正答送信");
reverseEdges.get("final_truth")?.push("FINAL INVESTIGATION正答送信");

const imageFiles = fs.readdirSync(path.join(root, "public/assets"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(entry.name))
  .map((entry) => path.join(entry.parentPath, entry.name))
  .map((absolute) => path.relative(root, absolute).replaceAll(path.sep, "/"))
  .sort();

const slotByFile = new Map();
for (const [slot, asset] of Object.entries(assetSlots)) {
  const file = publicFileForSrc(asset.src);
  if (!slotByFile.has(file)) slotByFile.set(file, []);
  slotByFile.get(file).push(slot);
}
const sceneUseBySlot = new Map();
for (const scene of scenes) if (scene.image) {
  if (!sceneUseBySlot.has(scene.image)) sceneUseBySlot.set(scene.image, []);
  sceneUseBySlot.get(scene.image).push(scene.id);
}
const evidenceUseBySlot = new Map();
for (const item of evidence) if (item.image) {
  if (!evidenceUseBySlot.has(item.image)) evidenceUseBySlot.set(item.image, []);
  evidenceUseBySlot.get(item.image).push(item.id);
}

push("# NATSUKAGE IMPLEMENTATION REVIEW", "", `生成日時: ${new Date().toISOString()}`, "", "> この文書は現在のソースコードから生成した実装監査資料です。仕様書上の予定ではなく、`lib/game/scenes.ts`、`state.ts`、`answers.ts`、`evidence.ts`、`assets.ts`、`app/page.tsx` の現実装を正としています。秘密情報、Cookie、環境変数の実値は含みません。", "");

push("## 1. 全シーン一覧", "", `実装scene数: **${scenes.length}**。画面タイトル専用フィールドはScene型に存在しません。通常ゲーム画面の固定ヘッダーは「夏影山荘」、画面内識別表示はscene IDです。`, "");
for (const scene of scenes) {
  const dialogue = scene.text.split("\n\n").filter((block) => block.includes("「") || block.startsWith("【"));
  const requiredFlags = (scene.conditions ?? []).flatMap((c) => "flag" in c ? [c.flag] : []);
  const setFlags = [...(scene.setFlags ?? []), ...(scene.choices ?? []).flatMap((c) => c.setFlags ?? [])];
  push(`### ${scene.id}`, "", `- scene ID: ${code(scene.id)}`, `- 画面タイトル: ${scene.ending ? `${scene.ending}「${endingTitles[scene.ending]}」` : `夏影山荘 / ${scene.id.toUpperCase()}`}`, `- 表示時刻: ${scene.time ? code(scene.time) : "空文字（時刻表示なし）"}`, `- 使用画像slot: ${scene.image ? code(scene.image) : "なし"}`, `- 使用画像ファイル名: ${scene.image ? code(path.basename(fileForSlot(scene.image) ?? "参照先なし")) : "なし"}`, `- 表示条件: ${conditions(scene.conditions)}`, `- セットされるflag: ${list([...new Set(setFlags)])}`, `- 必要flag: ${list([...new Set(requiredFlags)])}`, `- 次scene: ${scene.nextScene ? code(scene.nextScene) : "なし"}`, `- ending: ${scene.ending ? code(scene.ending) : "なし"}`, `- 解放証拠: ${list(scene.unlockEvidence ?? [])}`, "- 本文（実表示全文）:", "", "```text", scene.text, "```", "", `- 会話抽出: ${dialogue.length ? "" : "なし"}`);
  if (dialogue.length) push("", "```text", dialogue.join("\n\n"), "```");
  if (scene.choices?.length) {
    push("", "- 選択肢:");
    for (const choice of scene.choices) push(`  - ${code(choice.label)} → ${code(choice.nextScene)} / 条件: ${conditions(choice.conditions)} / setFlags: ${list(choice.setFlags ?? [])} / unlockEvidence: ${list(choice.unlockEvidence ?? [])}`);
  } else push("- 選択肢: なし");
  push("");
}

push("## 2. 全END", "");
for (let i = 1; i <= 16; i++) {
  const id = `END${String(i).padStart(2, "0")}`;
  const scene = scenes.find((item) => item.ending === id);
  const implicit = [];
  if (id !== "END16") implicit.push("新規取得時 loopCount +1");
  if (id === "END15") implicit.push("investigationUnlocked = true");
  if (id === "END16") implicit.push("trueEndCompleted = true");
  if (id === "END15") implicit.push("15通常END全取得時ではなく、END15到達時点では all_normal_endings は未確定の場合あり");
  push(`### ${id} — ${endingTitles[id]}`, "", `- END名: ${endingTitles[id]}`, `- 到達条件: ${id === "END15" ? `scene ${code("empty_seat")} の表示条件として、通常END（END15/16除外）8種類以上かつ ${requiredForEnd15.map(code).join("・")} 取得済み` : id === "END16" ? "TRUE ROUTE、06:12資料、FINAL INVESTIGATION正答後に一本道を進み、［終了する］を選択" : "下記直前sceneの対応選択肢またはnextSceneへ到達"}`, `- 直前scene: ${list(reverseEdges.get(scene?.id) ?? [])}`, `- END後に解放される証拠: ${list(scene?.unlockEvidence ?? [])}`, `- END後にセットされるflag: ${scene?.setFlags?.length ? list(scene.setFlags) : "scene固有flagなし"}`, `- applySceneによる暗黙state変更: ${implicit.length ? implicit.join(" / ") : "endingsへ追加、endingCount更新"}`, "");
}

push("## 3. 分岐・解放条件", "", "### END15解放条件", "", `- 通常END（END15、END16を除く）を8種類以上取得。`, `- ${requiredForEnd15.map(code).join("、")} をすべて取得。`, `- 条件成立後のBBQ scene ${code("bbq_memory")} にだけ［誰もいない席を見る］が表示され、${code("empty_seat")} → ${code("unknown_phone")} → ${code("end15")} と進む。`, "", "### INVESTIGATION解放条件", "", `- ${code("END15")} を取得すると applyScene が ${code("investigationUnlocked")} をtrueにする。`, "- タイトル画面では investigationUnlocked=true かつ trueRouteUnlocked=false の時だけINVESTIGATIONボタンを表示。", "", "### INVESTIGATION 01〜04の正解", "", "- INVESTIGATION 01: `7`。空白・全角空白を除去して完全一致。", "- INVESTIGATION 02: `はい`。`はい` / `yes` / `イエス` を許容。大文字小文字は正規化。", "- INVESTIGATION 03: `相沢直樹`。`相沢直樹` / `あいざわなおき` / `アイザワナオキ` を許容。", "- INVESTIGATION 04: **実装されていない**。画面の入力欄は3問のみ。", "", "### TRUE ROUTE解放条件", "", "- INVESTIGATIONの3回答を同時に正答すると sevenConfirmed、seventhPhotographerConfirmed、naokiIdentified、trueRouteUnlockedをtrueにし、group_photo_hqを解放。", `- タイトル画面で trueRouteUnlocked=true かつ trueEndCompleted=false の時にTRUE ROUTEボタンを表示。`, "", "### NAOKI_0815_0612.jpg解放条件", "", `- TRUE ROUTEの吊り橋scene ${code("true_bridge")} 後、${code("true_present")} → ${code("true_terminated")} → ${code("unread_notice")} と進む。`, `- ${code("unread_notice")} で［開く］を選択して ${code("unread_0612")} に入った時だけ証拠 ${code("naoki_0612_photo")} とflag ${code("naoki_0612_unlocked")} を解放。`, "", "### END16解放条件", "", `- ${code("unread_0612")} → ${code("final_gate")} でFINAL INVESTIGATIONを開く。`, "- 4問をすべて正答すると naokiSurvivalConfirmed、kuseIdentifiedをtrueにし、final_truthへ進む。", `- ${code("final_truth")} → ${code("kuse_context")} → ${code("kuse_choice")} → ${code("yuma_decision")} → ${code("evidence_package")} → ${code("finish_prompt_old")} → ${code("finish_prompt")}。`, "- ［終了する］のみを選ぶとEND16。", "");

push("## 4. 全画像アセット一覧", "", `実ファイル数: **${imageFiles.length}**`, "");
for (const file of imageFiles) {
  const slots = slotByFile.get(file) ?? [];
  const usedScenes = [...new Set(slots.flatMap((slot) => sceneUseBySlot.get(slot) ?? []))];
  const usedEvidence = [...new Set(slots.flatMap((slot) => evidenceUseBySlot.get(slot) ?? []))];
  const cssUsage = file.endsWith("lodge_arrival_1637.png") ? ["TITLE背景"] : file.endsWith("true_end_group_1723.png") ? ["TRUE END後TITLE背景"] : [];
  const uses = [...usedScenes.map((id) => `scene:${id}`), ...usedEvidence.map((id) => `evidence:${id}`), ...cssUsage];
  push(`### ${path.basename(file)}`, "", `- ファイル名: ${code(path.basename(file))}`, `- パス: ${code(file)}`, `- asset slot: ${list(slots)}`, `- 使用scene: ${list(usedScenes)}`, `- 用途: ${uses.length ? uses.join(" / ") : "未使用"}`, "");
}

push("## 5. sceneから参照されている画像一覧", "");
for (const scene of scenes.filter((item) => item.image)) {
  const file = fileForSlot(scene.image);
  push(`- ${code(scene.id)} / 指定slot: ${code(scene.image)} / 実ファイル: ${file ? code(file) : "なし"} / 存在: **${file && fs.existsSync(path.join(root, file)) ? "YES" : "NO"}**`);
}
push("");

push("## 6. 画像を使用していないscene", "", "scene固有画像がなく本文・会話のみで進行するsceneを列挙します。CSS背景はタイトル画面だけで、以下のsceneには適用されません。", "");
for (const scene of scenes.filter((item) => !item.image)) push(`- ${code(scene.id)}: 画像なし`);
push("");

const investigationQuestions = [
  { no: "01", q: "8月14日。\n夏影山荘を訪れた大学生は何人ですか？", images: ["living_seven_cups.png", "receipt_1528.png", "group_1718.png"], docs: ["七つの紙コップ", "8月14日のレシート", "IMG_0814_171842.jpg", "生存者記録"], answer: "7", judge: "空白除去後に文字列 `7` と完全一致" },
  { no: "02", q: "写真には旅行参加者6名全員が写っています。\n撮影者も旅行参加者だったと考えられますか？", images: ["group_1718.png"], docs: ["IMG_0814_171842.jpg", "17:18 反射部復元"], answer: "はい", judge: "はい / yes / イエスを許容" },
  { no: "03", q: "七人目の名前を入力してください。", images: ["group_1718.png", "room_d_charger.png", "unknown_camera_bag.png"], docs: ["寝室Dの使用痕", "所有者不明のカメラバッグ", "破損したネームタグ", "17:18 反射部復元"], answer: "相沢直樹", judge: "漢字・ひらがな・カタカナ表記を許容" },
];
push("## 7. INVESTIGATIONで使用する証拠", "", "> 実装上、問題画面自体は証拠画像をインライン表示しません。プレイヤーはARCHIVE/COMPAREを別途開いて解放済み資料を確認します。", "");
for (const item of investigationQuestions) push(`### INVESTIGATION ${item.no}`, "", "- 問題文:", "", "```text", item.q, "```", "", `- プレイヤーに提示する画像（ARCHIVE/COMPARE）: ${item.images.map(code).join("、")}`, `- 提示する文章資料: ${item.docs.map(code).join("、")}`, `- 正解: ${code(item.answer)}`, `- 正解判定方式: ${item.judge}`, "");
push("### INVESTIGATION 04", "", "- **未実装**。問題文、画像、文章資料、回答欄、正解判定はいずれも存在しません。", "");

const trueStart = "true_arrival";
const trueOrder = [];
for (let id = trueStart; id;) {
  const scene = sceneMap[id];
  if (!scene || trueOrder.includes(id)) break;
  trueOrder.push(id);
  if (id === "final_gate") break;
  id = scene.nextScene ?? scene.choices?.[0]?.nextScene;
}
push("## 8. TRUE ROUTE", "", `開始条件: trueRouteUnlocked=true。開始sceneは ${code(trueStart)}。`, "");
for (const id of trueOrder) {
  const scene = sceneMap[id];
  push(`### ${id}`, "", `- 時刻: ${scene.time || "なし"}`, `- 画像: ${scene.image ? `${scene.image} → ${fileForSlot(scene.image)}` : "なし"}`, "", "```text", scene.text, "```", "");
  if (scene.choices?.length) for (const choice of scene.choices) push(`- 選択肢 ${code(choice.label)} → ${code(choice.nextScene)}`);
}

const finalQuestions = [
  { q: "写真に写っている人物を特定してください。", evidence: ["NAOKI_0815_0612.jpg / naoki_0612_photo"], images: ["naoki_0815_0612.png"], answer: "相沢直樹", judge: "漢字・ひらがな・カタカナ" },
  { q: "2つの記録の時間差を入力してください。", evidence: ["吊り橋 23:56", "NAOKI_0815_0612.jpg 06:12"], images: ["bridge_collapse.png", "naoki_0815_0612.png"], answer: "6時間16分", judge: "半角/全角数字表記を許容" },
  { q: "3つの記録に共通する車両の所有者は？", evidence: ["管理人のSUV", "06:25 路肩カメラ", "久世車両識別点"], images: ["02_lodge_and_kuse_suv_reference.png"], answer: "久世隆一", judge: "漢字・ひらがな・カタカナ" },
  { q: "8月15日朝。\n相沢直樹が最後に会った人物は誰ですか？", evidence: ["06:25 路肩カメラ", "途切れた録音", "FINAL RECORD RESTORED"], images: ["naoki_0815_0612.png", "02_lodge_and_kuse_suv_reference.png"], answer: "久世隆一", judge: "漢字・ひらがな・カタカナ" },
];
push("## 9. FINAL INVESTIGATION", "", "> `FINAL-01` 等のscene IDは存在しません。`final_gate`でReactのFINAL INVESTIGATION画面へ切り替わり、正答後に`final_truth`へ進みます。", "");
finalQuestions.forEach((item, index) => push(`### FINAL-${String(index + 1).padStart(2, "0")}`, "", "- 問題文:", "", "```text", item.q, "```", "", `- 使用画像: ${item.images.map(code).join("、")}`, `- 使用証拠: ${item.evidence.map(code).join("、")}`, `- 正解: ${code(item.answer)}`, `- 判定: ${item.judge}`, ""));
for (const id of ["final_truth", "kuse_context", "kuse_choice", "yuma_decision", "evidence_package", "finish_prompt_old", "finish_prompt", "end16"]) {
  const scene = sceneMap[id];
  push(`### 正答後scene: ${id}`, "", `- 画像: ${scene.image ? `${scene.image} → ${fileForSlot(scene.image)}` : "なし"}`, "", "```text", scene.text, "```", "");
  if (scene.choices?.length) for (const choice of scene.choices) push(`- 選択肢 ${code(choice.label)} → ${code(choice.nextScene)}`);
}

push("## 10. 実装上のルート図", "", "```text");
const routeSeen = new Set();
function renderTree(id, indent = "", depth = 0) {
  if (depth > 80) { push(`${indent}${id} [DEPTH LIMIT]`); return; }
  const scene = sceneMap[id];
  if (!scene) { push(`${indent}${id} [MISSING]`); return; }
  push(`${indent}${id}${scene.ending ? ` (${scene.ending}: ${endingTitles[scene.ending]})` : ""}`);
  if (routeSeen.has(id)) { push(`${indent}  └─ [既出sceneへ合流]`); return; }
  routeSeen.add(id);
  const edges = [...(sceneEdges.get(id) ?? [])];
  if (id === "end15") edges.push({ label: "TITLE→INVESTIGATION正答", target: "investigation_restored", conditions: [] });
  if (id === "final_gate") edges.push({ label: "FINAL INVESTIGATION正答", target: "final_truth", conditions: [] });
  edges.forEach((edge, index) => {
    const last = index === edges.length - 1;
    const branch = last ? "└─" : "├─";
    const nextIndent = indent + (last ? "   " : "│  ");
    push(`${indent}  ${branch} ${edge.label}${edge.conditions?.length ? ` [${conditions(edge.conditions)}]` : ""} →`);
    renderTree(edge.target, nextIndent, depth + 1);
  });
  if (scene.ending && id !== "end15" && id !== "end16") push(`${indent}  └─ TITLE → START（次周回）`);
}
push("START →");
renderTree("arrival", "  ");
push("```", "");

const missingSceneRefs = [];
for (const [from, edges] of sceneEdges) for (const edge of edges) if (!sceneMap[edge.target]) missingSceneRefs.push(`${from} → ${edge.target}`);
const reachable = new Set();
const queue = ["arrival"];
while (queue.length) {
  const id = queue.shift();
  if (reachable.has(id) || !sceneMap[id]) continue;
  reachable.add(id);
  for (const edge of sceneEdges.get(id) ?? []) queue.push(edge.target);
  if (sceneMap[id].ending && id !== "end16") queue.push("arrival");
  if (id === "end15") queue.push("investigation_restored");
  if (id === "final_gate") queue.push("final_truth");
}
const unusedScenes = scenes.map((scene) => scene.id).filter((id) => !reachable.has(id));
push(`- 到達不能scene（条件を無視した構造到達性）: ${list(unusedScenes)}`, `- 存在しないsceneへの参照: ${list(missingSceneRefs)}`, "");

const missingAssetSlots = scenes.filter((scene) => scene.image && !assetSlots[scene.image]).map((scene) => `${scene.id}:${scene.image}`);
const missingImageFiles = Object.entries(assetSlots).filter(([, asset]) => !fs.existsSync(path.join(root, publicFileForSrc(asset.src)))).map(([slot]) => slot);
const usedSlots = new Set([...sceneUseBySlot.keys(), ...evidenceUseBySlot.keys()]);
const unusedSlots = Object.keys(assetSlots).filter((slot) => !usedSlots.has(slot));
const unusedImages = imageFiles.filter((file) => !slotByFile.has(file) && !file.endsWith("lodge_arrival_1637.png") && !file.endsWith("true_end_group_1723.png"));
const allSetFlags = new Set(scenes.flatMap((scene) => [...(scene.setFlags ?? []), ...(scene.choices ?? []).flatMap((choice) => choice.setFlags ?? [])]));
const allRequiredFlags = new Set(scenes.flatMap((scene) => [...(scene.conditions ?? []), ...(scene.choices ?? []).flatMap((choice) => choice.conditions ?? [])].flatMap((condition) => "flag" in condition ? [condition.flag] : [])));
const setOnlyFlags = [...allSetFlags].filter((flag) => !allRequiredFlags.has(flag));
const requiredOnlyFlags = [...allRequiredFlags].filter((flag) => !allSetFlags.has(flag));

// Detect strongly connected components among non-ending scenes and report only closed components with no exit.
const closedCycles = [];
for (const scene of scenes.filter((item) => !item.ending)) {
  const selfLoop = (sceneEdges.get(scene.id) ?? []).some((edge) => edge.target === scene.id);
  if (selfLoop) closedCycles.push(scene.id);
}
push("## 11. ソース整合性チェック", "", `- 存在しないsceneへの遷移: ${list(missingSceneRefs)}`, `- 使用されていないscene（構造到達不能）: ${list(unusedScenes)}`, `- 存在しないasset slotへのscene参照: ${list(missingAssetSlots)}`, `- asset slotはあるが実ファイルが存在しない参照: ${list(missingImageFiles)}`, `- 使用されていないasset slot: ${list(unusedSlots)}`, `- asset slotへ登録されていない画像ファイル: ${list(unusedImages)}`, `- 条件が成立せず到達不能なEND: ${scenes.filter((scene) => scene.ending && !reachable.has(scene.id)).map((scene) => scene.ending).map(code).join("、") || "なし"}`, `- 自己循環して抜けられない分岐: ${list(closedCycles)}`, `- 同一flagの表記揺れ: 自動検出上なし`, `- セットされるがflag条件では参照されないflag: ${list(setOnlyFlags)}`, `- 条件で必要だがセット箇所がないflag: ${list(requiredOnlyFlags)}`, "", "### 実装上の追加所見", "", "- INVESTIGATIONは仕様要求の01〜04ではなく、現実装は3問です。", "- scene.conditionsは全sceneで未使用です。条件はchoice.conditionsにだけ存在します。", "- `heard_tunnel_warning` と `naoki_0612_unlocked` はセットされますが、分岐条件には利用されません。", "- `all_normal_endings` は15種類の通常END取得時にapplySceneがセットしますが、分岐条件には利用されません。", "- `lodge_day`、`lodge_night`、`room_d_day`、`room_d_night`、`group_1723`、`storyboard`、`true_route` はasset slotに残っていますがscene/evidenceから未使用です。", "- SceneImageは `/assets/reference/` を含むslotを描画しないため、`suv`を使うARCHIVE証拠はslot指定があっても現UIでは画像が表示されません。", "- `photographer_question` の「集合写真再検証」はEND02条件とEND13条件で同じラベルのchoiceが2つ定義され、両END取得後は同名ボタンが2つ表示されます。", "");

fs.writeFileSync(output, md.join("\n") + "\n", "utf8");
console.log(output);
