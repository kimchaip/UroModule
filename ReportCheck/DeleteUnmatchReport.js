// ===== Report : ลบ Report ที่ไม่มีการผ่าตัดคู่ (Action, เลือก entry แล้วกด) =====
// ลบ (ย้ายไปถังขยะ) เฉพาะ entry ที่เลือกและมี Unmatch = 1 จาก Action "ตรวจ Report" ใน Patient
// ควร filter Report ด้วย Unmatch = 1 แล้วตรวจก่อนเลือก
(function () {
  var sel = selectedEntries();
  var n = 0;
  for (var i = 0; i < sel.length; i++) {
    if (String(sel[i].field("Unmatch") || "") == "1") {
      sel[i].trash();
      n++;
    }
  }
  message("ลบ Report ที่ไม่มีคู่ " + n + " จาก " + sel.length + " รายการที่เลือก");
})();
