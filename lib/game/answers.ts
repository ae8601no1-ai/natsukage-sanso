const normalize = (value: string) => value.trim().replace(/[\s　]/g, "").toLowerCase();
const naokiAnswers = new Set(["相沢直樹", "あいざわなおき", "アイザワナオキ"]);
const kuseAnswers = new Set(["久世隆一", "くぜりゅういち", "クゼリュウイチ"]);

export function validateInvestigation(values: string[]) {
  return validateInvestigationFields(values).every(Boolean);
}

export function validateFinal(values: string[]) {
  return validateFinalFields(values).every(Boolean);
}

export function validateInvestigationFields(values: string[]) {
  return [
    normalize(values[0] ?? "") === "7",
    ["はい", "yes", "イエス"].includes(normalize(values[1] ?? "")),
    naokiAnswers.has(normalize(values[2] ?? "")),
  ];
}

export function validateFinalFields(values: string[]) {
  return [
    naokiAnswers.has(normalize(values[0] ?? "")),
    ["6時間16分", "６時間１６分"].includes(normalize(values[1] ?? "")),
    kuseAnswers.has(normalize(values[2] ?? "")),
    kuseAnswers.has(normalize(values[3] ?? "")),
  ];
}
