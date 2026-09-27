import type { Evidence } from "./types";

export const evidence: Evidence[] = [
  { id: "seen_7_cups", title: "七つの紙コップ", category: "ITEM", description: "BBQの片付け前に並んでいた。人数と一致しない。" },
  { id: "receipt_partial", title: "8月14日のレシート", category: "RECORD", description: "飲み物と食料の数量が、六人分にしては多い。" },
  { id: "room_d_seen", title: "寝室Dの使用痕", category: "ITEM", description: "空室のはずの寝室。水と充電器、床の擦れ跡。", image: "room_d_day", zoomable: true },
  { id: "kuse_car_seen", title: "管理人のSUV", category: "PHOTO", description: "濃紺の車体。左後部の傷と山型ステッカー。", image: "suv", zoomable: true },
  { id: "unknown_bag_seen", title: "所有者不明のカメラバッグ", category: "ITEM", description: "寝室Dで見つかった。名札は破れている。" },
  { id: "group_photo_saved", title: "IMG_0814_171842.jpg", category: "PHOTO", description: "17:18。写っているのは六人。撮影者は写っていない。", image: "group_1718", zoomable: true },
  { id: "timeline_conflict_wound", title: "20:11 右腕の傷", category: "PHOTO", description: "別の記録では22:51まで存在しないはずの傷。" },
  { id: "unknown_charger", title: "メーカー不明の充電器", category: "ITEM", description: "六人の所持品一覧と一致しない。" },
  { id: "unknown_messages", title: "UNKNOWNからのメッセージ", category: "MESSAGE", description: "『誰も傷つけるつもりはない』『写真だけ返してくれ』。" },
  { id: "survival_record", title: "生存者記録", category: "RECORD", description: "生還者は6、参加者は7。集計欄に矛盾がある。" },
  { id: "damaged_name_tag", title: "破損したネームタグ", category: "ITEM", description: "A N——。カメラバッグに残っていた断片。" },
  { id: "group_photo_hq", title: "17:18 反射部復元", category: "PHOTO", description: "ガラスにカメラを構える人物が薄く映る。", image: "group_1718_hq", zoomable: true },
  { id: "naoki_0612_photo", title: "NAOKI_0815_0612.jpg", category: "PHOTO", description: "橋の崩落から6時間16分後。路上を歩く人物。", image: "naoki_0612", zoomable: true },
  { id: "kuse_vehicle_match", title: "06:25 路肩カメラ", category: "PHOTO", description: "左後部の傷、山型ステッカー、ホイール形状が一致。", image: "suv", zoomable: true },
  { id: "final_audio", title: "途切れた録音", category: "RECORD", description: "『ここしか、俺には残ってないんだ』――その後、記録は途切れる。" },
];
