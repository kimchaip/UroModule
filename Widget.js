var widget = {
  function buildUpcomingORList(lb) {
    const entries = lb.entries();
  
    const root = layout("linear").orientation("vertical");
  
    const today = new Date();
  
    for (let i = 0; i < 30; i++) {
  
      let d = new Date(today.getTime() + i * 86400000);
      let gdate = my.gdate(d);
  
      // --- หาเคสของวันนั้น ---
      let cases = entries.filter(e => my.gdate(e.field("Date")) == gdate);
  
      // --- วิเคราะห์สถานะวัน ---
      let hd = script.checkholiday(d);
      let hinfo = script.analyzeHoliday(hd);
  
      let totalMin = script.calcOpMinutes(cases, hinfo.orExtra);
      let cutoff = hinfo.orExtra ? 7*60 : 5*60+30;
  
      let status = "";
      if (hinfo.banned) status = "❌ ไม่อยู่ (OutOfDuty)";
      else if (hinfo.holiday) status = "🎌 วันหยุด";
      else if (totalMin > cutoff) status = "⛔ เต็มแล้ว";
      else status = "✅ ยังได้อยู่ (เหลือ " + (cutoff-totalMin) + " นาที)";
  
      // --- สร้าง block ของวัน ---
      let dayBlock = layout("linear")
        .orientation("vertical")
        .padding(10,10,10,10)
        .background("#eeeeee")
        .margin(0,0,0,10);
  
      // --- Header ---
      let header = layout("linear").orientation("horizontal");
  
      header.add(
        textView(my.dateFormat(d, "dd MMM yyyy"))
          .textSize(18)
          .textColor("#000000")
          .weight(1)
      );
  
      header.add(
        textView(status)
          .textSize(16)
          .textColor("#444444")
      );
  
      dayBlock.add(header);
  
      // --- Case list ---
      let caseList = layout("linear").orientation("vertical");
  
      cases.forEach(c => {
        let row = layout("linear").orientation("horizontal").padding(5,5,5,5);
  
        row.add(textView(c.field("Name")).weight(1));
        row.add(textView(c.field("ORType")));
        row.add(textView(c.field("OpLength") + " min"));
  
        caseList.add(row);
      });
  
      dayBlock.add(caseList);
  
      root.add(dayBlock);
    }
  
    return root;
  }

}
