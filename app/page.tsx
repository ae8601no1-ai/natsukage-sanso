"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, BookOpen, ChevronRight, Eye, FileSearch, KeyRound, Maximize2, RotateCcw, Settings, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assetSlots } from "@/lib/game/assets";
import { visibleCharacterProfiles } from "@/lib/game/characters";
import { validateFinal, validateFinalFields, validateInvestigation, validateInvestigationFields } from "@/lib/game/answers";
import { evidence as allEvidence } from "@/lib/game/evidence";
import { endingTitles, sceneMap } from "@/lib/game/scenes";
import { applyScene, initialState, loadState, meets, saveState } from "@/lib/game/state";
import type { Choice, Evidence, GameState } from "@/lib/game/types";

type Panel = "log" | "archive" | "endings" | "settings" | "compare" | null;

function SceneImage({ slot, onZoom }: { slot?: string; onZoom?: () => void }) {
  const asset = slot ? assetSlots[slot] : undefined;
  if (!asset || asset.src.includes("/reference/")) return null;
  return <button className={`scene-image ${asset.crop ? `crop-${asset.crop}` : ""}`} onClick={onZoom} aria-label="画像を拡大"><span style={{ backgroundImage: `url(${asset.src})`, backgroundPosition: asset.position ?? "center" }} /><span className="zoom-mark"><Maximize2 size={16} /> 拡大</span></button>;
}

