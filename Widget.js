var widget = {

  buildUpcomingORList : function (lb) {

    const entries = lb.entries();
    const today = new Date();

    let dayBlocks = [];

    for (let i = 0; i < 30; i++) {

      let d = my.dateadd(today, i);
      let datestr = d.toDateString();
      ui().text("DEBUG: datestr = " + datestr)
          .textColor("#FF00FF")
      // // --- หาเคสของวันนั้น ---
      // let cases = entries.filter(e => {
      //   if (my.dateIsValid(e.field("Date"))) {
      //     return e.field("Date").toDateString() == datestr;
      //   }
      //   return false;
      // });
      
      // let caseList = [];
      // caseList.push(
      //   ui().text("DEBUG: JS date = " + d.toDateString())
      //     .textColor("#FF00FF")
      // );
      
      // cases.forEach(c => {
      //   caseList.push(
      //     ui().text("DEBUG: Entry date = " + c.field("Date").toDateString())
      //       .textColor("#FF00FF")
      //   );
      // });
      
      // // -------------------------
      // // รวมเป็น Day Block
      // // -------------------------
      // let children = [header].concat(caseList);

      // let dayBlock = ui().layout(children)
      //   .orientation("vertical")
      //   .padding(10,10,10,10)
      //   .background("#FAFAFA")
      //   .margin(0,0,0,20);
      
      dayBlocks.push(dayBlock);
    }

    return ui().layout(dayBlocks).orientation("vertical");
  }
};
