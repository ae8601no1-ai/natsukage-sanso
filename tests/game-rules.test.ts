import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateFinal, validateFinalFields, validateInvestigation, validateInvestigationFields } from "../lib/game/answers.ts";
import { endingTitles, sceneMap, scenes } from "../lib/game/scenes.ts";
import { canUnlockEnd15, initialState, meets } from "../lib/game/state.ts";
import { visibleCharacterProfiles } from "../lib/game/characters.ts";
import { assetSlots, kuseSuvVisualSpec } from "../lib/game/assets.ts";
import { evidence } from "../lib/game/evidence.ts";

const appSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("END15 requires eight distinct endings and every required ending", () => {
  assert.equal(canUnlockEnd15({ ...initialState, endings: ["END03", "END10", "END13", "END14", "END01", "END02", "END04"] }), false);
  assert.equal(canUnlockEnd15({ ...initialState, endings: ["END03", "END10", "END13", "END14", "END01", "END02", "END04", "END05"] }), true);
  assert.equal(canUnlockEnd15({ ...initialState, endings: ["END01", "END02", "END03", "END04", "END05", "END06", "END07", "END08", "END10"] }), false);
});

test("all 15 normal endings and TRUE END are defined", () => {
  for (let n = 1; n <= 16; n++) {
    const id = `END${String(n).padStart(2, "0")}`;
    assert.ok(endingTitles[id]);
    assert.ok(scenes.some((scene) => scene.ending === id));
  }
});

test("obtained endings can be reopened without overwriting saved progress", () => {
  assert.match(appSource, /if \(!state\.endings\.includes\(endingId\)\) return/);
  assert.match(appSource, /candidate\.ending === endingId/);
  assert.match(appSource, /setReviewEndingScene\(endingScene\.id\)/);
  assert.match(appSource, /disabled=\{!obtained\}/);
  assert.doesNotMatch(appSource, /currentScene: endingScene\.id/);
});

test("the hidden full name is absent before TRUE ROUTE scenes", () => {
  const preReveal = scenes.filter((scene) => !scene.id.startsWith("true_") && !["investigation_restored", "unread_notice", "unread_0612", "final_gate", "final_truth", "kuse_context", "kuse_choice", "yuma_decision", "evidence_package", "finish_prompt_old", "finish_prompt", "end16"].includes(scene.id));
  assert.equal(preReveal.some((scene) => JSON.stringify(scene).includes("相沢直樹")), false);
});

test("TRUE ROUTE is linear until the single final action", () => {
  const route = ["true_arrival", "true_room", "true_photo18", "true_photo23", "true_bbq", "true_light", "true_crime", "true_detected", "true_wound", "true_review", "true_outside", "true_leave", "true_road", "true_bridge", "true_present", "true_terminated"];
  for (const id of route) {
    assert.ok(sceneMap[id].nextScene);
    assert.equal(sceneMap[id].choices, undefined);
  }
  assert.deepEqual(sceneMap.finish_prompt.choices?.map((choice) => choice.label), ["終了する"]);
});

test("06:12 evidence unlocks only in the post-bridge unread scene", () => {
  const unlockers = scenes.filter((scene) => scene.unlockEvidence?.includes("naoki_0612_photo"));
  assert.deepEqual(unlockers.map((scene) => scene.id), ["unread_0612"]);
  assert.equal(sceneMap.true_bridge.nextScene, "true_present");
  assert.equal(sceneMap.true_terminated.nextScene, "unread_notice");
  assert.deepEqual(sceneMap.unread_notice.choices?.map((choice) => choice.label), ["開く"]);
});

test("investigation and final answers accept specified variants", () => {
  assert.equal(validateInvestigation(["7", "はい", "あいざわなおき"]), true);
  assert.equal(validateInvestigation(["6", "はい", "相沢直樹"]), false);
  assert.equal(validateFinal(["アイザワナオキ", "6時間16分", "くぜりゅういち", "久世隆一"]), true);
});

