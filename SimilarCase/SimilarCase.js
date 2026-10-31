// ===== UroBase / Consult : หาเคสคล้าย (Action ระดับ entry) =====
// เทียบเคสที่เลือกกับทุกการผ่าตัด Status = Done ใน UroBase + Backup ของคนไข้คนอื่น
// แล้วแสดง Op ที่พบบ่อยใน 10 อันดับแรก และรายการ 10 เคส
// คะแนน: Dx 0.65 + ประวัติ (Underlying, PastHx, InvResult) 0.20 + อายุ 0.10 + ขนาดนิ่ว 0.05 + เพศเดียวกัน 0.05
//   ข้อความเทียบด้วย TF-IDF ของตัวอักษร 2-4 ตัว (char n-gram) ไม่ต้องใช้โมเดลหรืออินเทอร์เน็ต
// ใช้เป็น JavaScript library คู่กับ MyDate.js, UroObj.js (ใช้ตัวแปร or, bu)
// แล้วใส่ในช่อง script ของ Action: simc.run(entry());
// ไฟล์ใน /Workload: simcase.json เก็บข้อมูลที่ใช้เทียบของทุกผ่าตัด (อ่าน entry ใหม่เฉพาะที่เพิ่ม/แก้ไข สร้างใหม่ทุก 7 วัน)
//                  simcase_last.json จำผลล่าสุด (เก็บแค่ id ไม่มีชื่อ/HN) กดซ้ำที่ entry เดิมจะขึ้นทันที
var simc = {
  K : 10,
  M : 300,              // เทียบประวัติเฉพาะ M เคสที่คะแนนส่วนอื่นสูงสุด
  CACHE : "simcase.json",
  LAST : "simcase_last.json",
  REBUILD_DAYS : 7,
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
  // mult[i] = จำนวนเอกสารที่มีข้อความ texts[i] (ส่งข้อความไม่ซ้ำ ผลเท่ากับส่งทุกเอกสาร)
  vectors : function (texts, mult) {
    var vocab = {}, nv = 0, df = [], docs = [], N = 0, i, j;
    for (i = 0; i < texts.length; i++) {
      var m = mult ? mult[i] : 1, tf = simc.grams(texts[i]), ids = [], cnt = [];
      N += m;
      for (var g in tf) {
        var id = vocab[g];
        if (id === undefined) { id = vocab[g] = nv++; df[id] = 0; }
        df[id] += m; ids.push(id); cnt.push(tf[g]);
      }
      docs.push({ ids : ids, w : cnt });
    }
    for (i = 0; i < texts.length; i++) {
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
  // case = { dx, h (ประวัติ), age, sex, pid, sz }
  // คืน [{ i, s }] ของ cases ที่คล้าย cases[q] มากที่สุด K อัน (ไม่นับคนไข้เดียวกัน)
  //   1. Dx: คำนวณเวกเตอร์ต่อ Dx ที่ไม่ซ้ำกัน แล้วรวมกับอายุ ขนาดนิ่ว เพศ ของทุกเคส
  //   2. ประวัติ: เทียบเฉพาะ M เคสที่คะแนนข้อ 1 สูงสุด (IDF จาก M เคสนั้น)
  rank : function (cases, q, K) {
    var W = simc.W, c = cases[q], uniq = {}, utext = [], umult = [], ui = [], i;
    for (i = 0; i < cases.length; i++) {
      var t = simc.norm(simc.clean(cases[i].dx)), u = uniq[t];
      if (u === undefined) { u = uniq[t] = utext.length; utext.push(t); umult.push(0); }
      umult[u]++; ui.push(u);
    }
    var Vd = simc.vectors(utext, umult), qd = simc.dense(Vd[ui[q]]), dsim = [];
    for (i = 0; i < Vd.length; i++) dsim.push(simc.dot(qd, Vd[i]));
    var out = [];
    for (i = 0; i < cases.length; i++) {
      var o = cases[i];
      if (i == q || (c.pid && o.pid == c.pid)) continue;
      var s = W.dx * dsim[ui[i]];
      if (c.age !== null && o.age !== null) s += W.age * Math.max(0, 1 - Math.abs(o.age - c.age) / 30);
      if (c.sz !== null && o.sz !== null) s += W.size * Math.max(0, 1 - Math.abs(o.sz - c.sz) / 10);
      if (c.sex && o.sex == c.sex) s += W.sex;
      out.push({ i : i, s : s });
    }
    out.sort(function (a, b) { return b.s - a.s; });
    out = out.slice(0, simc.M);
    var Vh = simc.vectors([c].concat(out.map(function (x) { return cases[x.i]; })).map(function (r) { return simc.norm(simc.clean(r.h)); }));
    var qh = simc.dense(Vh[0]);
    for (i = 0; i < out.length; i++) out[i].s += W.hist * simc.dot(qh, Vh[i + 1]);
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
  // เวลาแก้ไขล่าสุดของ entry (ms) ไม่มีคืน 0
  mtime : function (e) {
    try { var t = e.lastModifiedTime; return t ? Number(new Date(t).getTime()) || 0 : 0; } catch (err) { return 0; }
  },
  // entry -> ข้อมูลที่ใช้เทียบ (เก็บลง cache ได้ ไม่มีชื่อ/HN)
  // any = true: ไม่ตรวจ Status (ใช้กับเคสที่กำลังค้น)
  record : function (e, lib, t, any) {
    var r = { id : e.id, lib : lib, t : t };
    if (!any && (simc.f(e, "Status") != "Done" || !simc.f(e, "Dx"))) { r.ok = 0; return r; }
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
    r.ok = 1;
    r.pid = p ? p.id : "";
    r.dx = String(simc.f(e, "Dx"));
    r.sz = simc.size(r.dx);
    r.h = hist.join(" | ");
    r.age = (bd && date) ? Math.round((new Date(date) - new Date(bd)) / 86400000 / 365.25) : null;
    r.sex = p ? simc.sex(simc.f(p, "PtName")) : "";
    r.date = new Date(date).getTime();
    r.op = String(simc.f(e, "Op"));
    r.opg = simc.opgroup(opl || r.op);
    r.los = String(simc.f(e, "LOS"));
    return r;
  },
  // ---------- ไฟล์ ----------
  bytes : function (s) {
    try { return unescape(encodeURIComponent(s)).length; } catch (err) { return s.length * 3; }
  },
  readJSON : function (path) {
    try {
      var f = file(path), text = String(f.readAll() || "");
      f.close();
      simc.size_[path] = simc.bytes(text);
      return text.trim() ? JSON.parse(text) : null;
    }
    catch (err) {
      return null;
    }
  },
  size_ : {},
  // file().write เขียนทับจากต้นไฟล์แต่ไม่ตัดท้ายไฟล์ จึงเติมช่องว่างให้ยาวเท่าของเดิม
  writeJSON : function (path, o) {
    try {
      var text = JSON.stringify(o), pad = (simc.size_[path] || 0) - simc.bytes(text);
      if (pad > 0) text += new Array(pad + 1).join(" ");
      var f = file(path);
      f.write(text);
      f.close();
      simc.size_[path] = simc.bytes(text);
    }
    catch (err) {
      log("SimilarCase write " + path + ": " + err);
    }
  },
  // ทุกผ่าตัดใน UroBase + Backup: ใช้ข้อมูลจาก cache ถ้า entry ไม่ได้แก้ไข
  load : function () {
    var cache = simc.readJSON(simc.CACHE), old = {}, rows = [], changed = 0, not = 0;
    var fresh = cache && cache.built && (Date.now() - cache.built) < simc.REBUILD_DAYS * 86400000;
    if (fresh) cache.rows.forEach(function (r) { old[r.lib + ":" + r.id] = r; });
    var libs = [["UroBase", or], ["Backup", bu]];
    for (var l = 0; l < libs.length; l++) {
      var ents = libs[l][1].entries();
      for (var i = 0; i < ents.length; i++) {
        var t = simc.mtime(ents[i]), r = old[libs[l][0] + ":" + ents[i].id];
        if (!t) not++;
        if (!r || !t || r.t != t) { r = simc.record(ents[i], libs[l][0], t); changed++; }
        rows.push(r);
      }
    }
    if (not) log("SimilarCase: " + not + " entries without lastModifiedTime");
    if (changed || !fresh || (cache && cache.rows.length != rows.length))
      simc.writeJSON(simc.CACHE, { built : fresh ? cache.built : Date.now(), rows : rows });
    return { rows : rows, changed : changed };
  },
  find : function (r) {
    try { return libByName(r.lib).findById(r.id); } catch (err) { return null; }
  },
  dstr : function (d) {
    d = new Date(d);
    return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
  },
  run : function (e) {
    var qlib = lib().title, key = qlib + ":" + e.id, qt = simc.mtime(e);
    simc.cur = e;
    var last = simc.readJSON(simc.LAST);
    if (last && last.q == key && qt && last.t == qt) {
      last.title = "เคสคล้าย (ผลเดิม)";
      simc.step(last, -1);
      return;
    }
    simc.compute(e, qlib, key, qt);
  },
  compute : function (e, qlib, key, qt) {
    var t0 = new Date(), data = simc.load(), cases = [];
    for (var i = 0; i < data.rows.length; i++) {
      var r = data.rows[i];
      if (r.ok && !(r.lib == qlib && r.id == e.id)) cases.push(r);
    }
    var q = simc.record(e, qlib, qt, true);
    if (!q.ok || !q.dx) { message("ยังไม่มี Dx"); return; }
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
    log("SimilarCase: " + cases.length + " cases, read " + (t1 - t0) + " ms (" + data.changed + " re-read), compute " + (t2 - t1) + " ms");
    var last = {
      q : key, t : qt, pos : 0,
      title : "เคสคล้าย (เทียบ " + (cases.length - 1) + " ผ่าตัด, " + sec + " วินาที)",
      head : "Op ที่พบบ่อย:\n" + tally.join("\n"),
      top : nb.map(function (x) { var c = cases[x.i]; return { lib : c.lib, id : c.id }; })
    };
    simc.writeJSON(simc.LAST, last);
    simc.step(last, -1);
  },
  // ชื่อ HN อ่านจาก entry เฉพาะ 10 เคสที่แสดง
  label : function (e, lib, k) {
    if (!e) return (k + 1) + ". (ไม่พบ entry)";
    var c = simc.record(e, lib, 0, true), p = null;
    try { p = e.field("Patient").length > 0 ? e.field("Patient")[0] : null; } catch (err) {}
    var who = p ? (simc.f(p, "PtName") + " " + simc.f(p, "HN")).trim() : "";
    return (k + 1) + ". " + who + "\n   " + simc.dstr(c.date) + " | " + (c.age !== null ? c.age + " ปี " : "") + (c.sex || "") + " | " + lib +
           "\n   Dx: " + c.dx + "\n   Op: " + c.op + (c.los !== "" ? " | LOS " + c.los : "");
  },
  // k = -1: หน้าสรุป ปุ่ม ปิด / คำนวณใหม่ / ดูทีละเคส (ต่อจากเคสที่เปิดล่าสุด)
  // k >= 0: เคสที่ k ปุ่ม เปิด / ถัดไป / ปิด  (ปุ่ม ui().button ใน dialog กดแล้วไม่เรียกคำสั่ง จึงใช้ปุ่มของ dialog)
  step : function (last, k) {
    if (!last.ents) {
      last.ents = last.top.map(simc.find);
      last.labels = last.ents.map(function (e, i) { return simc.label(e, last.top[i].lib, i); });
    }
    var n = last.top.length;
    try {
      if (k < 0) {
        var pos = Math.min(last.pos || 0, n - 1);
        dialog().title(last.title).text(last.head + "\n\n" + last.labels.join("\n"))
          .neutralButton("ปิด", function () { return true; })
          .negativeButton("คำนวณใหม่", function () {
            simc.compute(simc.cur, last.q.split(":")[0], last.q, last.t);
            return true;
          })
          .positiveButton(pos > 0 ? "ดูต่อ เคส " + (pos + 1) : "ดูทีละเคส", function () { simc.step(last, pos); return true; }).show();
        return;
      }
      dialog().title("เคสคล้าย " + (k + 1) + "/" + n).text(last.labels[k])
        .neutralButton("ปิด", function () { return true; })
        .negativeButton("เปิด", function () {
          simc.writeJSON(simc.LAST, { q : last.q, t : last.t, pos : k + 1 < n ? k + 1 : 0, title : last.title, head : last.head, top : last.top });
          if (last.ents[k]) last.ents[k].show();
          return true;
        })
        .positiveButton(k + 1 < n ? "ถัดไป" : "จบ", function () {
          if (k + 1 < n) simc.step(last, k + 1);
          return true;
        }).show();
    }
    catch (err) {
      message(last.head + "\n\n" + last.labels.join("\n"));
    }
  }
};
