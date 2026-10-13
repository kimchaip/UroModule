// ===== Outcome.js : ผลการรักษา (Clavien + นำเข้าผลตรวจเข้า FollowUp) =====
// เป็น JavaScript library ใหม่ (แบบเดียวกับ MyDate.js) ใช้คู่กับ UroObj.js และ MyDate.js
// ใช้เฉพาะปุ่ม Action (trigger เดิมไม่เรียกไฟล์นี้):
//   UroBase/Backup (entry action)   "Clavien"          -> cdo.runOne(entry())
//   UroBase/Backup (library action) "Clavien ทั้งหมด"   -> cdo.runAll(lib())
//   FollowUp      (library action)  "นำเข้าผลตรวจ"      -> oco.importFollowUp()
// กติกา: ระหว่างนอนโรงพยาบาลเขียนใน OpResult, ผลตรวจที่มีวันที่ของตัวเอง (CT, US, patho, lab, PSA) ลง FollowUp
//        Report จับคู่ผลกับการผ่าตัดจากวันที่เอง (rpo.setResults ใน UroObj.js)
// ไฟล์ inbox ที่ Tasker (outcomeextract.js) เขียน: outcomeInbox.json (1 บรรทัด 1 ผล)
// บรรทัดที่นำเข้าแล้วจดไว้ใน outcomeInbox.done (แบบเดียวกับ consultInbox.done)
// path เป็นชื่อเปล่า เพราะตั้ง default folder ของ Memento เป็น /Workload แล้ว

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
    oco.show("Clavien", msg);
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
    oco.show("Clavien ทั้งหมด", "ใส่ค่าให้ " + n + " entry\n" + lines.join("\n"));
  }
};

