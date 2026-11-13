// OrQueue: estimate the OR timeline of one day and how much room is left.
// Pure functions, no Memento API, so the same code runs in the mini app,
// in the mockup and in node tests (test/orqueue.test.js).
//
// Rules (kim, 2026-11-13):
//  - OR days: every Monday, plus days with a Holidays entry of calendar "Kim"
//    titled "OR นอกเวลา" (Saturdays). There is never OR นอกเวลา on a Monday.
//  - Start 08:30.
//  - LA (OPD) cases go first while the first GA patient is prepared (2-3 cases),
//    and between GA cases (about 2 cases) instead of waiting for the GA turnover.
//    OPD LA is never the last case. Admitted LA may be done after the last GA.
//  - GA cases: shortest first (not by Que), so the long one is last.
//  - Turnover: GA -> GA 45 min on Monday, 20 min OR นอกเวลา (2 rooms alternate).
//    LA -> LA and LA <-> GA 15 min (different room, op note).
//  - Monday: a new GA can be added when the current last GA ends by 14:30
//    (the second-to-last case must finish by 14:30; the last may run late).
//  - OR นอกเวลา: the last case must START before 16:00.
//  - Missing OpLength: assume GA 60 min, LA 15 min.

var orq = {
  START: 8 * 60 + 30,
  MON_CUT: 14 * 60 + 30,
  OH_LAST_START: 16 * 60,
  GA_TURN: { MON: 45, OH: 20 },
  SWITCH: 15,
  DEFAULT_LEN: { GA: 60, LA: 15 },
  LA_FIRST_MAX: 3,   // LA before the first GA
  LA_GAP_MAX: 2,     // LA between two GA
  GREEN_MIN: 60,     // minutes left for "free" (green); less = "tight" (yellow)

  // Kind of day from the Holidays entries of that date.
  // hols: [{ title, calendar, holiday:Boolean, outOfDuty:Boolean }]
  // returns null (not an OR day), {kind:"closed", why}, or {kind:"op", mode:"MON"|"OH"}
  dayKind: function (date, hols) {
    hols = hols || [];
    var off = hols.filter(function (h) { return h.outOfDuty; });
    if (off.length) return { kind: "closed", why: off[0].title || "ไม่อยู่" };
    var oh = hols.some(function (h) {
      return h.calendar == "Kim" && /or\s*นอกเวลา/i.test(h.title || "");
    });
    if (oh) return { kind: "op", mode: "OH" };
    if (date.getDay() !== 1) return null;
    var hol = hols.filter(function (h) { return h.holiday; });
    if (hol.length) return { kind: "closed", why: hol[0].title || "วันหยุด" };
    return { kind: "op", mode: "MON" };
  },

  // cases: [{ type:"GA"|"LA", que:Number, minutes:Number|null, visit:"OPD"|"Admit", ...anything }]
  // returns rows (in time order) with s/e = start/end in minutes from midnight.
  simulate: function (mode, cases) {
    var self = this;
    var norm = function (c) {
      var m = Number(c.minutes);
      var guess = !(m > 0);
      return Object.assign({}, c, { guess: guess, len: guess ? self.DEFAULT_LEN[c.type] : Math.round(m) });
    };
    var byQue = function (a, b) { return (Number(a.que) || 99) - (Number(b.que) || 99); };
    var ga = cases.filter(function (c) { return c.type == "GA"; }).map(norm)
      .sort(function (a, b) { return a.len - b.len || byQue(a, b); });
    var la = cases.filter(function (c) { return c.type != "GA"; }).map(norm).sort(byQue);
    var opd = la.filter(function (c) { return c.visit != "Admit"; });
    var adm = la.filter(function (c) { return c.visit == "Admit"; });

    var rows = [];
    var t = this.START;
    var push = function (c, s, where) {
      rows.push(Object.assign({}, c, { s: s, e: s + c.len, where: where }));
      t = s + c.len;
    };

    if (ga.length == 0) {           // LA only day
      opd.concat(adm).forEach(function (c, i) { push(c, i ? t + self.SWITCH : t, ""); });
      return { rows: rows, gaEnds: [], end: rows.length ? t : null };
    }

    // slots[0] = before the first GA, slots[i] = between GA i-1 and GA i
    var slots = [];
    for (var i = 0; i < ga.length; i++) slots.push([]);
    var cap = function (i) { return i == 0 ? self.LA_FIRST_MAX : self.LA_GAP_MAX; };
    var fill = function (list) {
      var rest = [];
      list.forEach(function (c) {
        for (var i = 0; i < slots.length; i++) {
          if (slots[i].length < cap(i)) { slots[i].push(c); return; }
        }
        rest.push(c);
      });
      return rest;
    };
    var opdRest = fill(opd);
    // OPD LA must not be last: overflow goes into the last slot (before the last GA)
    opdRest.forEach(function (c) { slots[slots.length - 1].push(c); });
    var admRest = fill(adm);

    var gaEnds = [];
    ga.forEach(function (g, i) {
      var start;
      if (i == 0) {
        slots[0].forEach(function (c, j) { push(c, j ? t + self.SWITCH : self.START, "ก่อน GA เคสแรก"); });
        start = slots[0].length ? t + self.SWITCH : self.START;
      } else {
        var ready = t + self.GA_TURN[mode];
        slots[i].forEach(function (c) { push(c, t + self.SWITCH, "ระหว่างรอ GA"); });
        start = slots[i].length ? Math.max(ready, t + self.SWITCH) : ready;
      }
      push(g, start, "");
      gaEnds.push(t);
    });
    admRest.forEach(function (c) { push(c, t + self.SWITCH, "หลัง GA เสร็จ"); });
    return { rows: rows, gaEnds: gaEnds, end: t };
  },

  // Room left on a day. status: "free" | "tight" | "full"
  //  MON: left = 14:30 - end of the last GA (LA can always be added)
  //  OH : left = 16:00 - time a new GA could start
  dayStatus: function (mode, cases) {
    var sim = this.simulate(mode, cases);
    var left, nextStart;
    if (mode == "MON") {
      var lastGa = sim.gaEnds.length ? sim.gaEnds[sim.gaEnds.length - 1] : this.START;
      left = this.MON_CUT - lastGa;
      nextStart = sim.gaEnds.length ? lastGa + this.GA_TURN.MON : (sim.end != null ? sim.end + this.SWITCH : this.START);
    } else {
      nextStart = sim.end == null ? this.START : sim.end + this.GA_TURN.OH;
      left = this.OH_LAST_START - nextStart;
    }
    var status = left < 0 ? "full" : (left >= this.GREEN_MIN ? "free" : "tight");
    return Object.assign(sim, { mode: mode, left: Math.max(left, 0), status: status, nextStart: nextStart });
  },

  hm: function (m) {
    return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2);
  }
};

if (typeof module !== "undefined") module.exports = orq;
