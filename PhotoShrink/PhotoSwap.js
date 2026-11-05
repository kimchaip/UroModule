// ===== UroBase / Consult / Backup : เปลี่ยนรูปใน Photo ของ entry ที่เลือกเป็นรูปที่ย่อแล้ว (Action ระดับ entry) =====
// ขั้นที่ 3 แบบทดลองทีละ entry
//   - หารูปชื่อเดียวกันใน /Workload/PhotoSmall/ (ย่อด้วย ResizePhotos.ps1 บนคอม แล้วคัดลอกมาที่มือถือ)
//   - เปลี่ยนเฉพาะรูปที่เจอไฟล์ย่อ รูปที่ไม่เจอคงไว้เหมือนเดิม
//   - บันทึก path เดิมไว้ใน photoswap_log.txt (/Workload) บรรทัดละ entry เพื่อย้อนกลับได้
// ไม่ต้องเลือก JavaScript library ใดๆ ในหน้า script
(function () {
  var FIELD = "Photo";
  var SMALL = "/storage/emulated/0/Workload/PhotoSmall/";
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
    var exists = false;
    try {
      var f = file(small);
      exists = f.exists();
      f.close();
    }
    catch (err) {
      exists = false;
    }
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
    message("ไม่พบรูปย่อใน " + SMALL + " สำหรับ entry นี้\n" + missing.join("\n"));
    return;
  }
  try {
    var log = file("photoswap_log.txt");
    var text = "";
    try { text = String(log.readAll() || ""); } catch (err) { text = ""; }
    log.write(text + JSON.stringify({ "at": new Date().toISOString(), "id": e.id, "field": FIELD, "old": oldList }) + "\n");
    log.close();
  }
  catch (err) {
    message("เขียน log ไม่ได้ จึงไม่เปลี่ยนรูป: " + err);
    return;
  }
  e.set(FIELD, next.join());
  message("เปลี่ยนรูป " + swapped + " / " + old.length + (missing.length ? "\nไม่พบรูปย่อ: " + missing.join(", ") : "") +
    "\nเปิด entry เพื่อดูว่ารูปขึ้นปกติ ถ้ารูปไม่ขึ้น ลอง Files > Find Missing Files แล้วเลือกโฟลเดอร์ Workload/PhotoSmall");
})();
