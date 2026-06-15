var widget = {

  buildUpcomingORList : function (lb) {

    let entries = lb.entries();
    let uiList = [];

    entries.forEach(e => {
      let raw = e.field("Date");
      let jsd = raw ? new Date(raw) : null;
      
      uiList.push(
        ui().text(
          "RAW = " + raw +
          " | toDateString = " + (jsd ? jsd.toDateString() : "null")
        ).font({ size: 12, color: "white" })
      );
    });

    return ui().layout(uiList);
  }
};
