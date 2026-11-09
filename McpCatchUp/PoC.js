// ===== McpQueue : PoC ของ trigger "Opening a library" (ยังไม่แตะ library จริง) =====
// ใช้ทดสอบ 3 ข้อก่อนเขียน McpCatchUp จริง
//   1. trigger "Opening a library" ทำงานทุกครั้งที่เปิด McpQueue หรือไม่
//   2. e.set ใน trigger นี้บันทึกค่าจริง (ปิดแอปแล้วเปิดใหม่ / sync ขึ้น cloud แล้วค่ายังอยู่)
//   3. หา entry ของ library อื่นด้วย id ได้ (อ่านอย่างเดียว ไม่แก้)
// ไม่ต้องเลือก library MyDate.js / UroObj.js
(function () {
  var q = lib();
  var ents = q.entries();
  var done = 0, found = 0, missing = 0;
  for (var i = 0; i < ents.length; i++) {
    var e = ents[i];
    if (e.field("Done")) continue;
    var note = "poc " + new Date().toISOString();
    var libName = e.field("Library");
    var id = e.field("EntryId");
    if (libName && id) {
      try {
        var target = libByName(libName).findById(id);
        if (target) { found++; note += " found: " + target.title; }
        else { missing++; note += " not found"; }
      }
      catch (err) {
        missing++;
        note += " error: " + err;
      }
    }
    e.set("Note", note);
    e.set("Done", true);
    done++;
  }
  message("McpQueue PoC: ทำคิว " + done + " รายการ, หา entry เจอ " + found + ", ไม่เจอ " + missing);
})();