export default function Home() {
  const [state, setState] = useState<GameState>(initialState);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<"title" | "characters" | "game" | "investigation" | "final">("title");
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [zoomSlot, setZoomSlot] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState(["", "", ""]);
  const [finalAnswers, setFinalAnswers] = useState(["", "", "", ""]);
  const [investigationFeedback, setInvestigationFeedback] = useState<boolean[] | null>(null);
  const [finalFeedback, setFinalFeedback] = useState<boolean[] | null>(null);
  const [error, setError] = useState("");
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => { setState(loadState()); setAccessGranted(localStorage.getItem("natsukage-access-granted") === "true"); setReady(true); }, []);
  useEffect(() => { if (ready) saveState(state); }, [ready, state]);
  const scene = sceneMap[state.currentScene] ?? sceneMap.arrival;
  const hasSceneImage = Boolean(scene.image && assetSlots[scene.image] && !assetSlots[scene.image].src.includes("/reference/"));
  const choices = (scene.choices ?? []).filter((choice) => meets(state, choice.conditions));
  const canSkipRead = state.readScenes.includes(scene.id) && Boolean(scene.nextScene) && !scene.ending && !scene.effect && state.currentScene !== "final_gate";
  const unlocked = useMemo(() => allEvidence.filter((item) => state.evidence.includes(item.id)), [state.evidence]);

  function enterScene(id: string, extras?: Pick<Choice, "setFlags" | "unlockEvidence">) {
    const next = sceneMap[id]; if (!next) return;
    let draft = { ...state, currentScene: id, readScenes: [...new Set([...state.readScenes, state.currentScene])] };
    if (extras?.setFlags) draft = { ...draft, flags: { ...draft.flags, ...Object.fromEntries(extras.setFlags.map((flag) => [flag, true])) } };
    if (extras?.unlockEvidence) draft = { ...draft, evidence: [...new Set([...draft.evidence, ...extras.unlockEvidence])] };
    setState(applyScene(draft, next));
  }
  function skipReadScenes(toChoice: boolean) {
    if (!canSkipRead) return;
    let draft = state;
    let current = scene;
    while (current.nextScene && !current.ending && !current.effect && current.id !== "final_gate") {
      const next = sceneMap[current.nextScene];
      if (!next) break;
      draft = applyScene({ ...draft, currentScene: next.id, readScenes: [...new Set([...draft.readScenes, current.id])] }, next);
      current = next;
      const availableChoices = (current.choices ?? []).filter((choice) => meets(draft, choice.conditions));
      if (!toChoice || availableChoices.length || !draft.readScenes.includes(current.id) || current.ending || current.effect || current.id === "final_gate") break;
    }
    setState(draft);
    if (current.id === "final_gate") setScreen("final");
  }
  function startLoop() { const next = sceneMap.arrival; setState(applyScene({ ...state, currentScene: "arrival" }, next)); setScreen("game"); }
  function continueGame() { setScreen(state.currentScene === "final_gate" ? "final" : "game"); }
  function submitInvestigation() {
    const results = validateInvestigationFields(investigation); setInvestigationFeedback(results);
    if (!validateInvestigation(investigation)) { setError("不一致の入力を確認してください。"); return; }
    const restored = sceneMap.investigation_restored;
    setError(""); setInvestigationFeedback(null); setState(applyScene({ ...state, currentScene: restored.id, sevenConfirmed: true, seventhPhotographerConfirmed: true, naokiIdentified: true, trueRouteUnlocked: true, evidence: [...new Set([...state.evidence, "group_photo_hq"])] }, restored)); setScreen("game");
  }
  function startTrueRoute() { const next = sceneMap.true_arrival; setState(applyScene({ ...state, currentScene: next.id }, next)); setScreen("game"); }
  function submitFinal() {
    const results = validateFinalFields(finalAnswers); setFinalFeedback(results);
    if (!validateFinal(finalAnswers)) { setError("不一致の入力を確認してください。各項目のヒントを再確認できます。"); return; }
    const next = sceneMap.final_truth; setError(""); setFinalFeedback(null); setState(applyScene({ ...state, currentScene: next.id, naokiSurvivalConfirmed: true, kuseIdentified: true }, next)); setScreen("game");
  }
  if (!ready) return <main className="loading">記録を読み込んでいます…</main>;
  if (!accessGranted) return <main className="app-shell access-shell"><AccessGate value={accessCode} setValue={setAccessCode} error={accessError} onSubmit={() => { if (accessCode.trim() !== "natukaze-0814") { setAccessError("認証コードが一致しません。"); return; } localStorage.setItem("natsukage-access-granted", "true"); setAccessError(""); setAccessGranted(true); setScreen("characters"); }} /><footer className="fiction-notice">このゲームはフィクションです。個人名。地名は実際には存在しません。</footer></main>;

  return <main className={`app-shell text-${state.settings.textSize} ${state.settings.reduceMotion ? "reduce-motion" : ""}`}><div className="grain" aria-hidden="true" />
    {screen === "title" ? <section className={`title-screen ${state.trueEndCompleted ? "true-complete" : ""}`}><div className="title-atmosphere" /><div className="title-copy"><p className="eyebrow">AUGUST 14</p><h1>夏影山荘</h1><p className="title-sub">{state.trueEndCompleted ? "七人目の夏" : state.investigationUnlocked ? "DATA INCONSISTENCY DETECTED" : ""}</p><div className="title-actions"><button className="primary" onClick={startLoop}>{state.loopCount ? "はじめから" : "記録を開始"}<ChevronRight /></button>{state.loopCount > 0 && <button onClick={continueGame}>つづきから</button>}<button onClick={() => setScreen("characters")}><Users /> 人物紹介</button>{state.endings.length > 0 && <button onClick={() => setPanel("archive")}>ARCHIVE</button>}{state.endings.length > 0 && <button onClick={() => setPanel("endings")}>ENDINGS</button>}{state.investigationUnlocked && !state.trueRouteUnlocked && <button className="signal" onClick={() => setScreen("investigation")}><FileSearch /> INVESTIGATION</button>}{state.trueRouteUnlocked && !state.trueEndCompleted && <button className="signal" onClick={startTrueRoute}><Eye /> TRUE ROUTE</button>}<button onClick={() => setPanel("settings")}>SETTINGS</button></div><p className="progress-line">LOOP {String(state.loopCount).padStart(2, "0")} / END {state.endings.filter((e) => e !== "END16").length} / {state.endings.includes("END15") ? "16" : "15"}</p></div></section>
    : screen === "characters" ? <CharacterIntroduction end15Unlocked={state.endings.includes("END15")} onClose={() => setScreen("title")} />
    : screen === "investigation" ? <Investigation values={investigation} setValues={(values) => { setInvestigation(values); setInvestigationFeedback(null); setError(""); }} feedback={investigationFeedback} error={error} onSubmit={submitInvestigation} onClose={() => setScreen("title")} />
    : screen === "final" ? <FinalInvestigation values={finalAnswers} setValues={(values) => { setFinalAnswers(values); setFinalFeedback(null); setError(""); }} feedback={finalFeedback} error={error} onSubmit={submitFinal} onClose={() => setScreen("game")} />
    : <section className={`game-screen ${scene.effect ?? ""}`}><header className="topbar"><button className="wordmark" onClick={() => setScreen("title")}>夏影山荘</button><nav aria-label="メインメニュー"><button onClick={() => setPanel("log")}><BookOpen /><span>LOG</span></button><button onClick={() => setPanel("archive")}><Archive /><span>ARCHIVE</span>{unlocked.length > 0 && <b>{unlocked.length}</b>}</button><button onClick={() => setPanel("endings")}><span>ENDINGS</span></button>{state.investigationUnlocked && <button onClick={() => setPanel("compare")}><span>COMPARE</span></button>}<button onClick={() => setPanel("settings")} aria-label="設定"><Settings /></button></nav></header><div className={`story-layout ${hasSceneImage ? "" : "no-visual"}`}>{hasSceneImage && <div className="scene-wrap"><SceneImage slot={scene.image} onZoom={() => setZoomSlot(scene.image ?? null)} /><span className="scene-id">{scene.id.toUpperCase()}</span></div>}<section className="narrative"><div className="scene-meta"><span>{scene.time}</span><span>LOOP {String(state.loopCount).padStart(2, "0")}</span></div><div className="dialogue"><p className="speaker">{scene.speaker}</p><p>{scene.text}</p></div>{scene.ending ? <div className="ending-actions"><p className="ending-label">{scene.ending === "END16" ? "TRUE END" : scene.ending}<strong>{endingTitles[scene.ending]}</strong></p><button className="primary" onClick={() => setScreen("title")}>TITLE</button></div> : state.currentScene === "final_gate" ? <button className="primary advance" onClick={() => setScreen("final")}>未確認ファイルを見る <ChevronRight /></button> : choices.length ? <div className="choices">{choices.map((choice) => <button key={choice.label} onClick={() => enterScene(choice.nextScene, choice)}><span>{choice.label}</span><ChevronRight /></button>)}</div> : scene.nextScene ? <><div className="advance-row">{canSkipRead && <button className="read-skip" onClick={() => skipReadScenes(false)}>既読SKIP</button>}{canSkipRead && <button className="read-skip" onClick={() => skipReadScenes(true)}>選択肢まで</button>}</div><button className="advance" onClick={() => enterScene(scene.nextScene!)}>次へ <ChevronRight /></button></> : null}</section></div></section>}
    <PanelDialog panel={panel} setPanel={setPanel} state={state} setState={setState} unlocked={unlocked} compare={compare} setCompare={setCompare} setZoomSlot={setZoomSlot} />
    <Dialog open={Boolean(zoomSlot)} onOpenChange={(open) => !open && setZoomSlot(null)}><DialogContent className="image-dialog"><DialogHeader><DialogTitle>画像資料</DialogTitle><DialogDescription>拡大表示。資料の細部を確認できます。</DialogDescription></DialogHeader>{zoomSlot && <SceneImage slot={zoomSlot} />}</DialogContent></Dialog>
    <footer className="fiction-notice">このゲームはフィクションです。個人名。地名は実際には存在しません。</footer>
  </main>;
}

