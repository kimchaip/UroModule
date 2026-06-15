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
      // Header ของวัน
      // -------------------------
      let header = ui().text(
        my.dateFormat(d, "dd MMM yyyy") + 
        "  |  " + cases.length + " case(s)"
      ).font({ size: 14, color: "white", style: "bold" });

      let caseList = [];

      // -------------------------
      // แสดงเคสของวันนั้น
      // -------------------------
      cases.forEach(c => {

        let que = c.field("Que") || "-";
        let type = c.field("ORType") || "-";
        let dx = c.field("Dx") || "-";
        let op = c.field("Op") || "-";

        // Patient เป็น link → อาจเป็น array หรือ object
        let p = c.field("Patient");
        let name = "-";

        if (p) {
          if (Array.isArray(p)) {
            if (p.length > 0) name = p[0].title;
          } else if (typeof p === "object") {
            name = p.title || "-";
          }
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
