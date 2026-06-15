var widget = {

  buildUpcomingORList : function (lb) {

    const entries = lb.entries();
    const today = new Date();

    let dayBlocks = [];

    for (let i = 0; i < 30; i++) {

      let d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      let dstr = d.toDateString();

      // -------------------------
      // หาเคสของวันนั้น
      // -------------------------
      let cases = entries.filter(e => {
        let raw = e.field("Date");
        if (!raw) return false;

        let ed = new Date(raw);
        if (isNaN(ed)) return false;

        return ed.toDateString() === dstr;
      });

      // -------------------------
      // วิเคราะห์ประเภทวัน
      // -------------------------
      let hd = script.checkholiday(d);
      let hinfo = script.analyzeHoliday(hd);

      let isMonday = (d.getDay() === 1);
      let isORExtra = hinfo.orExtra;

      // -------------------------
      // เงื่อนไขการแสดงผล
      // -------------------------
      let shouldShow = false;

      if (isMonday) shouldShow = true;
      if (isORExtra) shouldShow = true;
      if (cases.length > 0) shouldShow = true;   // วันอื่นมีเคส → ต้องแสดง

      if (!shouldShow) continue;

      // -------------------------
      // แจ้งเตือนถ้าเป็นวันอื่นแต่มีเคส
      // -------------------------
      let warn = "";
      if (!isMonday && !isORExtra && cases.length > 0) {
        warn = " ⚠ มีเคสวันนอกกลุ่มที่กำหนด";
      }

      // -------------------------
      // SORT: LA → GA, Que น้อย → มาก
      // -------------------------
      cases.sort((a, b) => {
        const order = { "LA": 0, "GA": 1 };
        let t1 = order[a.field("ORType")] != undefined ? order[a.field("ORType")] : 99;
        let t2 = order[b.field("ORType")] != undefined ? order[b.field("ORType")] : 99;

        if (t1 !== t2) return t1 - t2;
        return (a.field("Que") || 999) - (b.field("Que") || 999);
      });

      // -------------------------
      // Header ของวัน
      // -------------------------
      let header = ui().text(
        d.toDateString() +
        " | " + cases.length + " case(s)" +
        warn
      ).font({ size: 14, color: "white", style: "bold" });

      let caseList = [];

      // -------------------------
      // แสดงเคส
      // -------------------------
      cases.forEach(c => {

        let que = c.field("Que") || "-";
        let type = c.field("ORType") || "-";
        let dx = c.field("Dx") || "-";
        let op = c.field("Op") || "-";

        // Patient link
        let p = c.field("Patient");
        let name = "-";

        if (p && p.length > 0) {
          name = p[0].title;
        } else {
          name = "-";
        }

        caseList.push(
          ui().text(
            "#" + que +
            " | " + name +
            " | Dx: " + dx +
            " | Op: " + op +
            " | " + type
          ).font({ size: 12, color: "white" })
        );
      });

      // รวม header + case list
      let block = ui().layout([header].concat(caseList));

      dayBlocks.push(block);
    }

    return ui().layout(dayBlocks);
  }
};
