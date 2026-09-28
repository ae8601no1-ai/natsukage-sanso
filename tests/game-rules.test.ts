import test from "node:test";
import assert from "node:assert/strict";
import { validateFinal, validateFinalFields, validateInvestigation, validateInvestigationFields } from "../lib/game/answers.ts";
import { endingTitles, sceneMap, scenes } from "../lib/game/scenes.ts";
import { canUnlockEnd15, initialState, meets } from "../lib/game/state.ts";
import { visibleCharacterProfiles } from "../lib/game/characters.ts";

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

test("END03 uses the 22:53 record and the real wound occurs at 22:51", () => {
  assert.equal(sceneMap.end03.text.includes("20:11"), false);
  assert.equal(sceneMap.end03.text.includes("22:53"), true);
  assert.equal(sceneMap.end03.image, "wound_record_2253");
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
  assert.equal(sceneMap.escape_car.text.includes("もう一台も確認する"), true);
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
