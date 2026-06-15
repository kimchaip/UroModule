var widget = {

  buildUpcomingORList : function (lb) {

    const entries = lb.entries();
    const today = new Date();
    let dayBlocks = [];

    for (let i = 0; i < 30; i++) {

      let d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      let dstr = d.toDateString();

      // หาเคสของวันนั้น
      let cases = entries.filter(e => {
        let raw = e.field("Date");
        if (!raw) return false;

        let ed = new Date(raw);
        if (isNaN(ed)) return false;

        return ed.toDateString() === dstr;
      });

      // เงื่อนไขแสดงผล
      let hd = script.checkholiday(d);
      let hinfo = script.analyzeHoliday(hd);

      let isMonday = (d.getDay() === 1);
      let isORExtra = hinfo.orExtra;

      let shouldShow = false;
      if (isMonday) shouldShow = true;
      if (isORExtra) shouldShow = true;
      if (cases.length > 0) shouldShow = true;

      if (!shouldShow) continue;

      // แจ้งเตือนถ้าวันอื่นมีเคส
      let warn = "";
      if (!isMonday && !isORExtra && cases.length > 0) {
        warn = " ⚠ มีเคสวันนอกกลุ่มที่กำหนด";
      }

      // คำนวณ “อีกกี่วัน”
      let diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
      let dayLeft = diff === 0 ? "วันนี้" : "อีก " + diff + " วัน";

      // SORT: LA → GA, Que น้อย → มาก
      const order = { "LA": 0, "GA": 1 };

      cases.sort((a, b) => {
        let t1 = order[a.field("ORType")] != undefined ? order[a.field("ORType")] : 99;
        let t2 = order[b.field("ORType")] != undefined ? order[b.field("ORType")] : 99;

        if (t1 !== t2) return t1 - t2;
        return (a.field("Que") || 999) - (b.field("Que") || 999);
      });

      // Header ของวัน
      let header = ui().text(
        d.toDateString() +
        " | " + cases.length + " case(s)" +
        " | " + dayLeft +
        warn
      ).font({ size: 14, color: "white", style: "bold" });

      // แบ่งกลุ่ม LA / GA
      let laCases = cases.filter(c => c.field("ORType") === "LA");
      let gaCases = cases.filter(c => c.field("ORType") === "GA");

      let caseList = [];

      // ===== LA GROUP =====
      if (laCases.length > 0) {
        caseList.push(
          ui().text("LA Cases").font({ size: 13, color: "white", style: "bold" })
        );
        caseList.push(
          ui().text("--------------------------------").font({ size: 12, color: "white" })
        );

        laCases.forEach(c => caseList.push(makeCaseBlock(c, "green")));
      }

      // ===== GA GROUP =====
      if (gaCases.length > 0) {
        caseList.push(
          ui().text("GA Cases").font({ size: 13, color: "white", style: "bold" })
        );
        caseList.push(
          ui().text("--------------------------------").font({ size: 12, color: "white" })
        );

        gaCases.forEach(c => caseList.push(makeCaseBlock(c, "yellow")));
      }

      let block = ui().layout([header].concat(caseList));
      dayBlocks.push(block);
    }

    return ui().layout(dayBlocks);
  }
};


// -------------------------
// ฟังก์ชันสร้างบล็อกเคสแบบอ่านง่าย + แท็กสี
// -------------------------
function makeCaseBlock(c, colorTag) {

  let que = c.field("Que") || "-";
  let type = c.field("ORType") || "-";
  let dx = c.field("Dx") || "-";
  let op = c.field("Op") || "-";

  // Patient link
  let p = c.field("Patient");
  let name = "-";

  if (p && p.length > 0) {
    name = p[0].title;
  }

  // แท็กสี
  let tag = "[" + type + "]";

  return ui().layout([
    ui().text(
      tag + "  #" + que + " | " + name
    ).font({ size: 12, color: colorTag, style: "bold" }),

    ui().text(
      "Dx: " + dx + " | Op: " + op
    ).font({ size: 12, color: "white" })
  ]);
}

