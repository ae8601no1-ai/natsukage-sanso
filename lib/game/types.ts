export type EvidenceCategory = "PHOTO" | "MESSAGE" | "RECORD" | "ITEM" | "UNKNOWN";

export type GameFlags = Record<string, boolean>;

export type GameState = {
  currentScene: string;
  endings: string[];
  endingCount: number;
  evidence: string[];
  flags: GameFlags;
  loopCount: number;
  investigationUnlocked: boolean;
  sevenConfirmed: boolean;
  seventhPhotographerConfirmed: boolean;
  naokiIdentified: boolean;
  trueRouteUnlocked: boolean;
  naokiSurvivalConfirmed: boolean;
  kuseIdentified: boolean;
  trueEndCompleted: boolean;
  log: { speaker?: string; text: string; time?: string }[];
  settings: { textSize: "normal" | "large"; reduceMotion: boolean };
};

export type Condition =
  | { flag: string }
  | { ending: string }
  | { state: keyof GameState; equals: boolean }
  | { canUnlockEnd15: true };

export type Choice = {
  label: string;
  nextScene: string;
  conditions?: Condition[];
  setFlags?: string[];
  unlockEvidence?: string[];
};

export type Scene = {
  id: string;
  time?: string;
  image?: string;
  speaker?: string;
  text: string;
  choices?: Choice[];
  conditions?: Condition[];
  setFlags?: string[];
  unlockEvidence?: string[];
  nextScene?: string;
  ending?: string;
  effect?: "glitch" | "unread";
};

export type Evidence = {
  id: string;
  title: string;
  category: EvidenceCategory;
  description: string;
  image?: string;
  zoomable?: boolean;
};
