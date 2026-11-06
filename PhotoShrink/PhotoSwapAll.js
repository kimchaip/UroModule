// ===== UroBase / Consult / Backup : เปลี่ยนรูปใน Photo ทุก entry เป็นรูปที่ย่อแล้ว (Action ระดับ library ไม่ต้องเลือก entry) =====
// ใช้หลังทดสอบ PhotoSwap.js กับ entry เดียวผ่านแล้ว
//   - อ่านรายชื่อรูปย่อจาก Workload/photosmall_list.txt (สร้างโดย ResizePhotos.ps1)
//   - เปลี่ยนเฉพาะรูปที่มีชื่ออยู่ในรายชื่อ รูปที่ไม่มี (เช่น heic หรือรูปที่เพิ่มหลังดาวน์โหลด) คงไว้
//   - เขียน path เดิมของทุก entry ลง photoswap_log.txt ก่อนเปลี่ยน ถ้าเขียนไม่ได้จะไม่เปลี่ยนอะไรเลย
//   - ข้าม entry ที่มีอยู่ใน photoswap_log.txt แล้ว จึงรันซ้ำได้
//   - เสร็จแล้วต้องทำ Files > Find Missing Files > เลือก Workload/PhotoSmall เพื่อให้ Memento ได้สิทธิ์อ่านไฟล์
// ไม่ต้องเลือก JavaScript library ใดๆ ในหน้า script
(function () {
  var FIELD = "Photo";
  var SMALL = "/storage/emulated/0/Workload/PhotoSmall/";
  var have = {};
  try {
    var lf = file("photosmall_list.txt");
    var lines = String(lf.readAll() || "").split(/\r?\n/);
    lf.close();
    for (var n = 0; n < lines.length; n++) if (lines[n].trim()) have[lines[n].trim()] = true;
  }
  catch (err) {
    message("ไม่พบ Workload/photosmall_list.txt");
    return;
  }

  // entries already swapped (in photoswap_log.txt) are skipped: after Find Missing Files their
  // paths point inside Memento again, so the path alone does not show they were done
  var doneIds = {};
  try {
    var dl = file("photoswap_log.txt");
    var dlines = String(dl.readAll() || "").split(/\r?\n/);
    dl.close();
    for (var d = 0; d < dlines.length; d++) {
      try { if (dlines[d].trim()) doneIds[JSON.parse(dlines[d]).id] = true; } catch (err) {}
    }
  }
  catch (err) {}

  var lb = lib();
  var ents = lb.entries();
  var plan = [], logLines = [];
  var nPhoto = 0, nSwap = 0, nKeep = 0, nDone = 0;
  for (var i = 0; i < ents.length; i++) {
    var e = ents[i];
    if (doneIds[e.id]) continue;
    var v;
    try { v = e.field(FIELD); } catch (err) { continue; }
    if (!v || v.length === 0) continue;
    var oldList = [], next = [], changed = false;
    for (var j = 0; j < v.length; j++) {
      var p = String(v[j]);
      oldList.push(p);
      nPhoto++;
      var name = decodeURIComponent(p.replace(/^.*\//, ""));
      if (p.indexOf("/Workload/PhotoSmall/") >= 0) {
        next.push(p);
        nDone++;
      }
      else if (have[name] === true) {
        next.push("file://" + SMALL + name);
        nSwap++;
        changed = true;
      }
      else {
        next.push(p);
        nKeep++;
      }
    }
    if (!changed) continue;
    plan.push({ e: e, value: next.join() });
    logLines.push(JSON.stringify({ "at": new Date().toISOString(), "lib": lb.title, "id": e.id, "field": FIELD, "old": oldList }));
  }
  if (plan.length === 0) {
    message("ไม่มีรูปที่ต้องเปลี่ยน (รูปทั้งหมด " + nPhoto + ", เปลี่ยนไปแล้ว " + nDone + ", ไม่มีรูปย่อ " + nKeep + ")");
    return;
  }

  try {
    var logFile = file("photoswap_log.txt");
    var text = "";
    try { text = String(logFile.readAll() || ""); } catch (err) { text = ""; }
    logFile.write(text + logLines.join("\n") + "\n");
    logFile.close();
  }
  catch (err) {
    message("เขียน log ไม่ได้ จึงไม่เปลี่ยนรูป: " + err);
    return;
  }

  var fail = 0;
  for (var k = 0; k < plan.length; k++) {
    try { plan[k].e.set(FIELD, plan[k].value); } catch (err) { fail++; }
  }
  message(lb.title + ": เปลี่ยนรูป " + nSwap + " รูปใน " + (plan.length - fail) + " entry" +
    (fail ? ", ผิดพลาด " + fail + " entry" : "") +
    "\nเปลี่ยนไปแล้วก่อนหน้า " + nDone + ", ไม่มีรูปย่อ (คงเดิม) " + nKeep +
    "\nต่อไป: Files > Find Missing Files > เลือก Workload/PhotoSmall");
})();
