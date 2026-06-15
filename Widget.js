var widget = {

  buildUpcomingORList : function (lb) {

    let now = new Date();

    return ui().layout([
      ui().text("JS Date = " + now),
      ui().text("toDateString = " + now.toDateString()),
      ui().text("getFullYear = " + now.getFullYear()),
      ui().text("getMonth = " + now.getMonth()),
      ui().text("getDate = " + now.getDate()),
      ui().text("ISO = " + now.toISOString())
    ])
  }
};
