// ===== Outcome.js : ผลการรักษา (Clavien) =====
// เป็น JavaScript library (แบบเดียวกับ MyDate.js) ใช้คู่กับ UroObj.js และ MyDate.js
// ใช้เฉพาะปุ่ม Action (trigger เดิมไม่เรียกไฟล์นี้):
//   UroBase/Backup (entry action)   "Clavien"          -> cdo.runOne(entry())
//   UroBase/Backup (library action) "Clavien ทั้งหมด"   -> cdo.runAll(lib())
// กติกา: ระหว่างนอนโรงพยาบาลเขียนใน OpResult, ผลตรวจที่มีวันที่ของตัวเอง (CT, US, patho, lab, PSA) ลง FollowUp
//        Report จับคู่ผลกับการผ่าตัดจากวันที่เอง (rpo.setResults ใน UroObj.js)

var CD_GRADES = ["None", "I", "II", "IIIa", "IIIb", "IVa", "IVb", "V"];

// ---------- Clavien: ส่วนคำนวณ (ไม่แตะ Memento ทดสอบใน node ได้) ----------
var cdx = {
  days : 30,
  // การผ่าตัดครั้งถัดไปที่ถือว่า "นัดไว้แล้ว" ไม่นับเป็น complication (ชุดเดียวกับที่ใช้ทำ baseline)
  planned : /off.*DJ|change.*DJ|^change|F\/U|Cystoscopy$|Foley|SPC|second look|stage|Dilate/i,
  // ผ่าตัดซ้ำที่เป็นการแก้ complication (ห้ามเลือด, ระบายปัสสาวะ/หนอง, แก้แผล ฯลฯ) นับเป็น grade III
  // การผ่าตัดอื่น (เช่น TURBT แล้วตามด้วย cystectomy) มักนัดไว้ จะขึ้นเป็นหมายเหตุให้ตรวจเอง
  reop : /explor|hemosta|bleed|clot|evacuat|irrigat|revise|re-?insert|repair|drain|\bPCN\b|\bPCD\b|DJ stent|debride|embol|angio|laparotomy|suture|wound|I\s*&\s*D|incision/i,
  // คำใน OpResult ของการผ่าตัดครั้งนี้ -> grade ขั้นต่ำ (ตรวจจากบนลงล่าง เอาค่าสูงสุด)
  // \bICU\b ตั้งใจให้ตรงตัวพิมพ์ใหญ่ ไม่ให้ไปเจอคำว่า diverticulum
  words : [
    { re : /\bICU\b/, g : "IVa", why : "ICU" },
    { re : /\bon ET\b|ET tube|intubat|ventilat|\bCPR\b|cardiac arrest|levophe?d|lepophed|norepinephrine|vasopressor/i, g : "IVa", why : "ET tube/CPR/vasopressor" },
    { re : /\bPRC\b|\bLPRC\b|\bFFP\b|ให้เลือด|transfus/i, g : "II", why : "ให้เลือด" },
    { re : /sepsis|septic|ESBL|meropen|ertapen|vancomy/i, g : "II", why : "sepsis/ยาฆ่าเชื้อ" },
    { re : /fever|มีไข้|ไข้สูง|ไข้หนาว|ไข้ลง|ยังมีไข้/i, g : "I", why : "ไข้" },
    { re : /\bleak/i, g : "I", why : "leak" },
    { re : /can'?t void|cannot void|ปัสสาวะไม่ออก/i, g : "I", why : "ปัสสาวะไม่ออก" }
  ],
  dead : /\bdead\b|\bdeath\b|เสียชีวิต|expired?\b/i,
  deadDate : /(?:\bdead\b|\bdeath\b|เสียชีวิต|expired?)\s*(?:on|date|วันที่)?\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i,

  rank : function (g) { return CD_GRADES.indexOf(g); },
  max : function (a, b) { return cdx.rank(b) > cdx.rank(a) ? b : a; },
  dayDiff : function (a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); },
  fmt : function (d) { return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear(); },
  year : function (y) { y = Number(y); if (y < 100) y += 2000; if (y > 2400) y -= 543; return y; },

  // ix  = การผ่าตัดที่ประเมิน, ops = การผ่าตัดอื่นของคนไข้ (UroBase+Backup), cons = Consult ของคนไข้
  // แต่ละตัวเป็น object ธรรมดา: {id, date, visitType, visitDate, dc, orType, op, opList, status, text}
  // ptDead = Patient Status เป็น Dead
  suggest : function (ix, ops, cons, ptDead) {
    var g = "None", why = [];
    // ตัดคำที่ทำให้เจอผิด: "คนไข้" มีคำว่า ไข้, "no leak", "ไม่ leak"
    var text = String(ix.text || "").replace(/คนไข้/g, "").replace(/(\bno|ไม่มี|ไม่)\s*(urine\s*|contrast\s*)?leak\w*/gi, "");
    var end = ix.date;

    // 1) ผ่าตัดซ้ำที่ไม่ได้นัดไว้ภายใน 30 วัน: GA = IIIb, LA = IIIa
    ops.forEach(function (o) {
      if (o.id == ix.id || o.status != "Done" || !o.date) return;
      var dd = cdx.dayDiff(ix.date, o.date);
      if (dd <= 0 || dd > cdx.days) return;
      var name = o.opList || o.op || "";
      if (cdx.planned.test(name)) return;
      var when = " (" + o.orType + ") วันที่ " + cdx.fmt(o.date) + " หลังผ่าตัด " + dd + " วัน";
      if (!cdx.reop.test(name)) {
        why.push("หมายเหตุ: ผ่าตัด " + name + when + " ไม่นับ (ถ้าไม่ได้นัดไว้ ให้เลือก III เอง)");
        return;
      }
      var gg = o.orType == "GA" ? "IIIb" : "IIIa";
      g = cdx.max(g, gg);
      why.push(gg + ": " + name + when);
    });

    // 2) กลับมา admit ภายใน 30 วันหลังจำหน่าย (Consult) = อย่างน้อย II
    var dc = ix.dc || ix.date;
    cons.forEach(function (c) {
      if (c.visitType != "Admit" || !c.visitDate || c.status == "Not") return;
      if (ix.visitDate && cdx.dayDiff(ix.visitDate, c.visitDate) == 0) return;
      var dd = cdx.dayDiff(dc, c.visitDate);
      if (dd < 0 || dd > cdx.days) return;
      g = cdx.max(g, "II");
      why.push("II: readmit (Consult) วันที่ " + cdx.fmt(c.visitDate) + " หลังจำหน่าย " + dd + " วัน");
    });

    // 3) คำใน OpResult
    cdx.words.forEach(function (w) {
      if (w.re.test(text)) {
        g = cdx.max(g, w.g);
        why.push(w.g + ": OpResult มีคำว่า " + w.why);
      }
    });

    // 4) เสียชีวิต: ต้องรู้วันที่ (เขียน "dead 29/3/2021" ใน OpResult/Rx) หรือเขียนไว้ในบรรทัด P/O day
    if (ptDead) {
      var texts = [ix.text].concat(ops.map(function (o) { return o.text; }), cons.map(function (c) { return c.text; }));
      var dday = null;
      texts.forEach(function (t) {
        var m = String(t || "").match(cdx.deadDate);
        if (m && !dday) dday = new Date(cdx.year(m[3]), Number(m[2]) - 1, Number(m[1]), 7);
      });
      if (dday) {
        var dd = cdx.dayDiff(ix.date, dday);
        if (dd >= 0 && dd <= cdx.days) {
          g = "V";
          why.push("V: เสียชีวิต " + cdx.fmt(dday) + " หลังผ่าตัด " + dd + " วัน");
        }
        else if (dd > cdx.days) why.push("หมายเหตุ: เสียชีวิต " + cdx.fmt(dday) + " (เกิน 30 วัน ไม่นับ)");
      }
      else if (/P\/O\s*d(ay)?[^\n]*(\bdead\b|เสียชีวิต)/i.test(String(ix.text || ""))) {
        g = "V";
        why.push("V: เขียน dead ในบรรทัด P/O day (ไม่มีวันที่ ตรวจสอบ)");
      }
      else if (cdx.dead.test(String(ix.text || ""))) {
        why.push("หมายเหตุ: Patient = Dead และ OpResult มีคำว่า dead แต่ไม่มีวันที่ ไม่ได้ให้ V");
      }
    }
    if (g != "V" && end && cdx.dayDiff(end, new Date()) < cdx.days)
      why.push("หมายเหตุ: ยังไม่ครบ 30 วันหลังผ่าตัด");
    return { grade : g, why : why };
  }
};

