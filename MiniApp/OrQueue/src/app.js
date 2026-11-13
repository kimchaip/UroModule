// ===================== DATA =====================
// loadMemento(from, to) returns a Promise of { cases: [...], hols: [...] } for dates from..to.
//   cases: one per UroBase entry
//     { date: Date, type: ORType ("GA"|"LA"), que: Que, minutes: OpLength in minutes (null if empty),
//       visit: VisitType ("OPD"|"Admit"), status: Status, dr: Dr, name: Patient link title, op: Op, dx: Dx }
//   hols: one per Holidays entry
//     { date: Date, title: Title, calendar: Calendar, holiday: Holiday (bool), outOfDuty: OutOfDuty (bool) }
// UroBase OpLength is a duration in milliseconds -> divide by 60000.
// This is the ONLY function that talks to Memento. Read only, never write.
async function loadMemento(from, to) {
  throw new Error("NOT_CONNECTED");
}

var DR = "ชัยพร";          // only kim's cases (empty Dr is counted too)
var MONTHS_AHEAD = 3;

function keepCase(c) {
  return c.status != "Not" && (!c.dr || String(c.dr).indexOf(DR) > -1) && (c.type == "GA" || c.type == "LA");
}

// Demo data (fake patients) used when Memento is not connected, e.g. in the mockup.
function demoData(today) {
  var d = function (n) { var x = new Date(today); x.setDate(x.getDate() + n); return x; };
  var firstMon = (8 - today.getDay()) % 7 || 7;
  var mon = function (w) { return d(firstMon + 7 * w); };
  var sat = function (w) { return d(firstMon + 7 * w + 5); };
  var C = function (date, type, que, op, minutes, visit, name) {
    return { date: date, type: type, que: que, op: op, minutes: minutes, visit: visit, name: "ผู้ป่วยทดสอบ " + name, status: "Plan", dr: DR };
  };
  var cases = [
    C(mon(0), "LA", 1, "Cystoscopy + DJ removal", 10, "OPD", "ก"), C(mon(0), "LA", 2, "Circumcision", 25, "OPD", "ข"),
    C(mon(0), "LA", 3, "TRUS biopsy", 20, "OPD", "ค"), C(mon(0), "LA", 4, "Cystoscopy", 10, "OPD", "ง"),
    C(mon(0), "GA", 1, "TURBT", 50, "Admit", "จ"), C(mon(0), "GA", 2, "URS + laser lithotripsy", 70, "Admit", "ฉ"),
    C(mon(0), "GA", 3, "PCNL", 150, "Admit", "ช"),
    C(sat(0), "GA", 1, "URS + laser lithotripsy", 65, "Admit", "ซ"), C(sat(0), "GA", 2, "TURP", 75, "Admit", "ฌ"),
    C(sat(0), "GA", 3, "TURBT", 45, "Admit", "ญ"), C(sat(0), "GA", 4, "DJ insertion", null, "Admit", "ฎ"),
    C(mon(1), "LA", 1, "Vasectomy", 30, "OPD", "ฏ"), C(mon(1), "GA", 1, "Radical nephrectomy (lap)", 180, "Admit", "ฐ"),
    C(mon(1), "GA", 2, "URS", 60, "Admit", "ฑ"),
    C(mon(2), "GA", 1, "TURBT", 50, "Admit", "ฒ"),
    C(sat(4), "GA", 1, "PCNL", 140, "Admit", "ณ"), C(sat(4), "GA", 2, "URS + laser lithotripsy", 70, "Admit", "ด"),
    C(sat(4), "GA", 3, "TURP", 80, "Admit", "ต"), C(sat(4), "GA", 4, "TURBT", 50, "Admit", "ถ"),
    C(sat(4), "GA", 5, "URS", 60, "Admit", "ท"),
    C(mon(5), "LA", 1, "TRUS biopsy", 15, "OPD", "ธ"), C(mon(5), "GA", 1, "TURP", 80, "Admit", "น"),
    C(mon(5), "GA", 2, "URS", 60, "Admit", "บ"), C(mon(5), "LA", 2, "Circumcision", 25, "Admit", "ป")
  ];
  var H = function (date, title, calendar, holiday, outOfDuty) {
    return { date: date, title: title, calendar: calendar, holiday: !!holiday, outOfDuty: !!outOfDuty };
  };
  var hols = [
    H(sat(0), "OR นอกเวลา", "Kim"), H(sat(2), "OR นอกเวลา", "Kim"), H(sat(4), "OR นอกเวลา", "Kim"),
    H(sat(7), "OR นอกเวลา", "Kim"), H(sat(10), "OR นอกเวลา", "Kim"),
    H(mon(3), "วันหยุดชดเชย", "Holidays", true, false), H(mon(8), "ไม่อยู่ (ประชุม)", "Kim", false, true)
  ];
  return { cases: cases, hols: hols };
}

