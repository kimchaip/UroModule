var widget = {

  buildUpcomingORList : function (lb) {

    let now = new Date();

    return ui().layout([
      ui().text("now = " + now),
      ui().text("toDateString = " + now.toDateString()),
      ui().text("ISO = " + now.toISOString()),
      ui().text("Year = " + now.getFullYear()),
      ui().text("Month = " + now.getMonth()),
      ui().text("Date = " + now.getDate()),
      ui().text("Timezone offset (min) = " + now.getTimezoneOffset())
    ])
    // .orientation("vertical")
    // .padding(20,20,20,20);
  }
};

