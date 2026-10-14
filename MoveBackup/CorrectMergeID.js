// ===== UroBase / Backup / Consult : correctMergeID (Action, เลือก entry แล้วกด) =====
// แก้ MergeID ของคนไข้ใน entry ที่เลือก ใช้เมื่อไม่ได้จดรายชื่อก่อนย้าย
// เรียก mer.correct ทีละคนไข้ (ไม่ซ้ำ) แก้ทุก admission ของคนไข้นั้นใน UroBase, Backup, Consult
// ต้องเลือก library UroObj.js และ MyDate.js ในหน้า script
(function () {
  var sel = selectedEntries();
  var done = [];
  var fixed = 0;
  for (var i = 0; i < sel.length; i++) {
    var link = sel[i].field("Patient");
    if (link.length > 0 && done.indexOf(link[0].id) < 0) {
      done.push(link[0].id);
      var ptent = pt.findById(link[0].id);
      if (ptent) fixed += mer.correct(ptent);
    }
  }
  message("คนไข้ " + done.length + " คน: แก้ MergeID " + fixed + " admission");
})();
