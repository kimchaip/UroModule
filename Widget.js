var widget = {

  buildUpcomingORList : function (lb) {

    let items = lb.entries();
    let uiList = [];

    items.forEach(e => {
      uiList.push(
        ui().text(
          "RAW Date = " + JSON.stringify(e.field("Date"))
        ).textColor("#FF0000")
      );
    });

    return ui().layout(uiList);
  }
};


