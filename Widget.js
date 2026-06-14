var widget = {

  buildUpcomingORList : function (lb) {

    const entries = lb.entries();
    const today = new Date();

    let dayBlocks = [];

    for (let i = 0; i < 30; i++) {

      let d = my.dateadd(today, i);
      let datestr = d.toDateString();

      // --- หาเคสของวันนั้น ---
      let cases = entries.filter(e => {
        if (my.dateIsValid(e.field("Date"))) {
          return e.field("Date").toDateString() == datestr;
        }
        return false;
      });
      caseList.push(
        ui().text("DEBUG: JS date = " + d.toDateString())
          .textColor("#FF00FF")
      );
      
      cases.forEach(c => {
        caseList.push(
          ui().text("DEBUG: Entry date = " + c.field("Date").toDateString())
            .textColor("#FF00FF")
        );
      });


      // --- วิเคราะห์สถานะวัน ---
      let hd = script.checkholiday(d);
      let hinfo = script.analyzeHoliday(hd);

      let totalMin = script.calcOpMinutes(cases, hinfo.orExtra);
      let cutoff = hinfo.orExtra ? 7*60 : 5*60+30;

      let status = "";
      let statusColor = "#9E9E9E";

      if (hinfo.banned) { status = "ไม่อยู่"; statusColor = "#757575"; }
      else if (hinfo.holiday) { status = "วันหยุด"; statusColor = "#F57C00"; }
      else if (totalMin > cutoff) { status = "เต็มแล้ว"; statusColor = "#D32F2F"; }
      else { status = "ว่าง (" + (cutoff-totalMin) + " นาที)"; statusColor = "#388E3C"; }

      // -------------------------
      // SORT: LA → GA, Que → น้อย → มาก
      // -------------------------
      cases.sort((a, b) => {
        const order = { "LA": 0, "GA": 1 };
        let t1 = order[a.field("ORType")] != undefined ? order[a.field("ORType")] : 99;
        let t2 = order[b.field("ORType")] != undefined ? order[b.field("ORType")] : 99;

        if (t1 != t2) return t1 - t2;
        return (a.field("Que") || 999) - (b.field("Que") || 999);
      });

      // -------------------------
      // HEADER ของวัน (Material UI)
      // -------------------------
      let header = ui().layout([
        ui().text(my.dateFormat(d, "dd MMM yyyy"))
          .weight(1)
          .textSize(18)
          .textColor("#000000"),

        ui().text(status)
          .padding(6,3,6,3)
          .background(statusColor)
          .textColor("#FFFFFF")
          .cornerRadius(8)
      ])
      .orientation("horizontal")
      .padding(10,10,10,10)
      .background("#EEEEEE")
      .margin(0,0,0,10);

      // -------------------------
      // CASE LIST (Material UI)
      // -------------------------

      caseList.push(
        ui().text("DEBUG: cases.length = " + cases.length)
          .textColor("#0000FF")
      );

      let caseList = [];

      cases.forEach(c => {
        caseList.push(
          ui().text("DEBUG: Patient=" + JSON.stringify(c.field("Patient")))
            .textColor("#FF0000")
        );
        
        caseList.push(
          ui().text("DEBUG: Dx=" + JSON.stringify(c.field("Dx")))
            .textColor("#FF0000")
        );
        
        caseList.push(
          ui().text("DEBUG: Op=" + JSON.stringify(c.field("Op")))
            .textColor("#FF0000")
        );
        
        caseList.push(
          ui().text("DEBUG: ORType=" + JSON.stringify(c.field("ORType")))
            .textColor("#FF0000")
        );
        
        caseList.push(
          ui().text("DEBUG: Que=" + JSON.stringify(c.field("Que")))
            .textColor("#FF0000")
        );

        // let que = c.field("Que") || "-";
        // let name = (c.field("Patient") && c.field("Patient").length > 0) ? c.field("Patient")[0].title : "-";
        // let type = c.field("ORType") || "-";
        // let dx = c.field("Dx") || "-";
        // let op = c.field("Op") || "-";

        // let typeColor = (type === "LA") ? "#4CAF50" : "#F44336";

        // let card = ui().layout([
          
        //   // line 1
        //   ui().layout([
        //     ui().text("#" + que)
        //       .padding(8,2,8,2)
        //       .background("#E3F2FD")
        //       .textColor("#0D47A1")
        //       .cornerRadius(12)
        //       .margin(0,0,10,0),

        //     ui().text(name)
        //       .weight(1)
        //       .textSize(15),

        //     ui().text(type)
        //       .padding(8,2,8,2)
        //       .background(typeColor)
        //       .textColor("#FFFFFF")
        //       .cornerRadius(12)

        //   ]).orientation("horizontal"),

        //   // line 2
        //   ui().layout([
        //     ui().text("Dx: " + dx)
        //       .weight(1)
        //       .textColor("#616161")
        //       .textSize(13),

        //     ui().text("Op: " + op)
        //       .weight(1)
        //       .textColor("#616161")
        //       .textSize(13)
        //   ]).orientation("horizontal")

        // ])
        // .padding(10,8,10,8)
        // .margin(0,0,0,10)
        // .background("#FFFFFF")
        // .elevation(3);

        // // caseList.push(card);
        // caseList.push(
        //   ui().text("Patient=" + name + " | Dx=" + dx + " | Op=" + op + " | Type=" + type + " | Que=" + que)
        //     .textColor("#FF0000")
        //     .textSize(12)
        // );
      });
      
      // -------------------------
      // รวมเป็น Day Block
      // -------------------------
      let children = [header].concat(caseList);

      let dayBlock = ui().layout(children)
        .orientation("vertical")
        .padding(10,10,10,10)
        .background("#FAFAFA")
        .margin(0,0,0,20);
      
      dayBlocks.push(dayBlock);
    }

    return ui().layout(dayBlocks).orientation("vertical");
  }
};
