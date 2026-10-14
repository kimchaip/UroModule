// ===== Patient : ตรวจ Report ให้ตรงกับ UroBase / Backup (Action ระดับ library ไม่ต้องเลือก entry) =====
// ตรวจคนไข้ทุกคนด้วย rpo.reconcile ใน UroObj.js
//   - Report ที่ตรงกับการผ่าตัด: อัปเดตค่าให้เป็นปัจจุบัน
//   - การผ่าตัดที่ไม่มี Report: ใช้ Report ค้างวันเดียวกัน หรือสร้างใหม่
//   - Report ที่ไม่มีการผ่าตัดคู่ หรือซ้ำ: ใส่ "1" ใน field Unmatch ของ Report (ไม่ลบ)
// ต้องมี field Unmatch (Text) ใน Report และเลือก library MyDate.js, UroObj.js ในหน้า script
(function () {
  var ents = pt.entries();
  var sum = {"refreshed":0, "updated":0, "created":0, "unmatch":0};
  for (var i = 0; i < ents.length; i++) {
    try {
      var r = rpo.reconcile(ents[i]);
      for (var k in sum) sum[k] += r[k];
    }
    catch (err) {
      log("reconcile " + ents[i].title + ": " + err);
    }
  }
  message("คนไข้ " + ents.length + " คน: Report ตรงอยู่แล้ว " + sum.refreshed + ", แก้ให้ตรง " + sum.updated + ", สร้างใหม่ " + sum.created + ", ไม่มีคู่ (Unmatch) " + sum.unmatch);
})();
