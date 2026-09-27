import test from "node:test";
import assert from "node:assert/strict";
import { validateFinal, validateInvestigation } from "../lib/game/answers.ts";
import { endingTitles, sceneMap, scenes } from "../lib/game/scenes.ts";
import { canUnlockEnd15, initialState } from "../lib/game/state.ts";

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