// ---------- ผลตรวจจากรูป (inbox) -> FollowUp ----------
var oco = {
  PATH : "outcomeInbox.json",
  DONE : "outcomeInbox.done",
  TYPES : { patho : "Patho", psa : "PSA", lab : "Lab" },

  show : function (title, text) {
    try {
      dialog().title(title).text(text).positiveButton("OK", function () { return true; }).show();
    } catch (err) {
      message(title + "\n" + text);
    }
  },
  readLines : function (path) {
    try {
      var f = file(path);
      var text = String(f.readAll() || "");
      f.close();
      return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    } catch (err) {
      return [];
    }
  },
  // ข้อความใหม่ยาวกว่าเดิมเสมอ จึงเขียนทับของเดิมได้หมด (file().write ไม่ตัดท้ายไฟล์)
  saveDone : function (oldKeys, newKeys) {
    if (!newKeys.length) return;
    try {
      var f = file(oco.DONE);
      f.write(oldKeys.concat(newKeys).join("\n") + "\n");
      f.close();
    } catch (err) {
      log("outcome done: " + err);
    }
  },
  // บรรทัดที่ยังไม่นำเข้า: [{o, key}]
  pending : function (doneKeys) {
    var seen = {};
    var out = [];
    oco.readLines(oco.PATH).forEach(function (line) {
      var o;
      try { o = JSON.parse(line); } catch (err) { return; }
      var key = String(o.t || line);
      if (doneKeys.indexOf(key) > -1 || seen[key]) return;
      seen[key] = true;
      out.push({ o : o, key : key });
    });
    return out;
  },
  parseDate : function (s) {
    var r = String(s || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return r ? my.date(new Date(Number(r[3]), Number(r[2]) - 1, Number(r[1]))) : null;
  },
  findPatient : function (hn) {
    var ents = pt.entries();
    for (var i = 0; i < ents.length; i++) {
      if (Number(ents[i].field("HN")) === Number(hn)) return ents[i];
    }
    return null;
  },
  typeOf : function (o) {
    return oco.TYPES[o.type] || (o.d && o.d.modality) || "Other";
  },
  // ค่าใน FollowUp จากผลที่ parse แล้ว (ชื่อ field ตาม SETUP.md)
  setFollowUp : function (f, o) {
    var d = o.d || {};
    var put = function (name, v) {
      if (v === undefined || v === null || v === "") return;
      try { f.set(name, v); } catch (err) { log("FollowUp " + name + ": " + err); }
    };
    put("Type", oco.typeOf(o));
    // imaging
    put("StoneFree", d.sf);
    put("StoneSize", d.maxmm);
    put("StoneN", typeof d.n == "number" ? d.n : undefined);
    put("StoneSide", d.side);
    put("StoneSite", d.site);
    put("StoneHU", d.hu);
    put("Hydro", d.hydro);
    put("ProstateVol", d.vol);
    put("PIRADS", d.pirads);
    // lab
    put("PSA", d.psa);
    put("Cr", d.cr);
    put("eGFR", d.egfr);
    // patho
    put("Organ", d.organ);
    put("Specimen", d.specimen);
    put("Cell", d.cell);
    put("Grade", d.grade || (d.isup ? "ISUP " + d.isup : undefined));
    put("Gleason", d.gleason);
    put("GradeGroup", d.gg);
    put("pT", d.pT || (d.tGuess ? d.tGuess + "?" : undefined));
    put("pN", d.pN);
    put("Margin", d.margin);
    put("LVI", d.lvi);
    put("Muscle", d.mp);
    put("NodesPos", d.nodesPos);
    put("NodesTotal", d.nodesTotal);
    put("TumorSize", d.sizeCm);
    put("Cores", d.coresTotal ? d.coresPos + "/" + d.coresTotal : undefined);
    put("PathoNo", d.no);
    put("Finding", d.text);
    put("Data", JSON.stringify(d));
    put("Key", String(o.t || ""));
  },
  // สร้าง FollowUp ถ้ายังไม่มีผลชนิดเดียวกัน วันเดียวกัน (patho ดูเลข patho หรืออวัยวะด้วย เพราะวันเดียวอาจมีหลายชิ้น)
  addFollowUp : function (ptent, o, date) {
    var fu = libByName("FollowUp");
    var type = oco.typeOf(o);
    var d = o.d || {};
    var dup = ptent.linksFrom("FollowUp", "Patient").some(function (v) {
      if (!v.field("Date") || my.gdate(my.date(v.field("Date"))) != my.gdate(date) || v.field("Type") != type) return false;
      if (type != "Patho") return true;
      return (d.no && v.field("PathoNo") == d.no) || (!d.no && v.field("Organ") == (d.organ || ""));
    });
    if (dup) return false;
    var f = fu.create(new Object());
    f.set("Date", date);
    f.link("Patient", ptent);
    oco.setFollowUp(f, o);
    return true;
  },

  // library action ใน FollowUp: นำเข้าทุกบรรทัดที่ค้าง แล้วอัปเดต Report ของคนไข้ที่มีผลใหม่
  // (entry ที่ script สร้างไม่ผ่าน trigger จึงต้องเรียก rpo.syncPatient เอง)
  importFollowUp : function () {
    var doneKeys = oco.readLines(oco.DONE);
    var newKeys = [];
    var made = [], skipped = [], pts = {};
    oco.pending(doneKeys).forEach(function (p) {
      var o = p.o;
      var ptent = oco.findPatient(o.hn);
      var date = oco.parseDate(o.date);
      if (!ptent) { skipped.push("HN " + o.hn + " ไม่พบใน Patient"); return; }
      if (!date) { skipped.push("HN " + o.hn + " ไม่มีวันที่"); return; }
      var added = oco.addFollowUp(ptent, o, date);
      made.push((added ? "" : "(มีแล้ว) ") + "HN " + o.hn + " " + oco.typeOf(o) + " " + o.date);
      if (added) pts[ptent.id] = ptent;
      newKeys.push(p.key);
    });
    oco.saveDone(doneKeys, newKeys);
    for (var id in pts) rpo.syncPatient(pts[id]);
    var msg = made.length ? "นำเข้า " + made.length + ":\n" + made.join("\n") : "ไม่มีผลรอนำเข้า";
    if (skipped.length) msg += "\n\nข้าม " + skipped.length + " (ยังค้างในไฟล์):\n" + skipped.join("\n");
    oco.show("FollowUp", msg);
  }
};

if (typeof module !== "undefined") module.exports = { cdx : cdx, CD_GRADES : CD_GRADES };
