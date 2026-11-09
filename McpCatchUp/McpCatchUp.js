// ===== McpCatchUp : ทำ trigger ที่ขาดไปของ entry ที่ Claude (uro-mcp) สร้างหรือแก้ =====
// การเขียนผ่าน Memento Cloud API ไม่ทำให้ trigger ทำงาน uro-mcp จึงใส่ "_mcp": "create" | "update"
// ลงใน field Previous ของ entry (เก็บค่าเดิมใน Previous ไว้ด้วย) เครื่องหมายนี้มากับการ sync ของ library เอง
// script นี้หา entry ที่มีเครื่องหมายใน library ที่เปิด แล้วเรียก trig.* ใน UroObj.js เหมือนตอนบันทึกในแอป
//
// ตั้งค่า: ใส่ใน trigger "Opening a library" (After window display) ของ UroBase, Consult, Patient,
//         Backup, DxAutoFill, OperationList, FollowUp (ใช้โค้ดเดียวกัน)
//         เลือก library MyDate.js, UroObj.js และเปิดสิทธิ์ Libraries
//
// ส่ง "update" ให้ BeforeEdit เสมอ เพราะ entry ถูกบันทึกไปแล้ว ถ้าส่ง "create"
// valid.uniqueHN / uniqueVisit / uniqueDxOp จะนับ entry ตัวเองเป็นข้อมูลซ้ำ
// ก่อนเรียก trigger จะเอาเครื่องหมายออกจาก Previous ก่อน entry ที่ Claude สร้าง Previous จึงว่าง
// เหมือน entry ใหม่ในแอป และ entry ที่แก้ยังมีค่าเดิมให้ trigger เทียบว่าค่าไหนเปลี่ยน
(function () {
  var DAYS = 30;          // ดูเฉพาะ entry ที่ถูกแก้ภายในกี่วัน
  var MAX_PER_RUN = 30;
  var FOLLOWUP_DAYS = 3;  // FollowUp ไม่มี Previous: sync Report ของคนไข้ที่มี FollowUp แก้ภายในกี่วัน
  var map = {
    "UroBase":       { obj: uro, before: "BeforeEdit",        after: "AfterEdit" },
    "Backup":        { obj: buo, before: "BeforeEdit",        after: "AfterEdit" },
    "Consult":       { obj: cso, before: "BeforeEdit",        after: "AfterEdit" },
    "Patient":       { obj: pto, before: "PatientBeforeEdit", after: "PatientAfterEdit" },
    "DxAutoFill":    { obj: dxo, before: "DxBeforeEdit",      after: "DxAfterEdit" },
    "OperationList": { obj: opo, before: "OpListBeforeEdit",  after: "OpListAfterEdit" }
  };
  var lb = lib();
  var name = lb.title;
  var now = new Date().getTime();

  if (name == "FollowUp") {
    var since = now - FOLLOWUP_DAYS * 86400000;
    var seen = {}, n = 0;
    lb.entries().forEach(function (f) {
      if (f.lastModifiedTime.getTime() < since) return;
      var p = f.field("Patient");
      if (p.length == 0 || seen[p[0].id]) return;
      seen[p[0].id] = true;
      try { rpo.syncPatient(p[0]); n++; }
      catch (err) { log("McpCatchUp FollowUp " + p[0].title + ": " + err); }
    });
    return;
  }

  var m = map[name];
  if (!m) return;
  var since = now - DAYS * 86400000;
  var marked = lb.entries().filter(function (e) {
    if (e.lastModifiedTime.getTime() < since) return false;
    var p = e.field("Previous");
    return p && String(p).indexOf('"_mcp"') >= 0;
  });
  if (marked.length == 0) return;
  // ทำตามลำดับที่ Claude เขียน
  marked.sort(function (a, b) { return a.lastModifiedTime - b.lastModifiedTime; });

  // validator ใน UroObj.js เรียก message() + cancel() + exit() ซึ่งจะหยุด script ทั้งตัว
  // ระหว่างทำจึงเปลี่ยนให้เก็บข้อความไว้แล้ว throw แทน เพื่อทำ entry ถัดไปต่อได้
  var realMessage = message, realCancel = cancel, realExit = exit;
  var lastMsg = "";
  function McpStop() {}
  message = function (t) { lastMsg = String(t); };
  cancel = function () {};
  exit = function () { throw new McpStop(); };

  var ok = 0, failed = [];
  try {
    for (var i = 0; i < marked.length && i < MAX_PER_RUN; i++) {
      var e = marked[i];
      var action = "update";
      // เอาเครื่องหมายออกก่อน: ถ้า trigger ไม่ผ่าน จะไม่ถูกทำซ้ำทุกครั้งที่เปิด ให้แก้เองในแอป
      try {
        var d = JSON.parse(e.field("Previous"));
        if (d._mcp == "create") action = "create";
        delete d._mcp;
        e.set("Previous", Object.keys(d).length > 0 ? JSON.stringify(d) : "");
      }
      catch (err) {
        e.set("Previous", "");
      }
      lastMsg = "";
      try {
        trig[m.before].call(m.obj, e, "update");
        trig[m.after].call(m.obj, e, action);
        ok++;
      }
      catch (err) {
        var why = err instanceof McpStop ? lastMsg : String(err);
        failed.push(e.title + ": " + why);
        log("McpCatchUp " + name + " " + e.id + ": " + why);
      }
    }
  }
  finally {
    message = realMessage;
    cancel = realCancel;
    exit = realExit;
  }

  var left = marked.length - Math.min(marked.length, MAX_PER_RUN);
  var text = "Claude: ทำ trigger ที่ค้างใน " + name + " " + ok + " รายการ";
  if (left) text += ", เหลือ " + left + " (เปิดใหม่เพื่อทำต่อ)";
  if (failed.length) text += "\nต้องเปิดแก้เอง: " + failed.join("; ");
  message(text);
})();
