/*
outcomeextract.js : อ่านข้อความผล patho / CT-KUB-US-MRI / PSA ที่ LINE แปลงจากภาพ
ใช้ใน Tasker action JavaScript โดยตัวแปร %txt = ข้อความ (แบบเดียวกับ emrextract.js)
ผลลัพธ์ (ตัวแปร Tasker):
  %hnx      HN
  %otype    patho | imaging | psa | lab  (Memento ใส่เป็น Type ใน FollowUp: Patho, CT/US/KUB/MRI/IVP, PSA, Lab)
  %odate    วันที่ของผล (d/m/yyyy ค.ศ.)
  %osum     สรุปสั้นๆ ไว้แสดงใน Notify ให้ดูว่าอ่านถูกไหม
  %jsonline 1 บรรทัด JSON สำหรับเขียนต่อท้ายไฟล์ outcomeInbox.json
            {"hn":..,"type":..,"date":"d/m/yyyy","d":{ค่าที่อ่านได้},"t":..}
ค่าที่อ่านได้ต้องให้หมอตรวจเสมอ ใบรายงานหลายใบไม่ได้เขียน TNM หรือ cell type ตรงๆ
ค่าที่เดาจากคำบรรยาย (เช่น invade muscularis propria -> T2) ใส่ไว้ใน tGuess ไม่ใช่ pT
*/
var hnx = "";
var otype = "";
var odate = "";
var osum = "";
var jsonline = "";

function clean(s) { return String(s || "").replace(/[​ ]/g, " "); }
function num(s) { return s === undefined || s === null || s === "" ? undefined : Number(String(s).replace(",", ".")); }
function first(re, s, i) { var m = s.match(re); return m ? m[i === undefined ? 1 : i] : undefined; }

var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  "ม.ค.": 1, "ก.พ.": 2, "มี.ค.": 3, "เม.ย.": 4, "พ.ค.": 5, "มิ.ย.": 6, "ก.ค.": 7, "ส.ค.": 8, "ก.ย.": 9, "ต.ค.": 10, "พ.ย.": 11, "ธ.ค.": 12 };

// d/m/yy(yy), d-m-yyyy, 12 Mar 2024, 12-Mar-24, 12 มี.ค. 67 -> "d/m/yyyy" ค.ศ.
function toDate(s) {
  s = clean(s);
  var y, mo, d, r = s.match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/);
  if (r) { d = Number(r[1]); mo = Number(r[2]); y = Number(r[3]); }
  else {
    r = s.match(/(\d{1,2})\s*[\-\s]\s*([A-Za-z]{3}|[ก-๙]{1,3}\.[ก-๙]{1,2}\.)[A-Za-z]*\s*[\-\s,]\s*(\d{2,4})/);
    if (!r) return "";
    d = Number(r[1]); mo = MONTHS[r[2].toLowerCase()]; y = Number(r[3]);
    if (!mo) return "";
  }
  if (y < 100) y += y > 40 ? 2500 : 2000;   // 67 -> 2567, 24 -> 2024
  if (y > 2400) y -= 543;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  return d + "/" + mo + "/" + y;
}

// วันที่ของผล: บรรทัดที่มีคำเหล่านี้ก่อน ถ้าไม่มีใช้วันที่แรกที่เจอ
function reportDate(lines, keys) {
  for (var i = 0; i < lines.length; i++) {
    var k = lines[i].match(keys);
    if (k) {
      // วันที่หลังคำนั้น (บรรทัดเดียวอาจมีหลายวันที่ เช่น Received ... Report ...)
      var v = toDate(lines[i].slice(k.index)) || (i + 1 < lines.length ? toDate(lines[i + 1]) : "");
      if (v) return v;
    }
  }
  for (var j = 0; j < lines.length; j++) { var w = toDate(lines[j]); if (w) return w; }
  return "";
}

// ข้อความใต้หัวข้อ (DIAGNOSIS / IMPRESSION) จนถึงหัวข้อถัดไป
function section(lines, head, stop) {
  var out = [], on = false;
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    if (!on && head.test(l)) { on = true; l = l.replace(head, "").replace(/^\s*[:\-]\s*/, ""); }
    else if (on && stop.test(l)) break;
    if (on && l) out.push(l);
  }
  return out.join(" ").replace(/\s+/g, " ").trim().slice(0, 600);
}

