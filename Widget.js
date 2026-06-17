var widget = {

  buildUpcomingORList : function (lb) {

    const entries = lb.entries();
    const today = new Date();
    let dayBlocks = [];

    for (let i = 0; i < 90; i++) {

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
      let isHoliday = hinfo.holiday;
      let isBanned = hinfo.banned;

      let shouldShow = false;
      if (isMonday) shouldShow = true;
      if (isORExtra && !isBanned) shouldShow = true;
      if (cases.length > 0) shouldShow = true;

      if (!shouldShow) continue;

      // แจ้งเตือนถ้าวันอื่นมีเคส
      let warn = "";
      if (((!isMonday && !isORExtra) || (isBanned || isHoliday)) && cases.length > 0) {
        warn = " ⚠ มี case นอกระบบ";
      }

      // คำนวณ “อีกกี่วัน”
      let diff = Math.floor((my.gdate(my.date(d))-my.gdate(my.date(today)))/86400000);
      let dayLeft = "";

      if (diff === 0) {
        dayLeft = "ผ่าตัดวันนี้";
      } else if (diff === 1) {
        dayLeft = "ผ่าตัดพรุ่งนี้";
      } else if (diff > 1) {
        dayLeft = "อีก " + diff + " วัน";
      } else {
        dayLeft = "ผ่านไปแล้ว";
      }

      // SORT: LA → GA, Que น้อย → มาก
      const order = { "LA": 0, "GA": 1 };

      cases.sort((a, b) => {
        let t1 = order[a.field("ORType")] != undefined ? order[a.field("ORType")] : 99;
        let t2 = order[b.field("ORType")] != undefined ? order[b.field("ORType")] : 99;

        if (t1 !== t2) return t1 - t2;
        return (a.field("Que") || 999) - (b.field("Que") || 999);
      });

      // -------------------------
      // คำนวณสถานะ OR
      // -------------------------
      let totalMin = script.calcOpMinutes(cases, hinfo.orExtra);
      let totalHr = totalMin / 60;

      let limitAlmost = isMonday ? 5.5 : 7.0;
      let limitFull   = isMonday ? 6.0 : 7.5;

      let status = "";
      let color = "white";

      if (totalHr >= limitFull) {
        status = "เต็มแล้ว";
        color = "red";
      } else if (totalHr >= limitAlmost) {
        status = "เกือบเต็ม";
        color = "orange";
      } else {
        status = "setได้";
        color = "green";
      }

      // ถ้ามี case นอกระบบ → ไม่ต้องแสดง status
      let statusText = "";
      if (warn === "") {
        statusText = ui().text(" [" + status + "]")
                        .font({ size: 16, color: color, style: "bold" });
      } else {
        statusText = ui().text("")  // ไม่แสดงอะไรเลย
                        .font({ size: 16, color: "white" });
      }
      
      // -------------------------
      // Header 2 แถว + เส้นคั่น
      // -------------------------
      let header = ui().layout([
        ui().text("\n=======================================").font({ size: 15, color: "white", style: "bold" }),
        
        // แถว 1: วันที่ + จำนวนเคส
        ui().text(
          d.toDateString() +
          " | " + cases.length + " case(s)").font({ size: 16, color: "white", style: "bold" }),
          
        // แถว 2: อีกกี่วัน + นอกระบบ + status (เฉพาะคำ)
        ui().layout([
          ui().text(dayLeft).font({ size: 16, color: "white" }),
          ui().text(warn).font({ size: 16, color: "yellow" }),
          statusText
        ]).horizontal()
        
      ]);

      // แบ่งกลุ่ม LA / GA
      let laCases = cases.filter(c => c.field("ORType") === "LA");
      let gaCases = cases.filter(c => c.field("ORType") === "GA");

      let caseList = [];

      // ===== LA GROUP =====
      if (laCases.length > 0) {
        caseList.push(
          ui().text("-------------------------- LA --------------------------")
            .font({ size: 15, color: "white", style: "bold" })
        );

        laCases.forEach(c => caseList.push(makeCaseBlock(c)));
      }

      // ---== GA GROUP ---==
      if (gaCases.length > 0) {
        caseList.push(
          ui().text("-------------------------- GA --------------------------")
            .font({ size: 15, color: "white", style: "bold" })
        );

        gaCases.forEach(c => caseList.push(makeCaseBlock(c)));
      }

      let block = ui().layout([header].concat(caseList));
      dayBlocks.push(block);
    }

    return ui().layout(dayBlocks);
  }
};


// -------------------------
// ฟังก์ชันสร้างบล็อกเคสแบบอ่านง่าย (ไม่มี ORType แล้ว)
// -------------------------
function makeCaseBlock(c) {

  let que = c.field("Que") || "-";
  let dx = c.field("Dx") || "-";
  let op = c.field("Op") || "-";

  // Patient link
  let p = c.field("Patient");
  let name = "-";

  if (p && p.length > 0) {
    name = p[0].title;
  }

  return ui().layout([
    ui().text(
      "#" + que + " | " + name
    ).font({ size: 14, color: "white", style: "bold" }),

    ui().text(
      "Dx: " + dx + " | Op: " + op
    ).font({ size: 14, color: "white" })
  ]);
}

