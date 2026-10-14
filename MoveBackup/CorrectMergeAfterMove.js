// ===== Patient : แก้ MergeID หลังย้าย (Action ระดับ library ไม่ต้องเลือก entry) =====
// อ่านรายชื่อจาก movedpatients.txt (จดโดย Action "จดคนไข้ก่อนย้าย" ใน UroBase)
// แก้ MergeID ทุก admission ของคนไข้เหล่านั้นใน UroBase, Backup, Consult ด้วย mer.correct
// เสร็จแล้วต่อท้ายไฟล์ด้วย "done" ครั้งต่อไปจะทำเฉพาะรายชื่อหลัง done
// (Memento ล้างไฟล์ไม่ได้ เพราะ write เขียนทับจากต้นไฟล์แต่ไม่ตัดส่วนเกิน)
// ต้องเลือก library UroObj.js และ MyDate.js ในหน้า script และเปิดสิทธิ์ Libraries / Read files / Write files
(function () {
  var PATH = "movedpatients.txt";

  var lines = [];
  try {
    var f = file(PATH);
    lines = String(f.readAll() || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    f.close();
  } catch (err) {
    lines = [];
  }
  var pending = lines.slice(lines.lastIndexOf("done") + 1);
  if (!pending.length) {
    message("ไม่มีคนไข้รอแก้ MergeID");
    return;
  }

  var fixed = 0, missing = 0;
  for (var i = 0; i < pending.length; i++) {
    var ptent = pt.findById(pending[i]);
    if (!ptent) { missing++; continue; }
    fixed += mer.correct(ptent);
  }

  var w = file(PATH);
  w.write(lines.concat(["done"]).join("\n") + "\n");
  w.close();
  message("คนไข้ " + pending.length + " คน: แก้ MergeID " + fixed + " admission" + (missing ? ", หา Patient ไม่เจอ " + missing + " คน" : ""));
})();