// ---------- Clavien: ส่วนที่ต่อกับ Memento ----------
var cdo = {
  show : function (title, text) {
    try {
      dialog().title(title).text(text).positiveButton("OK", function () { return true; }).show();
    } catch (err) {
      message(title + "\n" + text);
    }
  },
  plain : function (e, libname) {
    var ol = e.field("OperationList");
    return {
      id : e.id,
      date : e.field("Date") ? my.date(e.field("Date")) : null,
      visitType : e.field("VisitType"),
      visitDate : e.field("VisitDate") ? my.date(e.field("VisitDate")) : null,
      dc : e.field("DischargeDate") ? my.date(e.field("DischargeDate")) : null,
      orType : e.field("ORType"),
      op : e.field("Op"),
      opList : ol && ol.length > 0 ? ol[0].title : "",
      status : e.field("Status"),
      text : e.field("OpResult")
    };
  },
  plainConsult : function (c) {
    return {
      id : c.id,
      visitType : c.field("VisitType"),
      visitDate : c.field("VisitDate") ? my.date(c.field("VisitDate")) : null,
      status : c.field("Status"),
      text : c.field("Rx")
    };
  },
  // คำนวณ 1 entry; overwrite=false จะไม่ทับค่า Clavien ที่หมอเลือกไว้แล้ว
  run : function (e, overwrite) {
    var ptl = e.field("Patient");
    if (!ptl || ptl.length == 0 || e.field("Status") != "Done" || !e.field("Date")) return null;
    var ptent = ptl[0];
    var ops = [];
    ptent.linksFrom("UroBase", "Patient").forEach(function (v) { ops.push(cdo.plain(v)); });
    ptent.linksFrom("Backup", "Patient").forEach(function (v) { ops.push(cdo.plain(v)); });
    var cons = ptent.linksFrom("Consult", "Patient").map(cdo.plainConsult);
    var s = cdx.suggest(cdo.plain(e), ops, cons, ptent.field("Status") == "Dead");

    var cur = e.field("Clavien");
    var setnow = overwrite || !cur;
    if (setnow) e.set("Clavien", s.grade);
    // ค่าที่เดาและเหตุผลเก็บใน Report (ไม่เพิ่ม field ใน UroBase/Backup)
    var r = rpo.find(e);
    if (r) {
      rpo.put(r, "ClavienAuto", s.grade);
      rpo.put(r, "ClavienWhy", s.why.join("\n"));
      rpo.setResults(r, e);
    }
    return { grade : s.grade, why : s.why, cur : cur, set : setnow };
  },
  // entry action: เดา Clavien ของการผ่าตัดนี้ แล้วแสดงเหตุผล
  runOne : function (e) {
    var cd = cdo.run(e, false);
    if (!cd) { message("ใช้ได้กับการผ่าตัดที่ Status = Done และมี Patient"); return; }
    var msg = "แนะนำ: " + cd.grade;
    if (!cd.set) msg += " (ค่าที่เลือกไว้: " + cd.cur + " ไม่ได้เปลี่ยน)";
    if (cd.why.length) msg += "\n" + cd.why.join("\n");
    cdo.show("Clavien", msg);
  },
  // library action: ทุก entry ที่ Done, ผ่านมาแล้ว >= 30 วัน และยังไม่มี Clavien
  runAll : function (lb) {
    var limit = my.dateadd(new Date(), -cdx.days);
    var n = 0, count = {};
    lb.entries().forEach(function (e) {
      if (e.field("Status") != "Done" || e.field("Clavien") || !e.field("Date")) return;
      if (my.date(e.field("Date")).getTime() > limit.getTime()) return;
      var r = cdo.run(e, false);
      if (r) { n++; count[r.grade] = (count[r.grade] || 0) + 1; }
    });
    var lines = CD_GRADES.filter(function (g) { return count[g]; }).map(function (g) { return g + " = " + count[g]; });
    cdo.show("Clavien ทั้งหมด", "ใส่ค่าให้ " + n + " entry\n" + lines.join("\n"));
  }
};

if (typeof module !== "undefined") module.exports = { cdx : cdx, CD_GRADES : CD_GRADES };