function AccessGate({ value, setValue, error, onSubmit }: { value: string; setValue: (value: string) => void; error: string; onSubmit: () => void }) {
  return <section className="access-screen"><div className="access-atmosphere" /><form className="access-card" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><KeyRound /><p className="eyebrow">AUTHENTICATION / AUGUST 14</p><h1>8月14日を始めますか？</h1><p>記録を開くには、認証コードを入力してください。</p><label><span>認証コード</span><input type="password" value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off" spellCheck={false} /></label>{error && <p className="form-error">{error}</p>}<button className="primary" type="submit">認証して進む <ChevronRight /></button></form></section>;
}

function CharacterIntroduction({ end15Unlocked, onClose }: { end15Unlocked: boolean; onClose: () => void }) {
  const profiles = visibleCharacterProfiles(end15Unlocked);
  return <section className="character-screen"><header><div><p className="eyebrow">CHARACTER FILE</p><h1>人物紹介</h1><p>8月14日、夏影山荘を訪れた人々。</p></div><button onClick={onClose}><X /> TITLE</button></header><div className="character-grid">{profiles.map((profile) => <article className={profile.unlockAfterEnd15 ? "character-secret" : ""} key={profile.id}><img src={profile.image} alt={profile.name} /><div><span>{profile.role}</span><h2>{profile.name}</h2><p>{profile.description}</p></div></article>)}</div><button className="primary character-close" onClick={onClose}>タイトルへ進む <ChevronRight /></button></section>;
}

