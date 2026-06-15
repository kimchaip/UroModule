var widget = {

  buildUpcomingORList : function (lb) {

    let entries = lb.entries();
    let uiList = [];

    entries.forEach(e => {
      uiList.push(
        ui().text(
          "RAW Date = " + JSON.stringify(e.field("Date"))
        ).font({ size: 12, color: "red" })
      );
    });

    return ui().layout(uiList);
  }
};
