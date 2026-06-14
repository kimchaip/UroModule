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
  
      // -------------------------
      // SORT: LA → GA, Que → น้อย → มาก
      // -------------------------
      cases.sort((a, b) => {
        const order = { "LA": 0, "GA": 1 };
        let t1 = order[a.field("ORType")] ?? 99;
        let t2 = order[b.field("ORType")] ?? 99;
      
        if (t1 != t2) return t1 - t2;
        return (a.field("Que") || 999) - (b.field("Que") || 999);
      });
      
      // -------------------------
      // CASE ROW (Material UI)
      // -------------------------
      cases.forEach(c => {
      
        let card = layout("linear")
            .orientation("vertical")
            .padding(10,8,10,8)
            .margin(0,0,0,10)
            .background("#FFFFFF")
            .elevation(3);   // shadow แบบ Material
      
        // -------------------------
        // บรรทัด 1: Que + Name + ORType badge
        // -------------------------
        let line1 = layout("linear").orientation("horizontal");
      
        // Que chip
        line1.add(
          textView("#" + (c.field("Que") || "-"))
            .padding(8,2,8,2)
            .margin(0,0,10,0)
            .background("#E3F2FD")     // ฟ้าอ่อนแบบ Material
            .textColor("#0D47A1")      // ฟ้าเข้ม
            .textSize(14)
            .cornerRadius(12)
        );
      
        // Name
        line1.add(
          textView(c.field("Name"))
            .textSize(15)
            .textColor("#000000")
            .weight(1)
        );
      
        // ORType badge
        let typeColor = c.field("ORType") == "LA" ? "#4CAF50" : "#F44336"; // LA=เขียว, GA=แดง
      
        line1.add(
          textView(c.field("ORType"))
            .padding(8,2,8,2)
            .background(typeColor)
            .textColor("#FFFFFF")
            .textSize(13)
            .cornerRadius(12)
        );
      
        // -------------------------
        // บรรทัด 2: Dx | Op
        // -------------------------
        let line2 = layout("linear").orientation("horizontal");
      
        line2.add(
          textView("Dx: " + (c.field("Dx") || "-"))
            .textSize(13)
            .textColor("#616161")
            .weight(1)
        );
      
        line2.add(
          textView("Op: " + (c.field("Operation") || "-"))
            .textSize(13)
            .textColor("#616161")
            .weight(1)
        );
      
        // -------------------------
        // รวมทุกอย่างลง card
        // -------------------------
        card.add(line1);
        card.add(line2);
      
        caseList.add(card);
      });
  
      dayBlock.add(caseList);
  
      root.add(dayBlock);
    }
  
    return root;
  }

}
