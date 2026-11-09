// ===== McpCatchUp : ทำ trigger ที่ขาดไปของ entry ที่ Claude (uro-mcp) สร้างหรือแก้ =====
// การเขียนผ่าน Memento Cloud API ไม่ทำให้ trigger ทำงาน uro-mcp จึงเขียนคิวไว้ใน library McpQueue
// script นี้ไล่คิวที่ Done ยังไม่ติ๊ก แล้วเรียก trig.* ใน UroObj.js เหมือนตอนบันทึกในแอป
//
// ตั้งค่า: ใส่ใน trigger "Opening a library" (After window display) ของ UroBase, Consult, Patient
//         เลือก library MyDate.js, UroObj.js และเปิดสิทธิ์ Libraries
//
// ส่ง "update" ให้ BeforeEdit เสมอ เพราะ entry ถูกบันทึกไปแล้ว ถ้าส่ง "create"
// valid.uniqueHN / uniqueVisit / uniqueDxOp จะนับ entry ตัวเองเป็นข้อมูลซ้ำ
// (ค่าที่ทำเฉพาะตอน create เช่น setortype, setvisittype, fill.dr ดูจาก Previous ซึ่ง entry
//  จาก API ไม่มีอยู่แล้ว จึงไม่ทำงานทั้งสองแบบ)
(function () {
  var MAX_PER_RUN = 20;
  var map = {
    "UroBase":       { obj: uro, before: "BeforeEdit",        after: "AfterEdit" },
    "Backup":        { obj: buo, before: "BeforeEdit",        after: "AfterEdit" },
    "Consult":       { obj: cso, before: "BeforeEdit",        after: "AfterEdit" },
    "Patient":       { obj: pto, before: "PatientBeforeEdit", after: "PatientAfterEdit" },
    "FollowUp":      { obj: null, before: null,               after: "FollowUpAfterEdit" },
    "DxAutoFill":    { obj: dxo, before: "DxBeforeEdit",      after: "DxAfterEdit" },
    "OperationList": { obj: opo, before: "OpListBeforeEdit",  after: "OpListAfterEdit" },
    "Holidays":      { obj: null, before: "HDBeforeEdit",     after: "HDAfterEdit" }
  };

  var q;
  try { q = libByName("McpQueue"); } catch (err) { return; }
  if (!q) return;

  var pending = q.entries().filter(function (x) { return !x.field("Done"); });
  if (pending.length == 0) return;
  // ทำตามลำดับที่ Claude เขียน (เช่น Patient ก่อน Consult ของคนนั้น)
  pending.sort(function (a, b) { return a.creationTime - b.creationTime; });

  // validator ใน UroObj.js เรียก message() + cancel() + exit() ซึ่งจะหยุด script ทั้งตัว
  // ระหว่างทำคิวจึงเปลี่ยนให้เก็บข้อความไว้แล้ว throw แทน เพื่อทำคิวถัดไปต่อได้
  var realMessage = message, realCancel = cancel, realExit = exit;
  var lastMsg = "";
  function McpStop() {}
  message = function (t) { lastMsg = String(t); };
  cancel = function () {};
  exit = function () { throw new McpStop(); };

  var ok = 0, failed = [], waiting = 0;
  try {
    for (var i = 0; i < pending.length && i < MAX_PER_RUN; i++) {
      var qe = pending[i];
      var libName = qe.field("Library");
      var id = qe.field("EntryId");
      var action = qe.field("Action") == "create" ? "create" : "update";
      var m = map[libName];
      if (!m) {
        qe.set("Note", "ไม่รองรับ library " + libName);
        qe.set("Done", true);
        failed.push(libName + ": ไม่รองรับ");
        continue;
      }
      var e = null;
      try { e = libByName(libName).findById(id); } catch (err) { e = null; }
      if (!e) {
        // entry อาจยัง sync มาไม่ถึงเครื่องนี้ รอรอบหน้า
        waiting++;
        qe.set("Note", "ยังไม่เจอ entry " + new Date().toISOString());
        continue;
      }
      // ติ๊ก Done ก่อน ถ้า script หยุดกลางทาง Note จะค้างเป็น "กำลังทำ" ให้เห็น
      qe.set("Done", true);
      qe.set("Note", "กำลังทำ " + new Date().toISOString());
      lastMsg = "";
      try {
        var value = libName == "Holidays" ? action : "update";
        if (m.before) trig[m.before].call(m.obj, e, value);
        trig[m.after].call(m.obj, e, action);
        qe.set("Note", "ok " + new Date().toISOString());
        ok++;
      }
      catch (err) {
        var why = err instanceof McpStop ? lastMsg : String(err);
        qe.set("Note", "ต้องแก้เอง: " + why);
        failed.push(libName + " " + e.title + ": " + why);
        log("McpCatchUp " + libName + " " + id + ": " + why);
      }
    }
  }
  finally {
    message = realMessage;
    cancel = realCancel;
    exit = realExit;
  }

  var left = pending.length - Math.min(pending.length, MAX_PER_RUN);
  var text = "Claude: ทำ trigger ที่ค้าง " + ok + " รายการ";
  if (waiting) text += ", รอ sync " + waiting;
  if (left) text += ", เหลือ " + left + " (เปิดใหม่เพื่อทำต่อ)";
  if (failed.length) text += "\nต้องเปิดแก้เอง: " + failed.join("; ");
  message(text);
})();
