// ===== UroBase / Consult / Backup : เปลี่ยนรูปใน Photo ของ entry ที่เลือกเป็นรูปที่ย่อแล้ว (Action ระดับ entry) =====
// ขั้นที่ 3 แบบทดลองทีละ entry
//   - หารูปชื่อเดียวกันใน /Workload/PhotoSmall/ (ย่อด้วย ResizePhotos.ps1 บนคอม แล้วคัดลอกมาที่มือถือ)
//   - เปลี่ยนเฉพาะรูปที่เจอไฟล์ย่อ รูปที่ไม่เจอคงไว้เหมือนเดิม
//   - บันทึก path เดิมไว้ใน photoswap_log.txt (/Workload) บรรทัดละ entry เพื่อย้อนกลับได้
// ไม่ต้องเลือก JavaScript library ใดๆ ในหน้า script
(function () {
  var FIELD = "Photo";
  var DIR = "PhotoSmall/";                                   // relative to Memento's default folder (/Workload)
  var SMALL = "/storage/emulated/0/Workload/" + DIR;          // full path stored in the Photo field
  var probe = [];
  // file() API: exists / length may be properties or methods depending on version, so accept both
  var hasFile = function (path) {
    try {
      var f = file(path);
      var ex = f.exists;
      if (typeof ex === "function") ex = f.exists();
      var len = f.length;
      if (typeof len === "function") len = f.length();
      try { f.close(); } catch (err) {}
      if (probe.length < 2) probe.push(path + " exists=" + ex + " length=" + len);
      return String(ex) === "true" || Number(len) > 0;
    }
    catch (err) {
      if (probe.length < 2) probe.push(path + " error=" + err);
      return false;
    }
  };
  var e = entry();
  var old = e.field(FIELD);
  if (!old || old.length === 0) {
    message("entry นี้ไม่มีรูปใน " + FIELD);
    return;
  }
  var oldList = [], next = [], swapped = 0, missing = [];
  for (var i = 0; i < old.length; i++) {
    var p = String(old[i]);
    oldList.push(p);
    var name = decodeURIComponent(p.replace(/^.*\//, ""));
    var small = SMALL + name;
    var exists = hasFile(DIR + name) || hasFile(small);
    if (exists) {
      next.push("file://" + small);
      swapped++;
    }
    else {
      next.push(p);
      missing.push(name);
    }
  }
  if (swapped === 0) {
    var detail = "ตรวจ: " + probe.join(" | ");
    var full = "PhotoSwap ไม่พบรูปย่อ " + missing.length + " รูป: " + missing.join(", ") + "\n" + detail + "\n";
    // also written to a file: log() is not available in every Memento script context
    try { var cf = file("photoswap_check.txt"); cf.write(full + "\n\n\n\n\n\n\n\n"); cf.close(); } catch (err) {}
    if (typeof log === "function") log(full);
    message(detail + "\nไม่พบรูปย่อ " + missing.length + " รูป (รายละเอียดใน Workload/photoswap_check.txt)");
    return;
  }
  try {
    var logFile = file("photoswap_log.txt");
    var text = "";
    try { text = String(logFile.readAll() || ""); } catch (err) { text = ""; }
    logFile.write(text + JSON.stringify({ "at": new Date().toISOString(), "id": e.id, "field": FIELD, "old": oldList }) + "\n");
    logFile.close();
  }
  catch (err) {
    message("เขียน log ไม่ได้ จึงไม่เปลี่ยนรูป: " + err);
    return;
  }
  e.set(FIELD, next.join());
  message("เปลี่ยนรูป " + swapped + " / " + old.length + (missing.length ? "\nไม่พบรูปย่อ: " + missing.join(", ") : "") +
    "\nเปิด entry เพื่อดูว่ารูปขึ้นปกติ ถ้ารูปไม่ขึ้น ลอง Files > Find Missing Files แล้วเลือกโฟลเดอร์ Workload/PhotoSmall");
})();
