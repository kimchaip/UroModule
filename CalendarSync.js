// URL ฝั่ง Apps Script (Web App)
let APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCtVxvej13qw2h_9ti7pDRcLuDmlDPv08sDUeJ4Bk34XhZ_BQ9Ki7sQT_XPt3GUOg60w/exec";

// helper: ส่ง JSON ไป Apps Script
function callAppScript(payload) {
    let res = http.post(
        APP_SCRIPT_URL,
        JSON.stringify(payload),
        { "Content-Type": "application/json" }
    );
    return JSON.parse(res.text || "{}");
}

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
        }
    };

    let res = callAppScript(payload);

    if (res.ok && res.eid) {
        // เก็บ eid + เวลาแก้ไขกลับเข้า Memento
        e.set("eid", res.eid);
        e.set("ModifiedTime", moment(res.ModifiedTime).toDate());
        e.set("CreatedTime", moment(res.CreatedTime).toDate())
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
        }
    };

    let res = callAppScript(payload);

    if (res.ok) {
        e.set("ModifiedTime", moment(res.ModifiedTime).toDate());
        message("Update calendar successful");
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
        }
    };

    let res = callAppScript(payload);
  
    if (res.ok) {
        message("Delete calendar successful");
    }
    else {
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

        if (action === "create") {
            // ถ้า Calendar สร้างใหม่ → Memento ต้องสร้างตาม
            lib().create({
                "eid": eid,
                "Calendar": calendar,
                "Title": p.title,
                "Date": moment(p.date).toDate(),
                "EndDate": moment(p.enddate).toDate(),
                "StartTime": moment(p.start).toDate(),
                "EndTime": moment(p.end).toDate(),
                "AllDay": p.allday,
                "Description": p.description,
                "Location": p.location,
                "Holiday": p.holiday,
                "OutOfDuty": p.outofduty,
                "RemindSet": p.remindset,
                "MinuteSet": p.minuteset,
                "ModifiedTime": moment(item.modified).toDate(),
                "CreatedTime": moment(item.modified).toDate()
            });

            ackIds.push(item.id);
        }

        else if (action === "update") {
            if (!e) return; // ไม่มี e ให้ข้ามไปก่อน

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
            e.set("RemindSet", p.remindset);
            e.set("MinuteSet", p.minuteset);
            e.set("ModifiedTime", moment(item.modified).toDate());

            ackIds.push(item.id);
        }

        else if (action === "delete") {
            if (!e) return; // ไม่มี e ให้ข้ามไปก่อน

            e.trash();

            ackIds.push(item.id);
        }
    });

    // 3) ส่ง ack กลับไป Apps Script เพื่อลบ queue ที่ apply แล้ว
    if (ackIds.length) {
        callAppScript({
            action: "ackQueue",
            ids: ackIds
        });
    }

    message("Sync from Calendar done: " + ackIds.length + " changes");
}
