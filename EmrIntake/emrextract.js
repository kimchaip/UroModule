/*
emrextract.js : อ่านข้อความ EMR (หน้า Order) ที่ LINE แปลงจากภาพ
ใช้ใน Tasker action JavaScript โดยตัวแปร %txt = ข้อความ
ผลลัพธ์ (ตัวแปร Tasker):
  %name %hnx %agex %yearx %monthx %dayx %dob  -> ใช้กับ Add/edit entry Patient เดิม
  %cdate  วันที่ consult (d/m/yyyy ค.ศ.) จากบรรทัดใต้ "Create"
  %dxx    Final Dx ตัวแรก (ตัดรหัส ICD ในวงเล็บ [ ] ออก)
          (ชื่อตัวแปร Tasker ต้องยาวอย่างน้อย 3 ตัวอักษร จึงใช้ dxx ไม่ใช่ dx)
  %pasthx Final Dx ที่เหลือ + บรรทัด # ใน Progress note
  %jsonline 1 บรรทัด JSON สำหรับเขียนต่อท้าย consultInbox.json
*/
var prefix = ["นาย", "นาง", "นส.", "น.ส.", "mr.", "mrs.", "miss", "จสอ.","ร.ต.อ.","ร.ต.ท.","ร.ต.ต.","พ.จ.อ.", "ดต.", "ดช.","ด.ช.", "ดญ.", "ด.ญ.","จอ.","รต.","ส.ท.","พระ","นท.","พภ.","สณ.","พ.ท.","สอ.","นางสาว"];

var name = "";
var hnx = "";
var agex = "";
var yearx = "";
var monthx = "";
var dayx = "";
var dob = "";
var cdate = "";
var dxx = "";
var pasthx = "";
var jsonline = "";

var lines = txt.split(/\r?\n/).map(function (s) { return s.replace(/\s+/g, " ").trim(); }).filter(Boolean);

// HN
var m = txt.match(/HN\s*:?\s*(\d{3,})/i);
if (m) hnx = Number(m[1]);

// ชื่อ: หลัง "ชื่อ-สกุล :" (OCR อาจอ่านเป็น ซื่อ) ตัดส่วน HN ที่อยู่บรรทัดเดียวกันออก
m = txt.match(/[ชซ]ื่อ\s*-?\s*สกุล\s*:?\s*([^\n]+)/);
if (m) {
  name = m[1].replace(/HN\s*:?.*$/i, "").replace(/\s+/g, " ").trim();
  // ติดคำนำหน้ากับชื่อแบบเดียวกับ txtextract.js เช่น "นาย ทดสอบ" -> "นายทดสอบ"
  prefix.sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < prefix.length; i++) {
    if (name.toLowerCase().indexOf(prefix[i] + " ") == 0) {
      name = name.slice(0, prefix[i].length) + name.slice(prefix[i].length + 1);
      break;
    }
  }
}

// อายุ
m = txt.match(/อายุ\s*:?\s*(\d+)\s*ปี\s*(?:(\d+)\s*เดือน)?\s*(?:(\d+)\s*วัน)?/);
if (m) {
  yearx = Number(m[1]);
  monthx = Number(m[2] || 0);
  dayx = Number(m[3] || 0);
  agex = yearx + " ปี";
  var d = Math.round(yearx * 365.2425 + monthx * 30.4375 + dayx);
  var bd = new Date(Date.now() - d * 86400000);
  dob = bd.getDate() + "/" + (bd.getMonth() + 1) + "/" + bd.getFullYear();
}

// วันที่ consult: วันที่แรกหลังบรรทัด "Create" ถ้าไม่มีใช้วันที่แรกที่เจอ
function toDate(s) {
  var r = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!r) return "";
  var y = Number(r[3]);
  if (y < 100) y += 2500;      // 69 -> 2569
  if (y > 2400) y -= 543;      // พ.ศ. -> ค.ศ.
  return Number(r[1]) + "/" + Number(r[2]) + "/" + y;
}
var ci = lines.findIndex(function (l) { return /^create\b/i.test(l); });
for (var i = (ci > -1 ? ci : 0); i < lines.length && !cdate; i++) cdate = toDate(lines[i]);

// Final Dx: บรรทัดต่อจาก "Final Dx." จนถึงหัวข้อถัดไป
var dxs = [];
var fi = lines.findIndex(function (l) { return /^final\s*dx/i.test(l); });
if (fi > -1) {
  for (var j = fi + 1; j < lines.length; j++) {
    if (/^(order for|progress note|create|edit|confirm|print)/i.test(lines[j])) break;
    var t = lines[j].replace(/^[ㆍ•·\-\*・·]+\s*/, "").replace(/\s*\[[^\]]*\]\s*$/, "").trim();
    if (t) dxs.push(t);
  }
}

// บรรทัด # ใน Progress note (ต่อบรรทัดที่ OCR ตัดขึ้นบรรทัดใหม่)
var probs = [];
var stop = /^(plan|order|final\s*dx|progress note|lab|hct|vital|v\/s|create|edit|confirm)\b/i;
for (var k = 0; k < lines.length; k++) {
  if (/^#/.test(lines[k])) {
    var p = lines[k].replace(/^#+\s*/, "");
    while (k + 1 < lines.length && !/^#/.test(lines[k + 1]) && !stop.test(lines[k + 1]) && /^[a-z฀-๿]/.test(lines[k + 1])) {
      p += " " + lines[k + 1];
      k++;
    }
    probs.push(p.trim());
  }
}

dxx = dxs.length ? dxs[0] : (probs.length ? probs[0] : "");
pasthx = dxs.slice(1).concat(probs).filter(function (v) { return v != dxx; }).join("\n");

if (hnx && cdate) {
  jsonline = JSON.stringify({ hn: hnx, date: cdate, dx: dxx, pasthx: pasthx, name: name, t: Date.now() });
}
