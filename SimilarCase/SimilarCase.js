// ===== UroBase / Consult : หาเคสคล้าย (Action ระดับ entry) =====
// เทียบเคสที่เลือกกับทุกการผ่าตัด Status = Done ใน UroBase + Backup ของคนไข้คนอื่น
// แล้วแสดง Op ที่พบบ่อยใน 10 อันดับแรก และรายการ 10 เคส
// คะแนน: Dx 0.65 + ประวัติ (Underlying, PastHx, InvResult) 0.20 + อายุ 0.10 + ขนาดนิ่ว 0.05 + เพศเดียวกัน 0.05
//   ข้อความเทียบด้วย TF-IDF ของตัวอักษร 2-4 ตัว (char n-gram) ไม่ต้องใช้โมเดลหรืออินเทอร์เน็ต
// ใช้เป็น JavaScript library คู่กับ MyDate.js, UroObj.js (ใช้ตัวแปร or, bu)
// แล้วใส่ในช่อง script ของ Action: simc.run(entry());
var simc = {
  K : 10,
  W : { dx : 0.65, hist : 0.20, age : 0.10, size : 0.05, sex : 0.05 },
  SYN : [[/\buc\b/g, "ureteric calculi stone"], [/\brc\b/g, "renal calculi stone"], [/\bvc\b/g, "bladder calculi stone"],
         [/\bstone\b/g, "stone calculi"], [/\bca\b/g, "cancer"], [/\bbph\b/g, "bph prostate"], [/\baur\b/g, "urinary retention aur"],
         [/\bdj\b/g, "dj stent"]],
  MALE : ["นาย", "ด.ช.", "ดช.", "เด็กชาย", "mr.", "พระ"],
  FEMALE : ["นางสาว", "น.ส.", "นส.", "นาง", "ด.ญ.", "ดญ.", "เด็กหญิง", "mrs.", "miss", "ms."],

  // ---------- ส่วนคำนวณ (ไม่เรียก Memento ทดสอบกับ CSV ได้) ----------
  // ตัด HN และวันที่ออกจากข้อความ
  clean : function (s) {
    s = (s === null || s === undefined) ? "" : String(s);
    s = s.replace(/\b\d{3}-\d{2}-\d{2}\b/g, "");
    s = s.replace(/\(?\d{1,2}\/\d{1,2}\/\d{2,4}\)?/g, "");
    s = s.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* \d{1,2},? \d{4}/g, "");
    return s.replace(/[​\s]+/g, " ").trim();
  },
  norm : function (s) {
    s = String(s).toLowerCase().replace(/\b(rt|lt|bilat|bilateral)\b/g, " ");
    for (var i = 0; i < simc.SYN.length; i++) s = s.replace(simc.SYN[i][0], simc.SYN[i][1]);
    return s;
  },
  // ขนาดนิ่วตัวแรกใน Dx เป็น mm
  size : function (s) {
    var m = String(s).toLowerCase().match(/(\d+(?:\.\d+)?)\s*(mm|cm)/);
    if (!m) return null;
    var x = parseFloat(m[1]);
    return m[2] == "cm" ? x * 10 : x;
  },
  sex : function (name) {
    name = String(name || "").trim().toLowerCase();
    for (var i = 0; i < simc.FEMALE.length; i++) if (name.indexOf(simc.FEMALE[i]) == 0) return "F";
    for (var j = 0; j < simc.MALE.length; j++) if (name.indexOf(simc.MALE[j]) == 0) return "M";
    return "";
  },
  // กลุ่ม Op สำหรับนับ: ตัดข้างซ้าย/ขวาออก
  opgroup : function (s) {
    return String(s || "").toLowerCase().replace(/\b(rt|lt|bilat|bilateral|left|right)\b/g, "").replace(/\s+/g, " ").trim();
  },
  // n-gram ตัวอักษร 2-4 ตัว ภายในแต่ละคำ (เติมช่องว่างหน้า-หลังคำ)
  grams : function (text) {
    var tf = {}, words = text.split(/\s+/);
    for (var i = 0; i < words.length; i++) {
      if (!words[i]) continue;
      var w = " " + words[i] + " ";
      for (var n = 2; n <= 4; n++) {
        if (w.length <= n) { tf[w] = (tf[w] || 0) + 1; break; }
        for (var k = 0; k + n <= w.length; k++) {
          var g = w.substr(k, n);
          tf[g] = (tf[g] || 0) + 1;
        }
      }
    }
    return tf;
  },
  // texts -> เวกเตอร์ TF-IDF (sublinear tf, ตัด n-gram ที่พบใน < 2 เอกสาร) ขนาด 1
  // เก็บเป็น { ids : [เลข n-gram], w : [น้ำหนัก] } เพื่อให้เร็วบนมือถือ
  vectors : function (texts) {
    var vocab = {}, nv = 0, df = [], docs = [], N = texts.length, i, j;
    for (i = 0; i < N; i++) {
      var tf = simc.grams(texts[i]), ids = [], cnt = [];
      for (var g in tf) {
        var id = vocab[g];
        if (id === undefined) { id = vocab[g] = nv++; df[id] = 0; }
        df[id]++; ids.push(id); cnt.push(tf[g]);
      }
      docs.push({ ids : ids, w : cnt });
    }
    for (i = 0; i < N; i++) {
      var d = docs[i], vi = [], vw = [], sum = 0;
      for (j = 0; j < d.ids.length; j++) {
        if (df[d.ids[j]] < 2) continue;
        var x = (1 + Math.log(d.w[j])) * (Math.log((1 + N) / (1 + df[d.ids[j]])) + 1);
        vi.push(d.ids[j]); vw.push(x); sum += x * x;
      }
      sum = Math.sqrt(sum);
      if (sum > 0) for (j = 0; j < vw.length; j++) vw[j] /= sum;
      docs[i] = { ids : vi, w : vw };
    }
    return docs;
  },
  // เวกเตอร์ของเคสที่ค้น -> array ตามเลข n-gram
  dense : function (v) {
    var a = [];
    for (var j = 0; j < v.ids.length; j++) a[v.ids[j]] = v.w[j];
    return a;
  },
  dot : function (qa, v) {
    var s = 0;
    for (var j = 0; j < v.ids.length; j++) {
      var x = qa[v.ids[j]];
      if (x !== undefined) s += x * v.w[j];
    }
    return s;
  },
  // case = { dx, hist, age, sex, pid } -> เวกเตอร์ของ Dx และประวัติ
  index : function (cases) {
    var dxs = [], hs = [];
    for (var i = 0; i < cases.length; i++) {
      dxs.push(simc.norm(simc.clean(cases[i].dx)));
      hs.push(simc.norm(simc.clean(cases[i].hist)));
    }
    return { d : simc.vectors(dxs), h : simc.vectors(hs) };
  },
  // คืน index ของ cases ที่คล้าย cases[q] มากที่สุด K อัน (ไม่นับคนไข้เดียวกัน)
  rank : function (cases, q, K, V) {
    V = V || simc.index(cases);
    var Vd = V.d, Vh = V.h, i;
    var c = cases[q], sz = simc.size(c.dx), W = simc.W, out = [];
    var qd = simc.dense(Vd[q]), qh = simc.dense(Vh[q]);
    for (i = 0; i < cases.length; i++) {
      var o = cases[i];
      if (i == q || (c.pid && o.pid == c.pid)) continue;
      var s = W.dx * simc.dot(qd, Vd[i]) + W.hist * simc.dot(qh, Vh[i]);
      if (c.age !== null && o.age !== null) s += W.age * Math.max(0, 1 - Math.abs(o.age - c.age) / 30);
      if (sz !== null) {
        var so = simc.size(o.dx);
        if (so !== null) s += W.size * Math.max(0, 1 - Math.abs(so - sz) / 10);
      }
      if (c.sex && o.sex == c.sex) s += W.sex;
      out.push({ i : i, s : s });
    }
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, K || simc.K);
  },

  // ---------- ส่วน Memento ----------
  f : function (e, name) {
    try {
      var v = e.field(name);
      if (v === null || v === undefined) return "";
      if (v instanceof Array) return v.join(" ");
      return v;
    }
    catch (err) {
      return "";
    }
  },
  fromEntry : function (e, lib) {
    var p = null;
    try { p = e.field("Patient").length > 0 ? e.field("Patient")[0] : null; } catch (err) {}
    var date = simc.f(e, "Date") || simc.f(e, "ConsultDate") || simc.f(e, "VisitDate") || new Date();
    var bd = p ? simc.f(p, "Birthday") : "";
    var und = simc.f(e, "Underlying") || (p ? simc.f(p, "Underlying") : "");
    var hist = [];
    if (und) hist.push("Underlying: " + und);
    if (simc.f(e, "PastHx")) hist.push("PastHx: " + String(simc.f(e, "PastHx")).substr(0, 300));
    if (simc.f(e, "InvResult")) hist.push("InvResult: " + String(simc.f(e, "InvResult")).substr(0, 200));
    var opl = "";
    try { if (e.field("OperationList").length > 0) opl = e.field("OperationList")[0].title; } catch (err) {}
    return {
      e : e, p : p, lib : lib, pid : p ? p.id : "", dx : simc.f(e, "Dx"), hist : hist.join(" | "),
      age : (bd && date) ? Math.round((new Date(date) - new Date(bd)) / 86400000 / 365.25) : null,
      sex : p ? simc.sex(simc.f(p, "PtName")) : "",
      date : date, op : simc.f(e, "Op"), opg : simc.opgroup(opl || simc.f(e, "Op")), los : simc.f(e, "LOS")
    };
  },
  dstr : function (d) {
    d = new Date(d);
    return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
  },
  run : function (e) {
    var t0 = new Date(), cases = [], libs = [["UroBase", or], ["Backup", bu]];
    for (var l = 0; l < libs.length; l++) {
      var ents = libs[l][1].entries();
      for (var i = 0; i < ents.length; i++) {
        if (ents[i].id == e.id || simc.f(ents[i], "Status") != "Done" || !simc.f(ents[i], "Dx")) continue;
        cases.push(simc.fromEntry(ents[i], libs[l][0]));
      }
    }
    var q = simc.fromEntry(e, lib().title);
    if (!q.dx) { message("ยังไม่มี Dx"); return; }
    cases.push(q);
    var t1 = new Date();
    var nb = simc.rank(cases, cases.length - 1, simc.K);
    var t2 = new Date(), sec = Math.round((t2 - t0) / 100) / 10;

    var cnt = {}, names = {}, keys = [];
    for (var j = 0; j < nb.length; j++) {
      var c = cases[nb[j].i];
      if (!cnt[c.opg]) { cnt[c.opg] = 0; names[c.opg] = String(c.op).replace(/\b(rt|lt|bilat|bilateral|left|right)\b/gi, "").replace(/\s+/g, " ").trim() || c.opg; keys.push(c.opg); }
      cnt[c.opg]++;
    }
    keys.sort(function (a, b) { return cnt[b] - cnt[a]; });
    var tally = keys.map(function (k) { return names[k] + " " + cnt[k] + "/" + nb.length; });
    var top = nb.map(function (x) { return cases[x.i]; });
    var title = "เคสคล้าย (เทียบ " + (cases.length - 1) + " ผ่าตัด, " + sec + " วินาที)";
    log("SimilarCase: " + cases.length + " cases, read " + (t1 - t0) + " ms, compute " + (t2 - t1) + " ms");
    simc.show(title, "Op ที่พบบ่อย:\n" + tally.join("\n"), top);
  },
  // ชื่อ HN (อ่านเฉพาะ 10 เคสที่แสดง)
  label : function (c, k) {
    var who = c.p ? (simc.f(c.p, "PtName") + " " + simc.f(c.p, "HN")).trim() : "";
    return (k + 1) + ". " + who + "\n   " + simc.dstr(c.date) + " | " + (c.age !== null ? c.age + " ปี " : "") + (c.sex || "") + " | " + c.lib +
           "\n   Dx: " + c.dx + "\n   Op: " + c.op + (c.los !== "" ? " | LOS " + c.los : "");
  },
  // แสดงผล: รายการที่แต่ละเคสเป็นปุ่มกดเปิด entry ถ้า dialog ใส่ปุ่มไม่ได้ ใช้แบบทีละเคส
  show : function (title, head, top) {
    var labels = top.map(simc.label);
    try {
      var rows = [ui().text(head + "\n\nกดเคสเพื่อเปิด entry")];
      top.forEach(function (c, k) {
        rows.push(ui().button(labels[k], function () { c.e.show(); }));
      });
      dialog().title(title).view(ui().layout(rows)).positiveButton("ปิด", function () { return true; }).show();
    }
    catch (err) {
      log("SimilarCase list view: " + err);
      simc.step(title, head, top, labels, -1);
    }
  },
  // แบบสำรอง: สรุป แล้วดูทีละเคส ปุ่ม เปิด / ถัดไป / ปิด
  step : function (title, head, top, labels, k) {
    try {
      if (k < 0) {
        dialog().title(title).text(head + "\n\n" + labels.join("\n"))
          .neutralButton("ปิด", function () { return true; })
          .positiveButton("ดูทีละเคส", function () { simc.step(title, head, top, labels, 0); return true; }).show();
        return;
      }
      dialog().title("เคสคล้าย " + (k + 1) + "/" + top.length).text(labels[k])
        .neutralButton("ปิด", function () { return true; })
        .negativeButton("เปิด", function () { top[k].e.show(); return true; })
        .positiveButton(k + 1 < top.length ? "ถัดไป" : "จบ", function () {
          if (k + 1 < top.length) simc.step(title, head, top, labels, k + 1);
          return true;
        }).show();
    }
    catch (err) {
      message(head + "\n\n" + labels.join("\n"));
    }
  }
};
