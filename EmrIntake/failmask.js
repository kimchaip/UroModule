/*
failmask.js : บันทึกเคสที่ emrextract.js / outcomeextract.js อ่านไม่สำเร็จ โดยปิดข้อมูลระบุตัวคนไข้ก่อน
ใช้ใน Tasker action JavaScript ถัดจาก action ที่รัน emrextract.js หรือ outcomeextract.js
ตัวแปร Tasker ที่ใช้:
  %txt    ข้อความเดิม
  %fsrc   emr | outcome | wrong   (wrong = ปุ่ม "อ่านผิด" อ่านได้แต่ค่าไม่ถูก)
  %fnote  หมายเหตุจากหมอ (ใช้กับปุ่มอ่านผิด ไม่ใส่ก็ได้)
  ค่าที่ script ก่อนหน้าอ่านได้: emr = %hnx %name %cdate %dxx, outcome = %hnx %namex %otype %odate %osum
ผลลัพธ์:
  %failline 1 บรรทัด JSON สำหรับเขียนต่อท้าย extractFail.json (ว่างถ้าอ่านครบ)
            {"t":..,"src":"emr","fail":["hn","date"],"got":{..},"note":"..","text":"ข้อความที่ปิดแล้ว"}
การปิดข้อมูล: เปลี่ยนเป็น X โดยคงรูปแบบไว้ เช่น นายXXXX XXXXX, HN XXX-XX-XX, XXX-XXX-XXXX
  ปิดชื่อ/HN ที่ script อ่านได้ ชื่อหลังคำนำหน้าหรือหลัง "ชื่อ"/"Patient name", ที่อยู่,
  เลขบัตรประชาชน, เบอร์โทร, HN และตัวเลขที่ติดกันตั้งแต่ 5 หลัก
*/
var failline = "";

// ตัวแปร Tasker ที่ไม่ได้ตั้งจะไม่มีใน JavaScript จึงต้องเช็ค typeof
function tv(v) { return v === undefined || v === null ? "" : String(v).trim(); }
var src = typeof fsrc == "undefined" ? "" : tv(fsrc);
var ftxt = typeof txt == "undefined" ? "" : tv(txt);
var fhn = typeof hnx == "undefined" ? "" : tv(hnx);
var fname = typeof name == "undefined" ? "" : tv(name);
var fnamex = typeof namex == "undefined" ? "" : tv(namex);
var fcdate = typeof cdate == "undefined" ? "" : tv(cdate);
var fdx = typeof dxx == "undefined" ? "" : tv(dxx);
var fotype = typeof otype == "undefined" ? "" : tv(otype);
var fodate = typeof odate == "undefined" ? "" : tv(odate);
var fosum = typeof osum == "undefined" ? "" : tv(osum);
var fn = typeof fnote == "undefined" ? "" : tv(fnote);

// ตัวอักษร/ตัวเลข -> X, สระบน-ล่างและวรรณยุกต์ไทยตัดทิ้ง, ช่องว่างและเครื่องหมายคงไว้
function shape(s) {
  return String(s).replace(/[ัิ-ฺ็-๎]/g, "").replace(/[^\s\-\/().,:]/g, "X");
}
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

var PREFIX = "แพทย์หญิง|นายแพทย์|แพทย์|อ\\.|นางสาว|นาง|นาย|น\\.ส\\.|นส\\.|ด\\.ช\\.|ดช\\.|ด\\.ญ\\.|ดญ\\.|เด็กชาย|เด็กหญิง|จสอ\\.|ร\\.ต\\.[อทต]\\.|พ\\.จ\\.อ\\.|ดต\\.|จอ\\.|รต\\.|ส\\.ท\\.|พระ|นท\\.|พภ\\.|สณ\\.|พ\\.ท\\.|สอ\\.|นพ\\.|พญ\\.|ทพ\\.|ทพญ\\.|mrs\\.|mr\\.|ms\\.|dr\\.|miss(?=\\s)";
var WORD = "[ก-๙A-Za-z][ก-๙A-Za-z.'\\-]*";
var STOPW = /^(HN|Sex|เพศ|อายุ|Age|DOB|วันเกิด|AN|เลขที่|ID)$/i;

