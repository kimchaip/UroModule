// ===== UroBase / Consult / Backup : ทำรายการรูปในฟิลด์ Photo (Action ระดับ library ไม่ต้องเลือก entry) =====
// ขั้นที่ 1 ของการย่อรูปเก่า: อ่านอย่างเดียว ไม่แก้ entry ใดๆ
//   - เขียนไฟล์ photolist_<library>_<เวลา>.json ใน /Workload บรรทัดละ entry: {"id":..., "photos":[path, ...]}
//   - แสดงสรุปจำนวน entry และรูป แยกตามโฟลเดอร์ที่เก็บรูป เพื่อดูว่า Tasker เข้าถึงไฟล์ได้หรือไม่
// ไม่ต้องเลือก JavaScript library ใดๆ ในหน้า script
(function () {
  var FIELD = "Photo";
  var lb = lib();
  var ents = lb.entries();
  var lines = [];
  var folders = {};
  var nEntry = 0, nPhoto = 0, nErr = 0;
  for (var i = 0; i < ents.length; i++) {
    var e = ents[i];
    var v;
    try {
      v = e.field(FIELD);
    }
    catch (err) {
      nErr++;
      continue;
    }
    if (!v || v.length === 0) continue;
    var paths = [];
    for (var j = 0; j < v.length; j++) {
      var p = String(v[j]);
      paths.push(p);
      var dir = p.replace(/[^\/]*$/, "");
      folders[dir] = (folders[dir] || 0) + 1;
    }
    nEntry++;
    nPhoto += paths.length;
    lines.push(JSON.stringify({ "id": e.id, "photos": paths }));
  }

  var stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  var name = "photolist_" + lb.title + "_" + stamp + ".json";
  try {
    var f = file(name);
    f.write(lines.join("\n") + "\n");
    f.close();
  }
  catch (err) {
    message("เขียนไฟล์ไม่ได้: " + err);
    return;
  }

  var top = Object.keys(folders).sort(function (a, b) { return folders[b] - folders[a]; }).slice(0, 5);
  var where = top.map(function (d) { return d + " (" + folders[d] + ")"; }).join("\n");
  var msg = lb.title + ": entry ที่มีรูป " + nEntry + " / " + ents.length + ", รูปทั้งหมด " + nPhoto +
    (nErr ? ", อ่านฟิลด์ " + FIELD + " ไม่ได้ " + nErr + " entry" : "") +
    "\nไฟล์: " + name + "\nโฟลเดอร์ที่เก็บรูป:\n" + (where || "-");
  log(msg);
  message(msg);
})();
