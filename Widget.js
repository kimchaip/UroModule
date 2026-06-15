var widget = {

  buildUpcomingORList : function (lb) {

    // get the number of entries in the library
    var entryCount = lb.entries().length;
    // return the entry count as a string
    return ui().layout([
      ui().text("Header"),
      ui().text("Total Entries: " + entryCount),
      ui().text("end")
    ])
  }
};