function mask(s) {
  // 1. ชื่อ/HN ที่ script อ่านได้
  [fname, fnamex].forEach(function (v) {
    if (!v) return;
    var words = v.replace(new RegExp("^(" + PREFIX + ")\\s*", "i"), "").split(/\s+/);
    words.forEach(function (w) { if (w.length >= 2) s = s.split(w).join(shape(w)); });
  });
  if (fhn.replace(/\D/g, "").length >= 5) {
    var h = fhn.replace(/\D/g, "");
    s = s.replace(new RegExp(h.split("").join("\\s*-?\\s*"), "g"), function (x) { return shape(x); });
  }
  // 2. บรรทัดที่มีป้าย ชื่อ / Patient name / Name: ปิดถึงคำว่า HN, เพศ, อายุ ถ้าป้ายอยู่ท้ายบรรทัดปิดบรรทัดถัดไป
  var ls = s.split(/\r?\n/);
  for (var i = 0; i < ls.length; i++) {
    var m = ls[i].match(/((?:[ชซ]ื่อ\s*-?\s*(?:สกุล|นามสกุล)?|ผู้ป่วยชื่อ|pat[il1]ent\s*name|name)\s*:?)(.*)$/i);
    if (m) {
      var head = ls[i].slice(0, m.index) + m[1];
      var rest = m[2];
      if (!rest.trim() && i + 1 < ls.length) { ls[i + 1] = maskWords(ls[i + 1]); continue; }
      ls[i] = head + maskWords(rest);
    }
    // ที่อยู่: ปิดทั้งบรรทัดหลังป้าย
    var a = ls[i].match(/(ที่อยู่|บ้านเลขที่|address)\s*:?/i);
    if (a) ls[i] = ls[i].slice(0, a.index + a[0].length) + shape(ls[i].slice(a.index + a[0].length));
  }
  s = ls.join("\n");
  // 3. คำนำหน้า + ชื่อ นามสกุล (2 คำ)
  s = s.replace(new RegExp("(^|[\\s:(])(" + PREFIX + ")([ \\t]*)(" + WORD + ")([ \\t]+" + WORD + ")?", "gim"), function (x, pre, p, sp, w1, w2) {
    if (STOPW.test(w1)) return x;
    return pre + p + sp + shape(w1) + (w2 ? (STOPW.test(w2.trim()) ? w2 : shape(w2)) : "");
  });
  // 4. เลขบัตรประชาชน, เบอร์โทร, HN แบบ 999-99-99, HN ตัวเลข, ตัวเลขยาวตั้งแต่ 5 หลัก
  s = s.replace(/\b\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d\b/g, shape);
  s = s.replace(/\b0\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}\b/g, shape);
  s = s.replace(/\d{3}\s*-\s*\d{2}\s*-\s*\d{2}/g, shape);
  s = s.replace(/(HN\s*\.?\s*:?\s*)(\d+)/gi, function (x, p, d) { return p + shape(d); });
  s = s.replace(/\d{5,}/g, shape);
  return s;
}

// ปิดคำจนถึงคำว่า HN / เพศ / อายุ ฯลฯ
function maskWords(s) {
  var parts = s.split(/(\s+)/), stop = false;
  return parts.map(function (p) {
    if (stop || /^\s*$/.test(p)) return p;
    if (STOPW.test(p.replace(/[:.]$/, ""))) { stop = true; return p; }
    var pm = p.match(new RegExp("^(" + PREFIX + ")(.*)$", "i"));
    if (pm && pm[2]) return pm[1] + shape(pm[2]);
    if (pm) return p;
    return shape(p);
  }).join("");
}

var fail = [];
var got = {};
if (src == "emr") {
  if (!fhn) fail.push("hn");
  if (!fname) fail.push("name");
  if (!fcdate) fail.push("date");
  if (!fdx) fail.push("dx");
  got = { hn: shape(fhn), name: shape(fname), date: fcdate, dx: fdx };
} else if (src == "outcome") {
  if (!fhn && !fnamex) fail.push("hn/name");
  if (!fodate) fail.push("date");
  got = { hn: shape(fhn), name: shape(fnamex), type: fotype, date: fodate, sum: fosum };
} else {
  fail.push("wrong");
}
for (var g in got) if (!got[g]) delete got[g];

// ข้อความสั้นมาก (เช่น copy ผิด) ไม่บันทึก
if (fail.length && ftxt.length >= 30) {
  failline = JSON.stringify({ t: Date.now(), src: src || "wrong", fail: fail, got: got, note: mask(fn), text: mask(ftxt) });
}
