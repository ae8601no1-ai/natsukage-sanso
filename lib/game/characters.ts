export type CharacterProfile = {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  unlockAfterEnd15?: boolean;
};

export const characterProfiles: CharacterProfile[] = [
  { id: "yuma", name: "高瀬 悠真", role: "大学生／主人公", description: "ごく普通の大学生。少し慎重で、周囲の小さな変化によく気づく。", image: "/assets/generated/character_takase_yuma.png" },
  { id: "sakuma", name: "佐久間 亮", role: "旅行の企画者", description: "明るく行動的。今回の山荘旅行を計画した、仲間思いのリーダー役。", image: "/assets/generated/character_sakuma_ryo.png" },
  { id: "morikawa", name: "森川 拓海", role: "大学生", description: "怪談好きで好奇心が強い。場を盛り上げる一方、危険にも首を突っ込みやすい。", image: "/assets/generated/character_morikawa_takumi.png" },
  { id: "misaki", name: "水野 美咲", role: "大学生", description: "スマートフォンで友人たちをよく撮影する。明るく社交的で、みんなの写真係。", image: "/assets/generated/character_mizuno_misaki.png" },
  { id: "ayaka", name: "小宮 彩香", role: "大学生", description: "慎重で観察力がある。危険な行動には反対することが多い。", image: "/assets/generated/character_komiya_ayaka.png" },
  { id: "todo", name: "藤堂 圭介", role: "大学生", description: "寡黙で落ち着いている。何を考えているのか分かりにくく、疑われやすい。", image: "/assets/generated/character_todo_keisuke.png" },
  { id: "kuze", name: "久世 隆一", role: "夏影山荘の管理人", description: "山で生まれ育った穏やかな管理人。この土地と山荘に深い愛着を持つ。", image: "/assets/generated/character_kuze_ryuichi.png" },
  { id: "naoki", name: "相沢 直樹", role: "七人目の参加者", description: "カメラが好きな悠真の親友。旅行中は撮影する側にいることが多かった。", image: "/assets/generated/character_aizawa_naoki.png", unlockAfterEnd15: true },
];

export function visibleCharacterProfiles(end15Unlocked: boolean) {
  return characterProfiles.filter((profile) => !profile.unlockAfterEnd15 || end15Unlocked);
}
