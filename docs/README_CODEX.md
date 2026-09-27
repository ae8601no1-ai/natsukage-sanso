# ARG『夏影山荘』 / TRUE END『七人目の夏』

## Codex implementation handoff

This package is the implementation source of truth for a NEW browser ARG project. Do not modify or reuse the existing ARG『404号室には誰もいない』 project/repository unless explicitly instructed later.

### Product goal
Build a Japanese browser-based branching suspense/horror ARG that initially looks like a 15-ending visual-novel mystery, then transforms into an evidence-comparison ARG and finally a fixed TRUE ROUTE. The player discovers that a seventh participant, 相沢直樹, was erased from protagonist 高瀬悠真's reconstruction of August 14.

### Core experience
1. Common route: lodge arrival, exploration, 17:18 six-person group photo, BBQ, test-of-courage decision.
2. Three route families: Curse / Photo / Lodge Murder.
3. 15 normal endings. Each ending unlocks archive evidence or a contradiction.
4. After enough evidence and END15, INVESTIGATION unlocks.
5. Player proves there were 7 participants, identifies the unseen photographer, then identifies 相沢直樹.
6. TRUE ROUTE unlocks. From here there are no branching choices: the past cannot be changed.
7. After the bridge fall, an unread 06:12 image proves Naoki survived.
8. Final investigation links 久世隆一 and his SUV to Naoki's last known encounter.
9. TRUE END 16: 『七人目の夏』. The final choice is only 「終了する」.

### Non-negotiable narrative rules
- Before the seventh-person investigation, never display the full name 「相沢直樹」.
- Before the reveal, never show the clear 17:23 seven-person group photo.
- Never use the term 「再現システム」 before TRUE ROUTE.
- 久世 must not read as a cartoon villain early. Otsuki's first death is accidental during a struggle; Kuse's first wrongdoing is concealment. His moral point of no return is the next morning when Naoki says he will go to police.
- The curse is a false interpretation, not a supernatural truth.
- The protagonist's recurring right-arm wound is a cross-route contradiction; its true origin is 22:51 during flight.
- 17:18 photo contains all six apparently known students, so the photographer is the missing seventh person. His reflection is faint in the lodge glass.
- 17:23 photo contains all seven and was taken by Kuse.
- `NAOKI_0815_0612.jpg` must remain unavailable/unread until after the TRUE ROUTE bridge scene.
- TRUE ROUTE has no normal choices.
- Manual click to advance; no automatic story progression.

### Characters
- 高瀬悠真 — protagonist, university student during incident; late 20s in present reconstruction.
- 相沢直樹 — hidden seventh participant; photography lover; close friend of Yuma.
- 佐久間亮 — organizer, bright/action-oriented.
- 森川拓海 — ghost-story fan; shrine red herring.
- 水野美咲 — frequently takes photos/videos; photography connection to Naoki.
- 小宮彩香 — cautious and observant.
- 藤堂圭介 — quiet, initially suspicious; later repeatedly searched for Naoki.
- 久世隆一 — 50s lodge manager; morally complex culprit.
- 大槻宗一郎 — landowner whose accidental death starts the real crime.

### Fixed real timeline
- 14:20 seven students depart.
- 16:37 arrive at lodge.
- 16:52 room assignment; Naoki uses Room D.
- 17:18 Naoki takes six-person lodge-front photo `IMG_0814_171842.jpg`.
- 17:23 Kuse takes seven-person group photo `IMG_0814_172311.jpg`.
- 18:00–20:15 BBQ.
- 20:42 tunnel/shrine story.
- 21:36 seven leave for test of courage.
- 22:02 tunnel/shrine.
- ~22:00 Kuse/Otsuki confrontation; Otsuki dies accidentally during struggle; Kuse chooses concealment.
- 22:27 Naoki notices activity.
- 22:31 first photo of standing person + fallen person.
- 22:35 video/photo of Kuse moving Otsuki; Kuse notices students.
- 22:38 Kuse shouts 「待ってくれ！ 違うんだ！」; students flee.
- 22:45 group splits.
- 22:51 Yuma injures right arm.
- 23:08 Naoki returns to lodge with evidence.
- 23:18 pursuer seen outside.
- 23:21 power cut.
- 23:24–23:40 intrusion/panic.
- 23:43 Naoki leaves with evidence phone.
- 23:49 Yuma catches him.
- 23:54 old suspension bridge.
- 23:56 bridge collapses; Naoki falls; Yuma flees.
- 00:35 police called from signal area.
- ~02:10 Naoki is alive and climbs out.
- 04:40 Naoki reaches road.
- 06:12 roadside camera records Naoki alive: `NAOKI_0815_0612.jpg`.
- 06:25–06:40 Kuse encounters Naoki. Naoki says he will go to police and evidence remains. Recording ends after Kuse says 「ここしか、俺には残ってないんだ」 and Naoki answers 「だからって、人を消していい理由にはならない」.

