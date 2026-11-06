// ===== UroBase / Consult / Backup : ทำรายการไฟล์ในทุกฟิลด์รูป/ไฟล์ (Action ระดับ library ไม่ต้องเลือก entry) =====
// ขั้นที่ 1 ของการย่อรูปเก่า: อ่านอย่างเดียว ไม่แก้ entry ใดๆ
//   - หาฟิลด์ที่ค่าเป็นรายการ path แบบ file:// (ฟิลด์รูปหรือไฟล์) ทุกฟิลด์ ไม่ใช่แค่ Photo
//   - เขียนไฟล์ photolist_<library>_<เวลา>.json ใน /Workload บรรทัดละ entry: {"id":..., "fields":{ชื่อฟิลด์:[path, ...]}}
//   - แสดงสรุปจำนวนไฟล์แยกตามฟิลด์ และนามสกุลไฟล์
// ไม่ต้องเลือก JavaScript library ใดๆ ในหน้า script
(function () {
  var lb = lib();
  var names = lb.fields();
  var ents = lb.entries();
  var isFiles = function (v) {
    if (!v || typeof v === "string" || typeof v.length !== "number" || v.length === 0) return false;
    return /^(file|content):\/\//.test(String(v[0]));
  };
  var lines = [];
  var perField = {}, perExt = {};
  var nEntry = 0, nFile = 0;
  for (var i = 0; i < ents.length; i++) {
    var e = ents[i];
    var found = {}, any = false;
    for (var k = 0; k < names.length; k++) {
      var v;
      try { v = e.field(names[k]); } catch (err) { continue; }
      if (!isFiles(v)) continue;
      var paths = [];
      for (var j = 0; j < v.length; j++) {
        var p = String(v[j]);
        paths.push(p);
        var m = p.match(/\.([A-Za-z0-9]+)$/);
        var x = m ? m[1].toLowerCase() : "?";
        perExt[x] = (perExt[x] || 0) + 1;
      }
      found[names[k]] = paths;
      perField[names[k]] = (perField[names[k]] || 0) + paths.length;
      nFile += paths.length;
      any = true;
    }
    if (!any) continue;
    nEntry++;
    lines.push(JSON.stringify({ "id": e.id, "fields": found }));
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

  var list = function (o) {
    return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).map(function (k) { return k + " " + o[k]; }).join(", ");
  };
  var msg = lb.title + ": entry ที่มีไฟล์ " + nEntry + " / " + ents.length + ", ไฟล์ทั้งหมด " + nFile +
    "\nแยกตามฟิลด์: " + (list(perField) || "-") +
    "\nนามสกุล: " + (list(perExt) || "-") +
    "\nไฟล์: " + name;
  log(msg);
  message(msg);
})();