test("END13 archive evidence preserves the partial-name clue without changing the ending text", async () => {
  assert.deepEqual(sceneMap.end13.unlockEvidence, ["room_d_seen", "unknown_bag_seen", "unknown_charger", "damaged_name_tag"]);
  assert.equal(sceneMap.end13.text.includes("A—— N——"), true);
  assert.equal(sceneMap.end13.text.includes("相沢直樹"), false);

  const nameTag = evidence.find((item) => item.id === "damaged_name_tag");
  assert.ok(nameTag);
  assert.equal(nameTag.image, "damaged_name_tag");
  assert.equal(nameTag.zoomable, true);
  assert.match(nameTag.description, /姓は「相沢」と読める/);
  assert.match(nameTag.description, /名前も一部確認できる/);
  assert.doesNotMatch(nameTag.description, /相沢\s*直樹|裏面/);
  assert.equal(assetSlots.damaged_name_tag.src, "/assets/generated/damaged_name_tag.png");

  const image = await readFile(new URL("../public/assets/generated/damaged_name_tag.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.ok(image.byteLength > 100_000);
});

test("archive photo slots use dedicated images matching their evidence descriptions", async () => {
  assert.equal(assetSlots.vehicle_1723_record.src, "/assets/generated/vehicle_1723_archive.png");
  assert.equal(assetSlots.wound_record_2250_clean.src, "/assets/generated/wound_record_2250_clean.png");
  assert.equal(evidence.find((item) => item.id === "vehicle_1723_record")?.description, "山荘前に停車する濃紺のSUV。左後部の傷と山型ステッカーを確認できる。");
  assert.equal(evidence.find((item) => item.id === "timeline_conflict_wound")?.description, "祠を離れた後の写真。右腕にはまだ傷がない。");

  for (const path of ["../public/assets/generated/vehicle_1723_archive.png", "../public/assets/generated/wound_record_2250_clean.png"]) {
    const image = await readFile(new URL(path, import.meta.url));
    assert.equal(image.subarray(1, 4).toString(), "PNG", path);
    assert.ok(image.byteLength > 100_000, path);
  }
});

test("Kuse SUV evidence keeps one canonical vehicle specification", async () => {
  assert.deepEqual(kuseSuvVisualSpec, {
    color: "濃紺",
    view: "右後方",
    damage: "左後部",
    sticker: "白い山型シルエット／リアウィンドウ中央下部",
    rearTireCover: false,
  });
  const expectedDescriptions = {
    kuse_car_seen: "濃紺の車体。左後部の傷と山型ステッカー。",
    vehicle_1723_record: "山荘前に停車する濃紺のSUV。左後部の傷と山型ステッカーを確認できる。",
    vehicle_2235_record: "林道脇の濃紺のSUV。左後部の傷と山型ステッカーが17:23の車両と一致する。",
    kuse_vehicle_match: "左後部の傷、山型ステッカー、ホイール形状が一致。"
  };
  for (const [id, description] of Object.entries(expectedDescriptions)) {
    assert.equal(evidence.find((item) => item.id === id)?.description, description, id);
  }
  assert.doesNotMatch(JSON.stringify({ evidence, scenes }), /右後部/);

  const vehicleAssets = [
    assetSlots.suv.src,
    assetSlots.suv_night.src,
    assetSlots.vehicle_1723_record.src,
    assetSlots.vehicle_2235_record.src,
    assetSlots.roadcam_0625.src,
    assetSlots.kuse_naoki_final.src
  ];
  assert.deepEqual(vehicleAssets, [
    "/assets/generated/kuse_suv.png",
    "/assets/generated/kuse_suv_night.png",
    "/assets/generated/vehicle_1723_archive.png",
    "/assets/generated/crime_2231.png",
    "/assets/generated/roadcam_0625.png",
    "/assets/generated/kuse_naoki_final.png"
  ]);
  for (const src of vehicleAssets) {
    const image = await readFile(new URL(`../public${src}`, import.meta.url));
    assert.equal(image.subarray(1, 4).toString(), "PNG", src);
    assert.ok(image.byteLength > 100_000, src);
  }
});

test("END14 and END15 retain the intended seventh-person deduction", () => {
  assert.match(sceneMap.end14.text, /これ……誰が撮ったの？/);
  assert.match(sceneMap.end14.text, /カメラを構えた人影/);
  assert.match(sceneMap.end14.text, /【悠真】\n「……。」\n\n「直樹……？」$/);
  assert.doesNotMatch(sceneMap.end14.text, /相沢\s*直樹/);
  assert.match(sceneMap.end15.text, /PARTICIPANTS：6[\s\S]*PARTICIPANTS：7[\s\S]*DATA CORRUPTED/);
  assert.equal(validateInvestigation(["7", "はい", "相沢直樹"]), true);
});

test("END03 proves the arm was uninjured immediately before the real 22:51 wound", () => {
  assert.equal(sceneMap.end03.text.includes("22:50"), true);
  assert.equal(sceneMap.end03.text.includes("傷は、まだない"), true);
  assert.equal(sceneMap.end03.image, "wound_record_2250_clean");
  assert.equal(sceneMap.true_wound.time, "22:51");
  assert.equal(sceneMap.true_wound.image, "true_wound_2251");
});

test("group photo reinspection is a single OR-gated choice", () => {
  const choices = sceneMap.murder_investigation.choices?.filter((choice) => choice.label === "集合写真再検証") ?? [];
  assert.equal(choices.length, 1);
  assert.equal(meets({ ...initialState, endings: ["END02"] }, choices[0].conditions), true);
  assert.equal(meets({ ...initialState, endings: ["END13"] }, choices[0].conditions), true);
  assert.equal(meets({ ...initialState, endings: [] }, choices[0].conditions), false);
});

test("the escape choice explains why the group must leave on foot", () => {
  assert.equal(sceneMap.escape_car.text.includes("エンジンはかからない"), true);
  assert.equal(sceneMap.escape_car.text.includes("久世のSUV"), true);
  assert.equal(sceneMap.escape_car.text.includes("ドアに鍵がかかっていた"), true);
  assert.equal(sceneMap.escape_car.text.includes("管理棟に向かって呼びかけても、返事はない"), true);
  assert.deepEqual(sceneMap.escape_car.choices?.map((choice) => choice.label), ["徒歩で下山", "山荘へ戻る"]);
});

test("investigation answers report correctness per field", () => {
  assert.deepEqual(validateInvestigationFields(["7", "いいえ", "相沢直樹"]), [true, false, true]);
  assert.deepEqual(validateFinalFields(["相沢直樹", "6時間", "久世隆一", "不明"]), [true, false, true, false]);
});

test("the bridge scene contains only Yuma and Naoki and explains Yuma leaving alone", () => {
  assert.equal(sceneMap.true_bridge.text.includes("仲間"), false);
  assert.equal(sceneMap.true_bridge.text.includes("車"), false);
  assert.equal(sceneMap.true_present.text.includes("周りには誰もいなかった"), true);
  assert.equal(sceneMap.true_present.text.includes("一人で橋を離れた"), true);
});

test("the opening introduces the tunnel shrine before arrival dialogue", () => {
  assert.equal(sceneMap.arrival_time.nextScene, "opening_rumor");
  assert.equal(sceneMap.opening_rumor.nextScene, "arrival_friends");
  assert.equal(sceneMap.opening_rumor.text.includes("廃トンネル"), true);
  assert.equal(sceneMap.opening_rumor.text.includes("祠"), true);
  assert.equal(sceneMap.opening_rumor.text.includes("山から帰れない"), true);
});

test("story conversation and parking scenes use images matching their content", () => {
  assert.equal(sceneMap.opening_rumor.image, "pretrip_rumor");
  assert.notEqual(sceneMap.opening_rumor.image, "tunnel_shrine_2202");

  const parkingChoice = sceneMap.explore_intro.choices?.find((choice) => choice.label === "駐車場");
  assert.equal(parkingChoice?.nextScene, "explore_parking");
  assert.deepEqual(parkingChoice?.unlockEvidence, ["kuse_car_seen"]);
  assert.equal(sceneMap.explore_parking.image, "suv");
  assert.equal(sceneMap.explore_parking.nextScene, "photo_setup");
  assert.equal(sceneMap.forest_light.image, "forest_light_2227");
  assert.notEqual(sceneMap.forest_light.image, "crime_2231");
});

test("shared tunnel dialogue does not assume the optional Kuse warning was heard", () => {
  assert.equal(sceneMap.test_proposal.text.includes("久世さん、行くなって言ってた"), false);
  assert.equal(sceneMap.wound_appears.text.includes("管理人も言ってた"), false);
});

test("the defer choice explains the later decision to follow Morikawa", () => {
  const choice = sceneMap.test_proposal.choices?.find((item) => item.label === "まだ決めない");
  assert.equal(choice?.nextScene, "decision_later");
  assert.equal(sceneMap.decision_later.nextScene, "night_road");
  assert.equal(sceneMap.decision_later.text.includes("結局、俺たちも後を追う"), true);
});

test("END01 reflects opening the door and uses the following morning", () => {
  assert.equal(sceneMap.end01.text.includes("扉を開ける"), true);
  assert.equal(sceneMap.end01.text.includes("外には誰もいない"), true);
  assert.equal(sceneMap.end01.text.includes("8月15日、午前8時14分"), true);
  assert.equal(sceneMap.end01.text.includes("8月14日、午前8時14分"), false);
});

test("normal-route images do not visually disclose the seventh participant", () => {
  assert.equal(sceneMap.night_road.image, "night_road_2136");
  assert.equal(sceneMap.tunnel.image, "tunnel_shrine_six_2202");
  assert.equal(sceneMap.shrine.image, "tunnel_shrine_six_2202");
  assert.equal(sceneMap.shrine_touch.image, "tunnel_shrine_six_2202");
  assert.equal(sceneMap.true_light.image, "tunnel_shrine_2202");
  assert.notEqual(assetSlots.group_1718.src, assetSlots.group_1718_hq.src);
});

test("reviewed ending continuity issues remain fixed", () => {
  assert.equal(sceneMap.end02.text.includes("森川。"), true);
  assert.deepEqual(sceneMap.roomd_night.choices?.slice(0, 2).map((choice) => choice.nextScene), ["end02_roomd", "end02_roomd"]);
  assert.equal(sceneMap.end02_roomd.text.includes("廊下を歩く足音"), false);
  assert.equal(sceneMap.end04.text.includes("さっき、なかった"), false);
  assert.equal(sceneMap.end04.image, "suv_night");
  assert.equal(sceneMap.end06.text.includes("急いで山荘へ戻った"), true);
  assert.deepEqual(sceneMap.end07.unlockEvidence, ["end07_cloud_record"]);
  assert.equal(sceneMap.end08.text.includes("管理人を頼るしかなかった"), true);
  assert.equal(sceneMap.end08.image, "suv_night");
  assert.equal(sceneMap.end11.text.includes("【佐久間】"), false);
  assert.equal(sceneMap.body_found.time, "23:48");
  assert.equal(sceneMap.murder_investigation.text.includes("3か所"), false);
});

test("final investigation evidence is available before answering", () => {
  assert.deepEqual(sceneMap.true_photo23.unlockEvidence, ["vehicle_1723_record"]);
  assert.deepEqual(sceneMap.true_detected.unlockEvidence, ["vehicle_2235_record"]);
  assert.deepEqual(sceneMap.final_gate.unlockEvidence, ["kuse_vehicle_match", "final_audio"]);
  for (const id of ["vehicle_1723_record", "vehicle_2235_record", "kuse_vehicle_match", "final_audio"]) {
    assert.ok(evidence.some((item) => item.id === id), id);
  }
  assert.equal(sceneMap.final_gate.text.includes("音声照合：久世隆一"), true);
});

test("TRUE END asks only to end August 14", () => {
  assert.equal(sceneMap.evidence_package.nextScene, "finish_prompt");
  assert.equal(sceneMap.finish_prompt.text, "8月14日を終了しますか？");
  assert.equal(sceneMap.finish_prompt_old, undefined);
});

test("the lodge return after the shrine uses the dedicated night image", () => {
  assert.equal(sceneMap.shrine_touch.nextScene, "lodge_knock");
  assert.equal(sceneMap.lodge_knock.time, "23:10");
  assert.equal(sceneMap.lodge_knock.image, "lodge_return_night_2310");
});

test("Naoki is hidden from character introductions until END15", () => {
  assert.equal(visibleCharacterProfiles(false).some((profile) => profile.name === "相沢 直樹"), false);
  assert.equal(visibleCharacterProfiles(true).some((profile) => profile.name === "相沢 直樹"), true);
});

test("all scene transitions reference existing scenes", () => {
  for (const scene of scenes) {
    if (scene.nextScene) assert.ok(sceneMap[scene.nextScene], `${scene.id} -> ${scene.nextScene}`);
    for (const choice of scene.choices ?? []) assert.ok(sceneMap[choice.nextScene], `${scene.id} -> ${choice.nextScene}`);
  }
});

test("consecutive dialogue from the same speaker shares one name label", () => {
  assert.equal((sceneMap.arrival_kuse.text.match(/【久世】/g) ?? []).length, 1);
  assert.equal((sceneMap.true_present.text.match(/【悠真】/g) ?? []).length, 1);
});

test("Sakuma is searched for before he is found", () => {
  const text = sceneMap.body_found.text;
  const missing = text.indexOf("佐久間の姿が見えなくなっていた");
  const search = text.indexOf("山荘内を探し");
  const found = text.indexOf("……死んでる");
  assert.ok(missing >= 0 && search > missing && found > search);
  assert.equal(text.slice(0, search).includes("佐久間を見つけた"), false);
});

test("reviewed dialogue assigns the intended speaker to every line", () => {
  assert.match(sceneMap.bbq.text, /【佐久間】\n「乾杯！」\n\n【全員】\n「乾杯！」/);
  assert.match(sceneMap.forest_light.text, /【悠真】\n「あれ……」\n\n【美咲】\n「何？」\n\n【悠真】\n「向こう」/);
  assert.match(sceneMap.chase.text, /【UNKNOWN】\n写真を返してくれ/);
  assert.match(sceneMap.reply_unknown.text, /【悠真・入力】\nあなたは誰ですか/);
  assert.equal((sceneMap.unknown_phone.text.match(/【UNKNOWN】/g) ?? []).length, 3);
});

test("every ending unlocks at least one archive record", () => {
  for (let n = 1; n <= 16; n++) {
    const id = `END${String(n).padStart(2, "0")}`;
    const endingScenes = scenes.filter((scene) => scene.ending === id);
    assert.ok(endingScenes.some((scene) => (scene.unlockEvidence?.length ?? 0) > 0), id);
    for (const evidenceId of endingScenes.flatMap((scene) => scene.unlockEvidence ?? [])) {
      assert.ok(evidence.some((item) => item.id === evidenceId), `${id}: ${evidenceId}`);
    }
  }
});

test("the final gate button describes its actual destination", () => {
  assert.match(appSource, /state\.currentScene === "final_gate"[\s\S]*最終捜査へ/);
  assert.doesNotMatch(appSource, /未確認ファイルを見る/);
});

test("SIM3 clear registration is exposed only for TRUE END", () => {
  const clearUrl = "https://sim3.net/portal/clear/#90a3b7430bd14082b7d3ddaefb6702df";
  assert.equal(appSource.split(clearUrl).length - 1, 1);
  assert.match(appSource, /const SIM3_CLEAR_URL = "https:\/\/sim3\.net\/portal\/clear\/#90a3b7430bd14082b7d3ddaefb6702df"/);
  assert.match(appSource, /scene\.ending === "END16" && <section className="journey-record"/);
  assert.match(appSource, /<h2 id="journey-record-title">旅の記録<\/h2>/);
  assert.match(appSource, /この夏の出来事を、<br \/>記録として残しますか。/);
  assert.match(appSource, /<a href=\{SIM3_CLEAR_URL\} target="_blank" rel="noopener noreferrer">この旅の記録を残す<\/a>/);
  assert.match(appSource, /<button className="primary" onClick=\{\(\) => setScreen\("title"\)\}>TITLE<\/button>/);
});