### Endings
01 触れてはいけない
02 六人目の足音
03 傷
04 帰れない
05 呪われた六人
06 見てはいけない写真
07 写真を消せ
08 管理人
09 追跡者
10 全員生還
11 犯人は藤堂
12 23時51分
13 空室
14 撮影者
15 存在しない人
16 TRUE END 七人目の夏

### Unlock logic
END15 requires:
- at least 8 distinct normal endings
- END03
- END10
- END13
- END14
Then next BBQ loop adds 「誰もいない席を見る」.

After END15 unlock INVESTIGATION.
Investigation answers:
1. participants = `7`
2. photographer is a trip participant = `はい`
3. seventh participant = `相沢直樹` (accept kana variants)
Then unlock TRUE ROUTE.

Final answers:
1. 06:12 subject = `相沢直樹`
2. time after fall = `6時間16分`
3. common vehicle owner = `久世隆一`
4. Naoki's last known encounter = `久世隆一`

### State model
Persist at minimum:
`end01..end16`, `ending_count`, `loop_count`, `investigation_unlocked`, `seven_confirmed`, `seventh_photographer_confirmed`, `naoki_identified`, `true_route_unlocked`, `naoki_survival_confirmed`, `kuse_identified`, `true_end_completed`.
Evidence flags:
`seen_7_cups`, `receipt_partial`, `room_d_seen`, `kuse_car_seen`, `unknown_bag_seen`, `group_photo_saved`, `timeline_conflict_wound`, `unknown_charger`, `unknown_messages`, `survival_record`, `damaged_name_tag`, `group_photo_hq`, `naoki_0612_photo`, `kuse_vehicle_match`, `final_audio`.

### Archive categories
PHOTO / MESSAGE / RECORD / ITEM / UNKNOWN. After INVESTIGATION unlock add COMPARE. Support 2–3 evidence items side-by-side with zoom where relevant.

### Main UI
- TITLE
- story image / evidence image area
- text/dialogue area
- choices
- LOG
- ARCHIVE
- ENDINGS
- TITLE
- later INVESTIGATION / COMPARE
- clear save/continue behavior

Use a restrained Japanese suspense design: dark navy/black, off-white text, subtle noise/glitch only when narratively justified. Avoid constant horror effects.

### Ending screen behavior
Before completion, ENDINGS shows hidden titles as `????????`.
After 15 normal endings are collected, briefly glitch from `15 / 15` to `15 / 16`; END16 remains hidden until TRUE END.
After TRUE END, show all 16 titles and change title-screen subtitle to 『七人目の夏』.

### Assets
See `assets/ASSET_MANIFEST.md` and `assets/reference/`.
The four supplied images are reference/master boards, not necessarily final per-screen crops. Build the app so individual final assets can later replace placeholders without changing story logic.

### Implementation approach
Prefer a data-driven scene engine rather than hardcoding every page in components. Store scene definitions in structured JSON/TS data with:
- id
- date/time
- background/image
- speaker
- body/dialogue
- choices
- conditions
- setFlags
- unlockEvidence
- nextScene
- ending

Answers must be validated server-side if a backend is used. Do not leak locked evidence paths or answers in obvious client-visible markup. For a local/static prototype, isolate answer keys from normal scene data and make migration to server validation straightforward.

### Acceptance criteria
- Player can reach all 15 normal endings through valid branches.
- Save/reload preserves endings, evidence and unlock state.
- END15 cannot unlock prematurely.
- Investigation cannot be bypassed to TRUE ROUTE.
- Naoki's full identity is not exposed before intended reveal.
- 06:12 file cannot be opened before bridge scene.
- TRUE ROUTE contains no branching choices except the later unread-file decision and final single 「終了する」 action.
- All archive evidence can be reopened.
- Photo comparison supports the 17:18 reflection and Kuse SUV comparison.
- Mobile and desktop layouts are usable.
- No automatic page advance.

### Work order for Codex
1. Inspect this package and produce a concise implementation plan.
2. Scaffold the new project.
3. Implement scene/state engine and save system.
4. Implement title/common route and route branching.
5. Implement all 15 endings and archive unlocks.
6. Implement INVESTIGATION and comparison UI.
7. Implement TRUE ROUTE and final investigation.
8. Wire supplied reference assets/placeholders.
9. Add tests for unlock conditions and answer validation.
10. Run the app, fix broken branches, and report remaining missing production assets separately rather than inventing new story facts.
