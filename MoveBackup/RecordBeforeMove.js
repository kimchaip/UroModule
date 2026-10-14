// ===== UroBase : จดคนไข้ก่อนย้าย (Action, เลือก entry ที่จะย้ายแล้วกด) =====
// ใช้ก่อนย้าย entry จาก UroBase ไป Backup ด้วยคำสั่ง Move ของ Memento
// จด id ของ Patient (ไม่เปลี่ยนตอนย้าย) ต่อท้ายไฟล์ movedpatients.txt
// หลังย้ายแล้วให้กด Action "แก้ MergeID หลังย้าย" ใน library Patient
// ต้องเลือก library UroObj.js และ MyDate.js ในหน้า script และเปิดสิทธิ์ Read files / Write files
(function () {
  var PATH = "movedpatients.txt";

  function readLines() {
    try {
      var f = file(PATH);
      var text = String(f.readAll() || "");
      f.close();
      return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    } catch (err) {
      return [];
    }
  }

  var lines = readLines();
  // รายชื่อที่ยังไม่ได้แก้ = บรรทัดหลัง "done" อันสุดท้าย
  var pending = lines.slice(lines.lastIndexOf("done") + 1);
  var added = [];
  var sel = selectedEntries();
  for (var i = 0; i < sel.length; i++) {
    var link = sel[i].field("Patient");
    if (link.length > 0) {
      var id = String(link[0].id);
      if (pending.indexOf(id) < 0 && added.indexOf(id) < 0) added.push(id);
    }
  }
  if (added.length) {
    // ข้อความใหม่ยาวกว่าเดิมเสมอ จึงเขียนทับของเดิมได้หมดไม่เหลือเศษ
    var f = file(PATH);
    f.write(lines.concat(added).join("\n") + "\n");
    f.close();
  }
  message("จดคนไข้ " + added.length + " คน (รอแก้ทั้งหมด " + (pending.length + added.length) + " คน)");
})();