function Investigation({ values, setValues, feedback, error, onSubmit, onClose }: { values: string[]; setValues: (v: string[]) => void; feedback: boolean[] | null; error: string; onSubmit: () => void; onClose: () => void }) {
  const questions = ["8月14日。\n夏影山荘を訪れた大学生は何人ですか？", "写真には旅行参加者6名全員が写っています。\n撮影者も旅行参加者だったと考えられますか？", "七人目の名前を入力してください。"];
  const hints = ["生存者記録の PARTICIPANTS と、集合写真に写る人数を比べてください。", "17:18の写真には六人全員が写っています。シャッターを押した人物を考えてください。", "破損したネームタグと、復元された人物記録を照合してください。"];
  return <section className="investigation-screen"><button className="close-page" onClick={onClose}><X /> TITLE</button><div className="investigation-card"><p className="eyebrow">EVIDENCE RECONSTRUCTION</p><h1>INVESTIGATION</h1><p className="lead">記録に矛盾があります。<br />関連資料を確認してください。</p>{questions.map((q, i) => <label key={q} className={feedback ? feedback[i] ? "answer-correct" : "answer-wrong" : ""}><span>{q}</span><input value={values[i]} onChange={(e) => { const copy = [...values]; copy[i] = e.target.value; setValues(copy); }} autoComplete="off" />{feedback && <small>{feedback[i] ? "✓ 正解" : `不一致 — ヒント：${hints[i]}`}</small>}</label>)}{error && <p className="form-error">{error}</p>}<button className="primary" onClick={onSubmit}>決定</button></div></section>;
}

function FinalInvestigation({ values, setValues, feedback, error, onSubmit, onClose }: { values: string[]; setValues: (v: string[]) => void; feedback: boolean[] | null; error: string; onSubmit: () => void; onClose: () => void }) {
  const questions = ["写真に写っている人物を特定してください。", "2つの記録の時間差を入力してください。", "3つの記録に共通する車両の所有者は？", "8月15日朝。\n相沢直樹が最後に会った人物は誰ですか？"];
  const hints = ["06:12の未確認ファイル名と、写っている人物を確認してください。", "吊り橋の崩落時刻23:56と、道路カメラの06:12を日付をまたいで比較してください。", "17:23、22:35、06:25の車両で一致する傷・ステッカー・ホイールを調べてください。", "06:25の記録で直樹と対面し、会話している人物を確認してください。"];
  return <section className="investigation-screen final-investigation"><button className="close-page" onClick={onClose}><X /> 戻る</button><div className="investigation-card"><p className="eyebrow">FINAL EVIDENCE LINK</p><h1>最終捜査</h1><p className="lead">不一致の項目には、関連資料を示すヒントが表示されます。</p>{questions.map((q, i) => <label key={q} className={feedback ? feedback[i] ? "answer-correct" : "answer-wrong" : ""}><span>{q}</span><input value={values[i]} onChange={(e) => { const copy = [...values]; copy[i] = e.target.value; setValues(copy); }} autoComplete="off" />{feedback && <small>{feedback[i] ? "✓ 正解" : `不一致 — ヒント：${hints[i]}`}</small>}</label>)}{error && <p className="form-error">{error}</p>}<button className="primary" onClick={onSubmit}>決定</button></div></section>;
}

