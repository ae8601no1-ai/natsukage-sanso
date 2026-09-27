import type { Condition, GameState, Scene } from "./types";

export const STORAGE_KEY = "natsukage-sanso-save-v1";

export const initialState: GameState = {
  currentScene: "arrival",
  endings: [], endingCount: 0, evidence: [], flags: {}, loopCount: 0,
  investigationUnlocked: false, sevenConfirmed: false,
  seventhPhotographerConfirmed: false, naokiIdentified: false,
  trueRouteUnlocked: false, naokiSurvivalConfirmed: false,
  kuseIdentified: false, trueEndCompleted: false, log: [],
  settings: { textSize: "normal", reduceMotion: false },
};

export const requiredForEnd15 = ["END03", "END10", "END13", "END14"];
export function canUnlockEnd15(state: GameState) {
  const normal = state.endings.filter((id) => id !== "END15" && id !== "END16");
  return new Set(normal).size >= 8 && requiredForEnd15.every((id) => state.endings.includes(id));
}

export function meets(state: GameState, conditions: Condition[] = []) {
  return conditions.every((condition) => {
    if ("flag" in condition) return Boolean(state.flags[condition.flag]);
    if ("ending" in condition) return state.endings.includes(condition.ending);
    if ("state" in condition) return Boolean(state[condition.state]) === condition.equals;
    return canUnlockEnd15(state);
  });
}

export function applyScene(state: GameState, scene: Scene): GameState {
  const endings = scene.ending && !state.endings.includes(scene.ending)
    ? [...state.endings, scene.ending] : state.endings;
  const evidence = [...new Set([...state.evidence, ...(scene.unlockEvidence ?? [])])];
  const flags = { ...state.flags };
  scene.setFlags?.forEach((flag) => { flags[flag] = true; });
  const normalCount = endings.filter((id) => /^END(0[1-9]|1[0-5])$/.test(id)).length;
  const newEnding = Boolean(scene.ending && !state.endings.includes(scene.ending));
  return {
    ...state, endings, endingCount: endings.length, evidence, flags,
    loopCount: state.loopCount + (newEnding && scene.ending !== "END16" ? 1 : 0),
    investigationUnlocked: state.investigationUnlocked || endings.includes("END15"),
    trueEndCompleted: state.trueEndCompleted || endings.includes("END16"),
    log: [...state.log, { speaker: scene.speaker, text: scene.text, time: scene.time }].slice(-120),
    ...(normalCount === 15 ? { flags: { ...flags, all_normal_endings: true } } : {}),
  };
}

export function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch { return initialState; }
}