// ===================== VIEW =====================
var TH_M = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
var TH_D = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
var TH_DL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
var key = function (d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
var hm = function (m) { return orq.hm(m); };
var dur = function (m) { return m >= 60 ? Math.floor(m / 60) + " ชม." + (m % 60 ? " " + m % 60 + " น." : "") : m + " น."; };
var short = function (m) { return m >= 60 ? (m / 60).toFixed(m % 60 ? 1 : 0) + "ชม" : m + "น"; };
var thDate = function (d) { return "วัน" + TH_DL[d.getDay()] + "ที่ " + d.getDate() + " " + TH_M[d.getMonth()].slice(0, 3) + "."; };
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var $ = function (id) { return document.getElementById(id); };

var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
var END = new Date(TODAY); END.setMonth(END.getMonth() + MONTHS_AHEAD);
var CASES = {}, HOLS = {}, mOff = 0, sel = null;

function index(data) {
  CASES = {}; HOLS = {};
  data.cases.filter(keepCase).forEach(function (c) {
    var k = key(new Date(c.date)); (CASES[k] = CASES[k] || []).push(c);
  });
  data.hols.forEach(function (h) { var k = key(new Date(h.date)); (HOLS[k] = HOLS[k] || []).push(h); });
}

function dayInfo(d) {
  var k = key(d), kind = orq.dayKind(d, HOLS[k]), cases = CASES[k] || [];
  if (!kind) return cases.length ? { kind: "extra", cases: cases } : null;
  if (kind.kind == "closed") return Object.assign(kind, { cases: cases });
  return Object.assign({ kind: "op" }, orq.dayStatus(kind.mode, cases));
}

var lim = function (i) { return i.mode == "MON" ? "ก่อน 14:30 (GA)" : "ก่อน 16:00"; };

function renderNext() {
  var out = [];
  for (var d = new Date(TODAY); d <= END && out.length < 2; d.setDate(d.getDate() + 1)) {
    if (d <= TODAY) continue;
    var i = dayInfo(d);
    if (i && i.kind == "op" && i.status != "full") out.push([new Date(d), i]);
  }
  $("next").innerHTML = '<span class="lbl">วันที่ยังแทรกได้ใกล้สุด</span>' + (out.length ? out.map(function (x) {
    return "<div><b>" + thDate(x[0]) + "</b> " + (x[1].mode == "OH" ? "(OR นอกเวลา) " : "") + "· เหลือ " + dur(x[1].left) + " " + lim(x[1]) + "</div>";
  }).join("") : "<div>ไม่มีวันว่างใน " + MONTHS_AHEAD + " เดือน</div>");
}

function renderMonth() {
  var base = new Date(TODAY.getFullYear(), TODAY.getMonth() + mOff, 1);
  $("mtitle").textContent = TH_M[base.getMonth()] + " " + (base.getFullYear() + 543);
  $("prev").disabled = mOff == 0; $("nextm").disabled = mOff == MONTHS_AHEAD;
  var g = $("grid");
  g.innerHTML = TH_D.map(function (x) { return '<div class="dow">' + x + "</div>"; }).join("");
  for (var i = 0; i < base.getDay(); i++) g.insertAdjacentHTML("beforeend", "<div></div>");
  var n = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  for (var day = 1; day <= n; day++) (function (d) {
    var info = dayInfo(d), el = document.createElement("button");
    el.className = "cell"; el.type = "button"; el.innerHTML = '<span class="d">' + d.getDate() + "</span>";
    if (info) {
      var cls = info.kind == "op" ? info.status : info.kind == "closed" ? "closed" : "full";
      el.classList.add("op", cls);
      if (d < TODAY) el.classList.add("past");
      if (info.kind == "closed") el.innerHTML += '<span class="s">ปิด</span>' + (info.cases.length ? '<span class="tag">มีเคส!</span>' : "");
      else if (info.kind == "extra") el.innerHTML += '<span class="s">' + info.cases.length + ' เคส</span><span class="tag">นอกวัน OR</span>';
      else {
        el.innerHTML += '<span class="s">' + info.rows.length + ' เคส</span><span class="s">' + (info.status == "full" ? "เต็ม" : "+" + short(info.left)) + "</span>";
        if (info.mode == "OH") el.innerHTML += '<span class="tag">นอกเวลา</span>';
      }
      el.onclick = function () { sel = key(d); renderMonth(); renderDay(d); };
      if (sel == key(d)) el.classList.add("sel");
    } else el.disabled = true;
    g.appendChild(el);
  })(new Date(base.getFullYear(), base.getMonth(), day));
}

function caseRow(r) {
  return '<div class="case"><div class="t">' + (r.s != null ? hm(r.s) + "<br>" + hm(r.e) : "") + '</div><div><div class="n"><span class="type ' + r.type + '">' + r.type + " " + esc(("0" + (r.que || "")).slice(-2)) + "</span>" + esc(r.name) +
    '</div><div class="o">' + esc(r.op) + (r.guess ? "" : r.len ? " · " + dur(r.len) : "") + (r.visit ? " · " + esc(r.visit) : "") + (r.where ? " · " + r.where : "") + "</div>" +
    (r.guess ? '<div class="warn">ไม่มีเวลาผ่าตัดในข้อมูล ใช้ค่าประมาณ ' + orq.DEFAULT_LEN[r.type] + " น.</div>" : "") + "</div></div>";
}

function renderDay(d) {
  var i = dayInfo(d), box = $("day");
  if (i.kind != "op") {
    box.innerHTML = "<h2>" + thDate(d) + "</h2>" + (i.kind == "closed"
      ? '<span class="pill closed">ปิด</span><div class="sum">' + esc(i.why) + " (จาก Holidays)</div>"
      : '<span class="pill full">ไม่ใช่วัน OR</span>') + (i.cases.length ? '<div class="warn">มีเคสลงไว้วันนี้ ' + i.cases.length + " เคส</div>" + i.cases.map(caseRow).join("") : "");
    return;
  }
  var label = i.mode == "MON" ? { free: "แทรก GA ได้", tight: "แทรก GA ได้อีก 1 เคส", full: "GA เต็ม" }[i.status] : { free: "ว่าง", tight: "เหลือน้อย", full: "เต็ม" }[i.status];
  var h = "<h2>" + thDate(d) + '</h2><div><span class="pill ' + i.status + '">' + label + '</span> <span class="sum">' + (i.mode == "OH" ? "OR นอกเวลา · GA→GA 20 น." : "OR วันจันทร์ · GA→GA 45 น.") + " · สลับห้อง/LA 15 น.</span></div>";
  h += '<div class="sum">' + i.rows.length + " เคส" + (i.end != null ? " · คาดว่าเสร็จทั้งหมด " + hm(i.end) : "") + "</div>";
  var prevE = null, cut = false;
  i.rows.forEach(function (r) {
    if (i.mode == "MON" && !cut && r.type == "GA" && r.s > orq.MON_CUT) { h += '<div class="cut">14:30 · GA ที่เริ่มหลังจากนี้ต้องเป็นเคสสุดท้าย</div>'; cut = true; }
    if (prevE != null && r.s > prevE) h += '<div class="gap">' + (r.type == "GA" && r.s - prevE > orq.SWITCH ? "รอเปลี่ยนคนไข้/ดมยา" : "สลับห้อง/เตรียม") + " " + (r.s - prevE) + " น.</div>";
    h += caseRow(r); prevE = r.e;
  });
  if (i.status != "full") {
    h += i.mode == "MON"
      ? '<div class="slot ' + (i.status == "tight" ? "t" : "") + '">แทรก GA ได้ · เหลือ ' + dur(i.left) + ' ก่อน 14:30<br><span style="font-weight:400;font-size:13px">GA ใหม่ที่ยาวที่สุดของวันจะอยู่ท้ายสุด จึงยาวเท่าไรก็ได้ · LA OPD แทรกได้เสมอ</span></div>'
      : '<div class="slot ' + (i.status == "tight" ? "t" : "") + '">GA ใหม่เริ่มได้ราว ' + hm(i.nextStart) + " · เหลือ " + dur(i.left) + ' ก่อน 16:00<br><span style="font-weight:400;font-size:13px">เคสสุดท้ายต้องเริ่มก่อน 16:00</span></div>';
  } else h += '<div class="sum" style="color:var(--full)">' + (i.mode == "MON" ? "GA เคสสุดท้ายตอนนี้เสร็จหลัง 14:30 แล้ว ไม่ควรเพิ่ม GA (LA ยังแทรกได้)" : "เคสใหม่จะเริ่มหลัง 16:00 แล้ว") + "</div>";
  box.innerHTML = h;
}

function show(data, demo) {
  index(data);
  $("demo").hidden = !demo;
  renderNext();
  var first = null;
  for (var d = new Date(TODAY); d <= END && !first; d.setDate(d.getDate() + 1)) { var i = dayInfo(d); if (i && i.kind == "op") first = new Date(d); }
  if (first) { sel = key(first); mOff = (first.getFullYear() - TODAY.getFullYear()) * 12 + first.getMonth() - TODAY.getMonth(); }
  renderMonth();
  if (first) renderDay(first);
}

$("prev").onclick = function () { mOff--; renderMonth(); };
$("nextm").onclick = function () { mOff++; renderMonth(); };

var from = new Date(TODAY); from.setDate(1);
loadMemento(from, END).then(function (data) { show(data, false); }).catch(function (err) {
  if (String(err && err.message) != "NOT_CONNECTED") $("err").textContent = "อ่านข้อมูลจาก Memento ไม่ได้: " + (err && err.message || err);
  show(demoData(TODAY), true);
});
