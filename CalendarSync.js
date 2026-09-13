// URL ฝั่ง Apps Script (Web App)
let APP_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyCtVxvej13qw2h_9ti7pDRcLuDmlDPv08sDUeJ4Bk34XhZ_BQ9Ki7sQT_XPt3GUOg60w/exec";

// helper: ส่ง JSON ไป Apps Script
function callAppScript(payload) {
  let client = http();
  client.headers({
      "Content-Type": "application/json"
  });
  
  let res = client.post(APP_SCRIPT_URL, JSON.stringify(payload));

  if (res.code !== 200) {
    log("Sync error: " + res.code + " " + res.body);
  }
  
  return JSON.parse(res.body);
}

function isBusy(calendar, title) {
  return (
    (calendar == "Kim" &&
      ["ORนอกเวลา", "Consult"].some((key) => key == title)) ||
    ((calendar == "Remind" || calendar == "Family") &&
      ["อบรม", "กลับ", "เที่ยว", "ประชุม", "งาน"].some((key) =>
        title.includes(key),
      )) ||
    calendar == "Teach"
  );
}

function isOutOfDuty(calendar, title) {
  return (
    (calendar === "Family" || calendar === "Remind") &&
    ["อบรม", "กลับ", "เที่ยว", "ประชุม", "งาน"].some((k) => title.includes(k))
  );
}

// before create/update entry
function validate(e) {
  if (e.field("allDay")) {
    if (e.field("Date")) {
      let start = moment(e.field("Date")).startOf("day");
      let end = e.field("EndDate")
        ? moment(e.field("EndDate")).startOf("day")
        : null;
      if (!end || start.format("YYMMDD") >= end.format("YYMMDD")) {
        end = start.clone().add(1, "days");
      }

      e.set("Date", start.toDate());
      e.set("EndDate", end.toDate());
      e.set("StartTime", start.toDate());
      e.set("EndTime", end.toDate());
    }
  } else {
    if (e.field("Date") && e.field("StartTime")) {
      let starttime = moment(e.field("StartTime")).diff(
        moment(e.field("StartTime")).startOf("day"),
      );
      let start = moment(e.field("Date")).startOf("day").add(starttime);

      let endtime = e.field("EndTime")
        ? moment(e.field("EndTime")).diff(
            moment(e.field("EndTime")).startOf("day"),
          )
        : starttime + 60 * 60 * 1000;
      let end = e.field("EndDate")
        ? moment(e.field("EndDate")).startOf("day").add(endtime)
        : null;
      if (!end || start.isAfter(end, "minute")) {
        if (starttime > endtime) {
          end = moment(e.field("Date"))
            .startOf("day")
            .add(1, "days")
            .add(endtime);
        } else {
          end = moment(e.field("Date")).startOf("day").add(endtime);
        }
      }

      e.set("Date", start.toDate());
      e.set("EndDate", end.toDate());
      e.set("StartTime", start.toDate());
      e.set("EndTime", end.toDate());
    } else {
      // Prevent saving if no Date or StartTime
      message("require StartTime");
      cancel();
    }
  }

  const remind = isBusy(e.field("Calendar"), e.field("Title"));
  const minuteset = remind ? (e.field("MinuteSet") ? e.field("MinuteSet") : 30) : "";
  e.set("Holiday", e.field("Calendar") === "Holidays");
  e.set("Remindset", remind);
  e.set("MinuteSet", minuteset);
  e.set("OutOfDuty", isOutOfDuty(e.field("Calendar"), e.field("Title")));
}

// after create/update entry
function onCreateEntry(e) {
  let payload = {
    action: "createFromMemento",
    event: {
      __id: e.id,
      title: e.field("Title"),
      calendar: e.field("Calendar"),

      date: e.field("Date"),
      enddate: e.field("EndDate"),
      start: e.field("StartTime"),
      end: e.field("EndTime"),
      allday: e.field("AllDay"),

      description: e.field("Description"),
      location: e.field("Location"),
      holiday: e.field("Holiday"),
      outofduty: e.field("OutOfDuty"),
      remindset: e.field("RemindSet"),
      minuteset: e.field("MinuteSet"),
    },
  };

  let res = callAppScript(payload);

  if (res.ok && res.eid) {
    // เก็บ eid + เวลาแก้ไขกลับเข้า Memento
    e.set("eid", res.eid);
    e.set("ModifiedTime", moment(res.ModifiedTime).toDate());
    e.set("CreatedTime", moment(res.CreatedTime).toDate());
    message("Create calendar successful");
  } else {
    message("Create calendar failed: " + (res.error || "unknown"));
  }
}

