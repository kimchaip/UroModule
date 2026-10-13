/*
emrextract.js : อ่านข้อความ EMR (หน้า Order) หรือใบ MOPH Refer ที่ LINE แปลงจากภาพ
ใช้ใน Tasker action JavaScript โดยตัวแปร %txt = ข้อความ
ผลลัพธ์ (ตัวแปร Tasker):
  %name %hnx %agex %yearx %monthx %dayx %dob  -> ใช้กับ Add/edit entry Patient เดิม
  %cdate  วันที่ consult (d/m/yyyy ค.ศ.) จากบรรทัดใต้ "Create"
  %dxx    Final Dx ตัวแรก (ตัดรหัส ICD ในวงเล็บ [ ] ออก)
          (ชื่อตัวแปร Tasker ต้องยาวอย่างน้อย 3 ตัวอักษร จึงใช้ dxx ไม่ใช่ dx)
  %pasthx Final Dx ที่เหลือ + บรรทัด # ใน Progress note
  %jsonline 1 บรรทัด JSON สำหรับเขียนต่อท้าย consultInbox.json
ใบ MOPH Refer: HN ใช้เลขของ รพ.เราในรูปแบบ "HN 200-66-58 (03)" -> 2006658
  (ไม่ใช้ "HN:" ของ รพ.ต้นทาง), ชื่อจากบรรทัด "ชื่อ ..." (สติกเกอร์ รพ.เรา)
  หรือหลัง "ขอส่งผู้ป่วยชื่อ", วันที่จาก "วันที่ 12 เดือน ตุลาคม พ.ศ. 2569",
  Dx จาก "IMP :", PastHx จาก "U/D :" และ "ประวัติผ่าตัด"
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

var refer = /MOPH\s*Refer|ระบบส่งตัวผู้ป่วย|แบบส่งต่อ/i.test(txt);

// ติดคำนำหน้ากับชื่อแบบเดียวกับ txtextract.js เช่น "นาย ทดสอบ" -> "นายทดสอบ"
function glueprefix(s) {
  s = s.replace(/\s+/g, " ").trim();
  prefix.sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < prefix.length; i++) {
    if (s.toLowerCase().indexOf(prefix[i] + " ") == 0) {
      return s.slice(0, prefix[i].length) + s.slice(prefix[i].length + 1);
    }
  }
  return s;
}

var m;
if (refer) {
  // HN ของ รพ.เรา เช่น "HN 200-66-58 (03)" -> 2006658
  m = txt.match(/HN\s*:?\s*(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{2})/i);
  if (m) hnx = Number(m[1] + m[2] + m[3]);
  // ชื่อ: บรรทัดที่ขึ้นต้นด้วย "ชื่อ" ถ้าไม่มีใช้หลัง "ขอส่งผู้ป่วยชื่อ"
  var nl = lines.find(function (l) { return /^[ชซ]ื่อ\s/.test(l); });
  if (nl) name = glueprefix(nl.replace(/^[ชซ]ื่อ\s*/, ""));
  else {
    m = txt.match(/ผู้ป่วยชื่อ\s*([^\n]+?)\s*HN/);
    if (m) name = glueprefix(m[1]);
  }
} else {
  // HN
  m = txt.match(/HN\s*:?\s*(\d{3,})/i);
  if (m) hnx = Number(m[1]);

  // ชื่อ: หลัง "ชื่อ-สกุล :" (OCR อาจอ่านเป็น ซื่อ) ตัดส่วน HN ที่อยู่บรรทัดเดียวกันออก
  m = txt.match(/[ชซ]ื่อ\s*-?\s*สกุล\s*:?\s*([^\n]+)/);
  if (m) name = glueprefix(m[1].replace(/HN\s*:?.*$/i, ""));
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
var thmonth = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
if (refer) {
  // "วันที่ 12 เดือน ตุลาคม พ.ศ. 2569"
  m = txt.match(/วันที่\s*(\d{1,2})\s*เดือน\s*([ก-๙]+)\s*พ\.?\s*ศ\.?\s*(\d{4})/);
  if (m && thmonth.indexOf(m[2]) > -1) cdate = Number(m[1]) + "/" + (thmonth.indexOf(m[2]) + 1) + "/" + (Number(m[3]) - 543);
} else {
  var ci = lines.findIndex(function (l) { return /^create\b/i.test(l); });
  for (var i = (ci > -1 ? ci : 0); i < lines.length && !cdate; i++) cdate = toDate(lines[i]);
}

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

// ใบ Refer: Dx จาก "IMP :", PastHx จาก "U/D :" และ "ประวัติผ่าตัด" (ต่อบรรทัดที่ OCR ตัด)
function after(re, more) {
  for (var a = 0; a < lines.length; a++) {
    var r = lines[a].match(re);
    if (r) {
      var v = r[1];
      while (a + 1 < lines.length && more.test(lines[a + 1])) v += " " + lines[++a];
      return v.replace(/\s+/g, " ").trim();
    }
  }
  return "";
}
if (refer) {
  var imp = after(/IMP\s*:?\s*(.*)$/i, /^[a-z]/);
  if (imp) dxs.push(imp);
  var ud = after(/U\/D\s*:?\s*(.*)$/i, /^[^\-#\d]/);
  if (ud) probs.push("U/D: " + ud.replace(/[\s,]+$/, ""));
  var sx = after(/ประวัติผ่าตัด\s*[=:]?\s*(.*)$/, /(?!)/);
  if (sx) probs.push("ประวัติผ่าตัด: " + sx);
}

dxx = dxs.length ? dxs[0] : (probs.length ? probs[0] : "");
pasthx = dxs.slice(1).concat(probs).filter(function (v) { return v != dxx; }).join("\n");

if (hnx && cdate) {
  jsonline = JSON.stringify({ hn: hnx, date: cdate, dx: dxx, pasthx: pasthx, name: name, t: Date.now() });
}