function PanelDialog({ panel, setPanel, state, setState, unlocked, compare, setCompare, setZoomSlot }: { panel: Panel; setPanel: (p: Panel) => void; state: GameState; setState: (s: GameState) => void; unlocked: Evidence[]; compare: string[]; setCompare: (v: string[]) => void; setZoomSlot: (v: string | null) => void }) {
  const title = panel === "log" ? "LOG" : panel === "archive" ? "ARCHIVE" : panel === "endings" ? "ENDINGS" : panel === "settings" ? "SETTINGS" : "COMPARE";
  return <Dialog open={Boolean(panel)} onOpenChange={(open) => !open && setPanel(null)}><DialogContent className="panel-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{panel === "compare" ? "2〜3件の資料を横並びで照合します。" : "保存された記録を確認します。"}</DialogDescription></DialogHeader>{panel === "log" && <div className="log-list">{[...state.log].reverse().map((item, i) => <article key={i}><time>{item.time}</time><b>{item.speaker}</b><p>{item.text}</p></article>)}</div>}{panel === "archive" && <div className="archive-grid">{unlocked.length ? unlocked.map((item) => <EvidenceCard key={item.id} item={item} onZoom={setZoomSlot} />) : <p className="empty-note">解放された資料はありません。</p>}</div>}{panel === "endings" && <div className={`endings-grid ${state.flags.all_normal_endings ? "complete-glitch" : ""}`}>{Object.entries(endingTitles).map(([id, name]) => <div className={state.endings.includes(id) ? "obtained" : ""} key={id}><span>{id}</span><strong>{state.endings.includes(id) ? name : "????????"}</strong></div>)}</div>}{panel === "compare" && <><div className="compare-picker">{unlocked.map((item) => <button className={compare.includes(item.id) ? "selected" : ""} key={item.id} onClick={() => setCompare(compare.includes(item.id) ? compare.filter((id) => id !== item.id) : compare.length < 3 ? [...compare, item.id] : compare)}>{item.title}</button>)}</div><div className="compare-grid">{compare.map((id) => { const item = unlocked.find((e) => e.id === id)!; return <EvidenceCard key={id} item={item} onZoom={setZoomSlot} />; })}</div></>}{panel === "settings" && <div className="settings-list"><label>文字サイズ<select value={state.settings.textSize} onChange={(e) => setState({ ...state, settings: { ...state.settings, textSize: e.target.value as "normal" | "large" } })}><option value="normal">標準</option><option value="large">大きい</option></select></label><label><input type="checkbox" checked={state.settings.reduceMotion} onChange={(e) => setState({ ...state, settings: { ...state.settings, reduceMotion: e.target.checked } })} /> 動きを抑える</label><button className="danger" onClick={() => { if (confirm("すべての記録を消去しますか？")) { localStorage.removeItem("natsukage-sanso-save-v1"); location.reload(); } }}><RotateCcw /> セーブデータを消去</button></div>}</DialogContent></Dialog>;
}

function EvidenceCard({ item, onZoom }: { item: Evidence; onZoom: (slot: string | null) => void }) { return <article className="evidence-card">{item.image && <SceneImage slot={item.image} onZoom={() => onZoom(item.image ?? null)} />}<span className="category">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p></article>; }