function sideOf(s) {
  if (/bilat|both/i.test(s)) return "Bilat";
  if (/\b(right|rt)\b|ขวา/i.test(s)) return "Rt";
  if (/\b(left|lt)\b|ซ้าย/i.test(s)) return "Lt";
  return undefined;
}

// ---------------- patho ----------------
function parsePatho(t, lines) {
  var d = {};
  var dx = section(lines, /^(final\s*)?diagnosis|^pathologic(al)? diagnosis/i, /^(gross|microscopic|comment|clinical|specimen received|note|pathologist|synoptic)/i);
  var s = dx || t;
  d.text = dx || undefined;
  d.no = first(/(?:surgical|patho(?:logy)?|accession|lab)\s*(?:no|number|#)\.?\s*:?\s*([A-Z]{1,3}\s*-?\s*\d{2}\s*-?\s*\d{2,6})/i, t);
  d.organ = first(/\b(prostate|urinary bladder|bladder|kidney|renal pelvis|ureter|testis|penis|urethra|adrenal)\b/i, s);
  if (d.organ) d.organ = d.organ.toLowerCase().replace("urinary ", "");
  d.side = sideOf(first(/(right|left|rt\.?|lt\.?|bilateral)\s*(kidney|ureter|testis|adrenal|renal)/i, s, 0) || "");
  d.specimen = first(/\b(needle biopsy|core biopsy|biopsy|TURBT|transurethral resection|TURP|radical prostatectomy|radical nephrectomy|partial nephrectomy|nephroureterectomy|nephrectomy|cystectomy|orchiectomy|penectomy)\b/i, s);

  var cells = [
    [/clear cell renal cell carcinoma|clear cell RCC|ccRCC/i, "clear cell RCC"],
    [/papillary renal cell carcinoma|papillary RCC/i, "papillary RCC"],
    [/chromophobe/i, "chromophobe RCC"],
    [/renal cell carcinoma|\bRCC\b/i, "RCC"],
    [/urothelial carcinoma|transitional cell carcinoma|\bTCC\b/i, "urothelial carcinoma"],
    [/squamous cell carcinoma/i, "squamous cell carcinoma"],
    [/acinar adenocarcinoma|adenocarcinoma/i, "adenocarcinoma"],
    [/small cell carcinoma|neuroendocrine carcinoma/i, "neuroendocrine carcinoma"],
    [/seminoma/i, "seminoma"],
    [/germ cell tumou?r|embryonal|yolk sac|teratoma|choriocarcinoma/i, "non-seminoma GCT"],
    [/oncocytoma/i, "oncocytoma"],
    [/angiomyolipoma/i, "angiomyolipoma"],
    [/carcinoma in situ|\bCIS\b/i, "CIS"],
    [/nodular hyperplasia|benign prostatic hyperplasia|\bBPH\b/i, "BPH"],
    [/negative for malignancy|no evidence of malignancy|no malignancy|benign/i, "benign"],
    [/inflammation|cystitis|pyelonephritis|prostatitis/i, "inflammation"]
  ];
  for (var i = 0; i < cells.length; i++) { if (cells[i][0].test(s)) { d.cell = cells[i][1]; break; } }
  if (/variant|differentiation|sarcomatoid|plasmacytoid|micropapillary|nested/i.test(s))
    d.variant = first(/((?:squamous|glandular|sarcomatoid|plasmacytoid|micropapillary|nested)[a-z ]{0,20}(?:variant|differentiation|features)?)/i, s);

  var gl = s.match(/gleason\s*(?:score)?\s*:?\s*(\d)\s*\+\s*(\d)/i);
  if (gl) d.gleason = gl[1] + "+" + gl[2];
  d.gg = num(first(/grade\s*group\s*:?\s*(\d)/i, s));
  if (!d.gg && gl) {
    var a = Number(gl[1]), b = Number(gl[2]), sum = a + b;
    d.gg = sum <= 6 ? 1 : sum == 7 ? (a == 3 ? 2 : 3) : sum == 8 ? 4 : 5;
  }
  d.isup = num(first(/(?:WHO\s*\/\s*)?ISUP\s*(?:nucleolar\s*)?grade\s*:?\s*(\d)|fuhrman\s*(?:nuclear\s*)?grade\s*:?\s*(\d)/i, s));
  if (/high[\s\-]*grade/i.test(s)) d.grade = "high";
  else if (/low[\s\-]*grade/i.test(s)) d.grade = "low";

  d.pT = first(/\b(y?p?T(?:is|a|x|[0-4][a-c]?))\b/, s);
  d.pN = first(/\b(y?p?N(?:x|[0-3][a-c]?))\b/, s);
  if (d.pT && !/^y?p/.test(d.pT)) d.pT = "p" + d.pT;
  if (d.pN && !/^y?p/.test(d.pN)) d.pN = "p" + d.pN;
  // เดา T จากคำบรรยาย (ต้องตรวจ)
  if (!d.pT) {
    if (/(invad|invasion)[a-z ]{0,30}(muscularis propria|detrusor)/i.test(s) && !/no (invasion|invad)[a-z ]{0,30}muscularis propria/i.test(s)) d.tGuess = ">=T2";
    else if (/(invad|invasion)[a-z ]{0,30}(lamina propria|subepithelial)/i.test(s) && !/no (invasion|invad)/i.test(s)) d.tGuess = "T1";
    else if (/non[\s\-]*invasive|no (evidence of )?invasion/i.test(s) && d.cell == "urothelial carcinoma") d.tGuess = "Ta";
    else if (/extraprostatic extension[^.]{0,20}(present|identified)/i.test(t)) d.tGuess = "T3a";
  }
  // TURBT: มีกล้ามเนื้อ (muscularis propria) ในชิ้นเนื้อไหม
  if (/muscularis propria[^.]{0,30}(not (present|identified|seen)|absent)|no muscularis propria/i.test(t)) d.mp = "absent";
  else if (/muscularis propria[^.]{0,30}(present|identified)/i.test(t)) d.mp = "present";

  var mg = t.match(/margins?[^.\n]{0,50}?(free|negative|uninvolved|not involved|clear|involved|positive)/i);
  if (mg) d.margin = /free|negative|uninvolved|not involved|clear/i.test(mg[1]) ? "negative" : "positive";
  var lv = t.match(/(lympho-?vascular|LVI|angiolymphatic)[^.\n]{0,30}?(not identified|absent|negative|present|identified|positive)/i);
  if (lv) d.lvi = /not identified|absent|negative/i.test(lv[2]) ? "absent" : "present";
  var ln = t.match(/(\d+)\s*(?:\/|of|out of)\s*(\d+)\s*(?:regional\s*)?(?:lymph\s*)?nodes?/i) || t.match(/lymph\s*nodes?[^.\n]{0,40}?(\d+)\s*(?:\/|of|out of)\s*(\d+)/i);
  if (ln) { d.nodesPos = num(ln[1]); d.nodesTotal = num(ln[2]); }
  var sz = t.match(/(?:tumou?r|mass|lesion)\s*(?:size)?[^.\n]{0,25}?(\d+(?:[.,]\d+)?)\s*(?:x\s*\d+(?:[.,]\d+)?\s*){0,2}(cm|mm)/i);
  if (sz) d.sizeCm = sz[2].toLowerCase() == "mm" ? num(sz[1]) / 10 : num(sz[1]);
  var pc = t.match(/(\d+)\s*(?:\/|of|out of)\s*(\d+)\s*(?:cores?|biops)/i);
  if (pc) { d.coresPos = num(pc[1]); d.coresTotal = num(pc[2]); }
  return d;
}

// ---------------- imaging ----------------
var SITES = [
  [/upper\s*(calyx|calyces|pole|calyceal)/i, "upper calyx"],
  [/(middle|mid|interpolar)\s*(calyx|calyces|pole|calyceal)/i, "middle calyx"],
  [/lower\s*(calyx|calyces|pole|calyceal)/i, "lower calyx"],
  [/renal pelvis|pelvic stone|\bpelvis\b/i, "renal pelvis"],
  [/staghorn/i, "staghorn"],
  [/\bUPJ\b|ureteropelvic/i, "UPJ"],
  [/(proximal|upper)\s*(\d\/3\s*)?ureter/i, "proximal ureter"],
  [/(mid|middle)\s*(\d\/3\s*)?ureter/i, "mid ureter"],
  [/(distal|lower)\s*(\d\/3\s*)?ureter|pelvic ureter/i, "distal ureter"],
  [/\bUVJ\b|ureterovesical/i, "UVJ"],
  [/bladder/i, "bladder"],
  [/urethra/i, "urethra"],
  [/ureter/i, "ureter"],
  [/kidney|renal|calyx|calyces/i, "kidney"]
];
function siteOf(s) { for (var i = 0; i < SITES.length; i++) if (SITES[i][0].test(s)) return SITES[i][1]; return undefined; }

function parseImaging(t, lines) {
  var d = {};
  if (/\bMRI\b|\bMR\b|magnetic/i.test(t)) d.modality = "MRI";
  else if (/\bCT\b|computed tomograph|\bNCCT\b|\bCTU\b/i.test(t)) d.modality = "CT";
  else if (/\bIVP\b|intravenous pyelo/i.test(t)) d.modality = "IVP";
  else if (/ultraso|\bUS\b|sonogra|TRUS/i.test(t)) d.modality = "US";
  else if (/\bKUB\b|plain film|x-?ray/i.test(t)) d.modality = "KUB";
  var imp = section(lines, /^(impression|conclusion|summary|สรุป)/i, /^(radiologist|reported by|signed|dictated|recommend)/i);
  d.text = imp || undefined;

  // ประโยคที่พูดถึงนิ่ว
  var sents = clean(t).split(/(?:\.\s+|\n|;)/);
  var stones = [];
  sents.forEach(function (s) {
    if (!/stone|calcul|นิ่ว|lithiasis/i.test(s)) return;
    if (/\bno\b[^,]{0,25}(stone|calcul)|without[^,]{0,15}(stone|calcul)|stone[\s\-]*free|ไม่พบนิ่ว|ไม่มีนิ่ว/i.test(s)) return;
    var sizes = [];
    s.replace(/(\d+(?:[.,]\d+)?)\s*(?:x\s*(\d+(?:[.,]\d+)?)\s*)?(?:x\s*(\d+(?:[.,]\d+)?)\s*)?(mm|cm)\b/gi, function (m0, a, b, c, u) {
      var mx = Math.max(num(a), num(b) || 0, num(c) || 0);
      sizes.push(u.toLowerCase() == "cm" ? mx * 10 : mx);
      return m0;
    });
    var n = first(/(\d+)\s*(?:stones|calculi)/i, s);
    stones.push({
      side: sideOf(s), site: siteOf(s),
      mm: sizes.length ? Math.max.apply(null, sizes) : undefined,
      n: n ? num(n) : (/multiple|several|calculi|stones/i.test(s) ? "multiple" : 1),
      hu: num(first(/(\d{2,4})\s*HU/i, s))
    });
  });
  // findings กับ impression มักพูดถึงนิ่วก้อนเดียวกันซ้ำ: รวมตามข้าง+ตำแหน่ง เก็บขนาดใหญ่สุด
  var byKey = {};
  stones = stones.filter(function (x) {
    var key = (x.side || "") + "|" + (x.site || "");
    var o = byKey[key];
    if (!o) { byKey[key] = x; return true; }
    if (x.mm && (!o.mm || x.mm > o.mm)) o.mm = x.mm;
    if (x.hu && !o.hu) o.hu = x.hu;
    if (typeof x.n == "number" && typeof o.n == "number" && x.n > o.n) o.n = x.n;
    if (x.n == "multiple") o.n = "multiple";
    return false;
  });
  if (stones.length) {
    d.stones = stones;
    var mm = stones.map(function (x) { return x.mm || 0; });
    d.maxmm = Math.max.apply(null, mm) || undefined;
    var big = stones[mm.indexOf(Math.max.apply(null, mm))];
    d.side = big.side; d.site = big.site;
    d.n = stones.reduce(function (a, x) { return a + (typeof x.n == "number" ? x.n : 2); }, 0);
    d.hu = big.hu;
  }
  if (/\b(no|without)\b[^.]{0,30}(residual|remaining)?[^.]{0,10}(stone|calcul)|stone[\s\-]*free|ไม่พบนิ่ว|ไม่มีนิ่ว/i.test(t) && !stones.length) d.sf = "SF";
  else if (stones.length) d.sf = d.maxmm && d.maxmm <= 4 ? "Residual <=4mm" : "Residual >4mm";

  var hy = t.match(/(no|mild|moderate|severe|marked|gross|grade\s*[1-4I-V]+)?\s*(?:degree of\s*)?hydro(?:uretero)?nephrosis/i);
  if (hy) {
    var h = (hy[1] || "").toLowerCase();
    d.hydro = h == "no" ? "none" : /severe|marked|gross|grade\s*(3|4|iii|iv)/i.test(h) ? "severe" : /moderate|grade\s*(2|ii)/i.test(h) ? "moderate" : "mild";
  }
  else if (/no\s+hydro/i.test(t)) d.hydro = "none";

  var vol = t.match(/prostat[^.\n]{0,80}?(?:volume|vol\.?|weight|size)?[^.\n\d]{0,20}(\d+(?:[.,]\d+)?)\s*(ml|cc|gm|g|cm3)\b/i);
  if (vol) d.vol = num(vol[1]);
  var pr = t.match(/PI-?RADS\s*(?:v?\s*2(?:\.1)?)?\s*(?:score|category|assessment)?\s*:?\s*(\d)/i);
  if (pr) d.pirads = num(pr[1]);
  return d;
}

// ---------------- PSA ----------------
function parsePSA(t) {
  var d = {};
  var m = t.match(/(?:total\s*)?PSA[^\d\n<]{0,25}(<\s*)?(\d+(?:[.,]\d+)?)/i);
  if (m) d.psa = num(m[2]);
  if (m && m[1]) d.below = true;      // ต่ำกว่าค่าที่วัดได้ เช่น <0.01
  var f = t.match(/free\s*PSA[^\d\n]{0,25}(\d+(?:[.,]\d+)?)/i);
  if (f) d.freePsa = num(f[1]);
  return parseLab(t, d);
}

// ---------------- lab อื่น (Cr, eGFR) ----------------
function parseLab(t, d) {
  d = d || {};
  var cr = t.match(/(?:creatinine|\bCr\b)[^\d\n]{0,20}(\d+(?:[.,]\d+)?)/i);
  if (cr) d.cr = num(cr[1]);
  var gf = t.match(/eGFR[^\d\n]{0,25}(\d+(?:[.,]\d+)?)/i);
  if (gf) d.egfr = num(gf[1]);
  return d;
}

// ---------------- main ----------------
var t = clean(txt);
var lines = t.split(/\r?\n/).map(function (s) { return s.replace(/\s+/g, " ").trim(); }).filter(Boolean);
var m0 = t.match(/HN\s*\.?\s*:?\s*(\d{3,})/i);
if (m0) hnx = Number(m0[1]);

var dd = {};
if (/patholog|biopsy|specimen|histolog|carcinoma|gleason|margin/i.test(t) && /diagnosis|gross|microscop|specimen/i.test(t)) {
  otype = "patho";
  odate = reportDate(lines, /(report|sign(ed)?\s*out|verif|approv)\w*\s*(date|on)?|วันที่รายงาน/i) || reportDate(lines, /(collect|receiv|specimen)\w*\s*date/i);
  dd = parsePatho(t, lines);
  osum = [dd.organ, dd.cell, dd.grade, dd.gleason && ("GS " + dd.gleason), dd.pT, dd.pN, dd.tGuess && ("T? " + dd.tGuess), dd.margin && ("margin " + dd.margin)].filter(Boolean).join(", ");
}
else if (/\bPSA\b/i.test(t) && !/impression|findings|technique/i.test(t)) {
  otype = "psa";
  odate = reportDate(lines, /(collect|report|result|order|receiv)\w*\s*date|วันที่/i);
  dd = parsePSA(t);
  osum = "PSA " + (dd.below ? "<" : "") + dd.psa;
}
else if (/creatinine|\bCr\b|eGFR/i.test(t) && !/impression|findings|technique/i.test(t)) {
  otype = "lab";
  odate = reportDate(lines, /(collect|report|result|order|receiv)\w*\s*date|วันที่/i);
  dd = parseLab(t);
  osum = ["Cr " + dd.cr, dd.egfr && ("eGFR " + dd.egfr)].filter(Boolean).join(", ");
}
else {
  otype = "imaging";
  odate = reportDate(lines, /(exam|study|report|scan)\w*\s*date|date of (exam|study)|วันที่ตรวจ/i);
  dd = parseImaging(t, lines);
  osum = [dd.modality, dd.sf, dd.maxmm && (dd.side || "") + " " + (dd.site || "") + " " + dd.maxmm + "mm", dd.hydro && ("hydro " + dd.hydro), dd.vol && ("prostate " + dd.vol + "ml"), dd.pirads && ("PIRADS " + dd.pirads)].filter(Boolean).join(", ");
}

// ลบค่าว่างออกให้ JSON สั้น
for (var k in dd) if (dd[k] === undefined || dd[k] === "") delete dd[k];

if (hnx && odate) {
  jsonline = JSON.stringify({ hn: hnx, type: otype, date: odate, d: dd, t: Date.now() });
}
