// ===== Consult : นำเข้า consult จาก Memento/consultInbox.json =====
// ใช้เป็น Action script ใน library "Consult" (ต้องเลือก library UroObj.js และ MyDate.js
// ในหน้า script เหมือน trigger อื่น และเปิดสิทธิ์ Read files / Write files)
// Tasker (emrextract.js) เขียนต่อท้ายไฟล์ทีละบรรทัด: {"hn":..,"date":"d/m/yyyy","dx":..,"pasthx":..,"name":..}
// ทุกบรรทัด: หา Patient จาก HN -> ข้ามถ้ามี Consult วันเดียวกัน + คนเดียวกัน + Dx เดียวกันแล้ว
//            -> สร้าง Consult ผ่าน trigger เดิม (แบบเดียวกับ emx.createnew)
// file().write ของ Memento เขียนทับจากต้นไฟล์แต่ไม่ตัดส่วนเกินท้ายไฟล์ เขียน "" จึงล้างไฟล์ไม่ได้
// เลยจดรหัส (t) ของบรรทัดที่นำเข้าแล้ว
// ไว้ใน consultInbox.done แล้วข้ามบรรทัดเหล่านั้นในครั้งต่อไป แม้จะลบ entry ใน Memento ไปแล้วก็ตาม
(function () {
  var PATH = "/sdcard/Memento/consultInbox.json";
  var DONE = "/sdcard/Memento/consultInbox.done";

  function readLines(path) {
    try {
      var f = file(path);
      var text = String(f.readAll() || "");
      f.close();
      return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    } catch (err) {
      return [];
    }
  }

  // บันทึกรหัสที่นำเข้าแล้วทั้งหมด (เก่า + ใหม่) ข้อความใหม่ยาวกว่าเดิมเสมอ จึงทับของเดิมได้หมดไม่เหลือเศษ
  function saveDone(oldKeys, newKeys) {
    if (!newKeys.length) return;
    try {
      var f = file(DONE);
      f.write(oldKeys.concat(newKeys).join("\n") + "\n");
      f.close();
    } catch (err) {
      log("save done: " + err);
    }
  }

  function findPatient(hn) {
    var ents = pt.entries();
    for (var i = 0; i < ents.length; i++) {
      if (Number(ents[i].field("HN")) === Number(hn)) return ents[i];
    }
    return null;
  }

  function parseDate(s) {
    var r = String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return r ? my.date(new Date(Number(r[3]), Number(r[2]) - 1, Number(r[1]))) : null;
  }

  function isDuplicate(ptent, date, dx) {
    return cs.entries().some(function (v) {
      var l = v.field("Patient");
      return l && l.length > 0 && l[0].id == ptent.id &&
        my.gdate(my.date(v.field("ConsultDate"))) == my.gdate(date) &&
        String(v.field("Dx")).trim() == dx.replace(/-|#/g, "").replace(/\s+/g, " ").trim();
    });
  }

  var doneKeys = readLines(DONE);
  var newKeys = [];
  var lines = readLines(PATH).filter(function (line) {
    var key;
    try { key = String(JSON.parse(line).t || line); } catch (err) { key = line; }
    if (doneKeys.indexOf(key) > -1 || newKeys.indexOf(key) > -1) return false;
    newKeys.push(key);
    return true;
  });
  if (!lines.length) {
    message("ไม่มี consult รอนำเข้า");
    return;
  }

  var made = [], skipped = [];
  lines.forEach(function (line) {
    var o;
    try { o = JSON.parse(line); } catch (err) { skipped.push("อ่านบรรทัดไม่ได้"); return; }
    var ptent = findPatient(o.hn);
    var date = parseDate(o.date);
    var dx = String(o.dx || "").trim();
    if (!ptent) { skipped.push("HN " + o.hn + " ไม่พบใน Patient"); return; }
    if (!date || !dx) { skipped.push("HN " + o.hn + " ไม่มีวันที่หรือ Dx"); return; }
    if (isDuplicate(ptent, date, dx)) { skipped.push("HN " + o.hn + " มีแล้ว"); return; }

    var last = cs.create(new Object());
    old.save.call(cso, last);
    last.set("ConsultDate", date);
    last.link("Patient", ptent);
    last.set("Dx", dx);
    if (ptent.field("Dr")) last.set("Dr", ptent.field("Dr"));
    // PastHx = ประวัติผ่าตัดเดิม (แบบ fill.pasthx) + Dx อื่นจาก EMR
    var hx = [fill.sumpasthx(ptent, my.dateadd(date, -1)), o.pasthx].filter(Boolean).join("\n");
    if (hx) last.set("PastHx", hx);
    var vstype = fill.visittypebydx.call(cso, last);
    if (vstype) last.set("VisitType", vstype);

    trig.BeforeEdit.call(cso, last, "update");
    trig.AfterEdit.call(cso, last, "create");
    made.push(ptent.field("PtName") || ("HN " + o.hn));
  });

  saveDone(doneKeys, newKeys);
  var msg = "นำเข้า " + made.length + " ราย";
  if (made.length) msg += ": " + made.join(", ");
  if (skipped.length) msg += "\nข้าม " + skipped.length + ": " + skipped.join(", ");
  message(msg);
})();
