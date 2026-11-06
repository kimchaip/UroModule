// ===== UroBase / Consult / Backup : ซ่อมรูปที่ยังชี้ไป Workload/PhotoSmall หลัง Find Missing Files (Action ระดับ library) =====
// ใช้หลัง PhotoSwapAll.js + Find Missing Files
// สาเหตุ: หลาย entry ใช้ไฟล์รูปเดียวกัน (เช่น เคสที่คัดลอกรูปมาจากเคสก่อน) Find Missing Files นำไฟล์เข้า Memento
// และเชื่อมให้ entry แรกเท่านั้น entry อื่นยังชี้ไป PhotoSmall จึงขึ้น EACCES
// สคริปต์นี้หา entry ที่รูปชื่อเดียวกันถูกนำเข้าแล้ว (path ไม่อยู่ใน PhotoSmall) แล้วใช้ path นั้นแทน
//   - เทียบชื่อไฟล์หลังถอดรหัส %20 เป็นช่องว่าง
//   - บันทึก path เดิมใน photoswap_log.txt ก่อนเปลี่ยน
// ไม่ต้องเลือก JavaScript library ใดๆ ในหน้า script
(function () {
  var FIELD = "Photo";
  var MARK = "/Workload/PhotoSmall/";
  var base = function (p) {
    var n = String(p).replace(/^.*\//, "");
    try { return decodeURIComponent(n); } catch (err) { return n; }
  };
  var lb = lib();
  var ents = lb.entries();
  var rows = [];
  var good = {};   // decoded name -> a path Memento can read (not in PhotoSmall)
  for (var i = 0; i < ents.length; i++) {
    var v;
    try { v = ents[i].field(FIELD); } catch (err) { continue; }
    if (!v || v.length === 0) continue;
    var ps = [];
    for (var j = 0; j < v.length; j++) {
      var p = String(v[j]);
      ps.push(p);
      if (p.indexOf(MARK) < 0 && !good[base(p)]) good[base(p)] = p;
    }
    rows.push({ e: ents[i], ps: ps });
  }

  var plan = [], logLines = [], nFix = 0, nLeft = 0, left = [];
  for (var r = 0; r < rows.length; r++) {
    var next = [], changed = false;
    for (var k = 0; k < rows[r].ps.length; k++) {
      var q = rows[r].ps[k];
      if (q.indexOf(MARK) >= 0) {
        var g = good[base(q)];
        if (g) { next.push(g); nFix++; changed = true; }
        else { next.push(q); nLeft++; if (left.length < 5) left.push(base(q)); }
      }
      else next.push(q);
    }
    if (!changed) continue;
    plan.push({ e: rows[r].e, value: next.join() });
    logLines.push(JSON.stringify({ "at": new Date().toISOString(), "lib": lb.title, "id": rows[r].e.id, "field": FIELD, "old": rows[r].ps, "by": "PhotoRelink" }));
  }
  if (plan.length === 0) {
    message("ไม่มีรูปที่ซ่อมได้ รูปที่ยังชี้ไป PhotoSmall " + nLeft + (left.length ? "\nเช่น " + left.join(", ") : ""));
    return;
  }
  try {
    var logFile = file("photoswap_log.txt");
    var text = "";
    try { text = String(logFile.readAll() || ""); } catch (err) { text = ""; }
    logFile.write(text + logLines.join("\n") + "\n");
    logFile.close();
  }
  catch (err) {
    message("เขียน log ไม่ได้ จึงไม่เปลี่ยนอะไร: " + err);
    return;
  }
  var fail = 0;
  for (var m = 0; m < plan.length; m++) {
    try { plan[m].e.set(FIELD, plan[m].value); } catch (err) { fail++; }
  }
  message(lb.title + ": ซ่อม " + nFix + " รูปใน " + (plan.length - fail) + " entry" + (fail ? ", ผิดพลาด " + fail : "") +
    "\nยังชี้ไป PhotoSmall " + nLeft + (left.length ? " เช่น " + left.join(", ") : "") +
    (nLeft ? "\nถ้ายังเหลือ ลอง Find Missing Files อีกครั้งแล้วรันซ้ำ" : ""));
})();
