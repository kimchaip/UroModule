// node MiniApp/OrQueue/test/orqueue.test.js
const assert = require("assert");
const orq = require("../orqueue-logic.js");
const C = (type, que, minutes, visit) => ({ type, que, minutes, visit: visit || (type == "GA" ? "Admit" : "OPD") });
const at = (h, m) => h * 60 + m;
let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok -", name); };

t("dayKind: Monday, OR นอกเวลา, closed", () => {
  const mon = new Date(2026, 10, 16), sat = new Date(2026, 10, 21), tue = new Date(2026, 10, 17);
  assert.deepStrictEqual(orq.dayKind(mon, []), { kind: "op", mode: "MON" });
  assert.strictEqual(orq.dayKind(tue, []), null);
  assert.deepStrictEqual(orq.dayKind(sat, [{ calendar: "Kim", title: "ORนอกเวลา" }]), { kind: "op", mode: "OH" });
  assert.deepStrictEqual(orq.dayKind(sat, [{ calendar: "Kim", title: "OR นอกเวลา" }]), { kind: "op", mode: "OH" });
  assert.strictEqual(orq.dayKind(sat, [{ calendar: "Other", title: "OR นอกเวลา" }]), null);
  assert.strictEqual(orq.dayKind(mon, [{ calendar: "Holidays", title: "วันหยุดชดเชย", holiday: true }]).kind, "closed");
  assert.strictEqual(orq.dayKind(mon, [{ calendar: "Kim", title: "ประชุม", outOfDuty: true }]).kind, "closed");
});

t("GA shortest first, GA->GA 45 min on Monday", () => {
  const r = orq.simulate("MON", [C("GA", 1, 90), C("GA", 2, 30)]);
  assert.deepStrictEqual(r.rows.map(x => [x.que, x.s, x.e]), [[2, at(8, 30), at(9, 0)], [1, at(9, 45), at(11, 15)]]);
});

t("kim's example: GA -15- LA -15- LA -15- GA", () => {
  // 3 OPD LA: first slot takes up to 3, so use 5 LA -> 3 before GA1, 2 between
  const r = orq.simulate("MON", [C("GA", 1, 60), C("GA", 2, 60), C("LA", 1, 10), C("LA", 2, 10), C("LA", 3, 10), C("LA", 4, 10), C("LA", 5, 10)]);
  const s = r.rows.map(x => x.type + x.que + "@" + orq.hm(x.s));
  assert.deepStrictEqual(s, ["LA1@08:30", "LA2@08:55", "LA3@09:20", "GA1@09:45", "LA4@11:00", "LA5@11:25", "GA2@11:50"]);
});

t("OPD LA is never last; admitted LA may be", () => {
  const r = orq.simulate("MON", [C("GA", 1, 60), C("LA", 1, 10), C("LA", 2, 10), C("LA", 3, 10), C("LA", 4, 10), C("LA", 5, 10, "Admit")]);
  const last = r.rows[r.rows.length - 1];
  assert.strictEqual(last.que, 5); assert.strictEqual(last.visit, "Admit");
  const ga = r.rows.findIndex(x => x.type == "GA");
  assert.strictEqual(ga, 4); // 4 OPD LA before the only GA
});

t("OR นอกเวลา GA->GA 20 min, last must start before 16:00", () => {
  const st = orq.dayStatus("OH", [C("GA", 1, 120), C("GA", 2, 120), C("GA", 3, 120)]);
  // 08:30-10:30, 10:50-12:50, 13:10-15:10 -> next GA 15:30 -> 30 min left
  assert.strictEqual(st.end, at(15, 10)); assert.strictEqual(st.nextStart, at(15, 30));
  assert.strictEqual(st.left, 30); assert.strictEqual(st.status, "tight");
  assert.strictEqual(orq.dayStatus("OH", [C("GA", 1, 450)]).status, "full");
});

t("Monday status from last GA vs 14:30", () => {
  assert.strictEqual(orq.dayStatus("MON", []).status, "free");
  assert.strictEqual(orq.dayStatus("MON", []).left, 360);
  const ok = orq.dayStatus("MON", [C("GA", 1, 60), C("GA", 2, 200)]); // 08:30-09:30, 10:15-13:35
  assert.strictEqual(ok.left, 55); assert.strictEqual(ok.status, "tight");
  const full = orq.dayStatus("MON", [C("GA", 1, 60), C("GA", 2, 300)]);
  assert.strictEqual(full.status, "full");
});

t("missing OpLength uses GA 60 / LA 15 and is flagged", () => {
  const r = orq.simulate("MON", [C("GA", 1, null), C("LA", 1, 0)]);
  assert.deepStrictEqual(r.rows.map(x => [x.len, x.guess]), [[15, true], [60, true]]);
});

console.log(n + " tests passed");