function onUpdateEntry(e) {
  let eid = e.field("eid");
  if (!eid) {
    // ถ้ายังไม่มี eid ให้ถือว่าเป็น create ใหม่
    onCreateEntry(e);
    return;
  }

  let payload = {
    action: "updateFromMemento",
    event: {
      __id: e.id,
      eid: eid,
      title: e.field("Title"),
      calendar: e.field("Calendar"),

      date: e.field("Date"),
      enddate: e.field("EndDate"),
      start: e.field("StartTime"),
      end: e.field("EndTime"),
      allday: e.field("AllDay"),

      description: e.field("Description"),
      location: e.field("Location"),
      holiday: e.field("Holiday"),
      outofduty: e.field("OutOfDuty"),
      remindset: e.field("RemindSet"),
      minuteset: e.field("MinuteSet"),
    },
  };

  let res = callAppScript(payload);

  if (res.ok) {
    if (res.eid) {
      e.set("eid", res.eid);
      e.set("ModifiedTime", moment(res.ModifiedTime).toDate());
      e.set("CreatedTime", moment(res.CreatedTime).toDate());
      message("Update calendar changed successful");
    } else {
      e.set("ModifiedTime", moment(res.ModifiedTime).toDate());
      message("Update calendar successful");
    }
  } else {
    message("Update calendar failed: " + (res.error || "unknown"));
  }
}

function onDeleteEntry(e) {
  let eid = e.field("eid");
  let calendar = e.field("Calendar");

  if (!eid) return; // ไม่มี eid ก็ไม่ต้องไปลบ calendar

  let payload = {
    action: "deleteFromMemento",
    event: {
      __id: e.id,
      eid: eid,
      calendar: calendar,
    },
  };

  let res = callAppScript(payload);

  if (res.ok) {
    message("Delete calendar successful");
  } else {
    message("Delete calendar failed: " + (res.error || "unknown"));
  }
}

function syncFromQueue() {
  // 1) ขอ queue จาก Apps Script
  let res = callAppScript({ action: "getQueue" });
  let queue = res.queue || [];

  if (!queue.length) {
    message("No changes from Calendar");
    return;
  }

  let ackIds = [];
  let entries = lib().entries();
  queue.forEach(function (item) {
    let eid = item.eid;
    let calendar = item.calendar;
    let action = item.action;
    let p = item.payload || {};

    // หา entry ที่มี eid ตรงกัน
    let e = entries.find(function (en) {
      return en.field("eid") === eid;
    });

    if (action === "create" || (action !== "delete" && !e)) {
      // ถ้า Calendar สร้างใหม่ → Memento ต้องสร้างตาม
      lib().create({
        eid: eid,
        Calendar: calendar,
        Title: p.title,
        Date: moment(p.date).toDate(),
        EndDate: moment(p.enddate).toDate(),
        StartTime: moment(p.start).toDate(),
        EndTime: moment(p.end).toDate(),
        AllDay: p.allday,
        Description: p.description,
        Location: p.location,
        Holiday: p.holiday,
        OutOfDuty: p.outofduty,
        RemindSet: p.remindset,
        MinuteSet: p.minuteset,
        ModifiedTime: moment(item.modified).toDate(),
        CreatedTime: moment(item.modified).toDate(),
      });

      ackIds.push(item.id);
    } else if (action === "update" && e) {
      e.set("Calendar", calendar);
      e.set("Title", p.title);
      e.set("Date", moment(p.date).toDate());
      e.set("EndDate", moment(p.enddate).toDate());
      e.set("StartTime", moment(p.start).toDate());
      e.set("EndTime", moment(p.end).toDate());
      e.set("AllDay", p.allday);
      e.set("Description", p.description);
      e.set("Location", p.location);
      e.set("Holiday", p.holiday);
      e.set("OutOfDuty", p.outofduty);
      //e.set("RemindSet", p.remindset);
      //e.set("MinuteSet", p.minuteset);
      e.set("ModifiedTime", moment(item.modified).toDate());

      ackIds.push(item.id);
    } else if (action === "delete" && e) {
      e.trash();

      ackIds.push(item.id);
    }
  });

  // 3) ส่ง ack กลับไป Apps Script เพื่อลบ queue ที่ apply แล้ว
  if (ackIds.length) {
    let reply = callAppScript({
      action: "ackQueue",
      ids: ackIds,
    });

    if (reply.ok) {
      message("Sync from Calendar done: " + ackIds.length + " changes");
    } else {
      message("Sync from Calendar error: " + reply.error);
    }
  }
}

function syncNow() {
  let res = callAppScript({action: "manualSync"});

  if (!res.ok) {
    message("Sync error: " + res.error);
    return;
  }

  // manualSync เสร็จแล้ว → ดึง queue มาทำงาน
  syncFromQueue();
}

