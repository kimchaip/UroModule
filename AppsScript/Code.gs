// Calendar ID ไม่อยู่ในโค้ด เก็บใน Script Properties แบบ 1 ปฏิทิน 1 property
// key "CAL:<ชื่อ>" = Calendar ID เช่น CAL:Kim = primary
// ชื่อต้องตรงกับตัวเลือกของ field Calendar ใน Memento วิธีตั้งค่าดู AppsScript/SETUP.md
const CAL_PREFIX = "CAL:";
// ปฏิทินที่ setupCalendars() หา/สร้างให้ ชื่อเหล่านี้ใช้ในกฎ isBusy / isOutOfDuty
const DEFAULT_CALENDARS = ["Kim", "Holidays", "Remind", "Teach", "Family"];

// queue / inbound เก็บแยก 1 property ต่อ 1 event (property ละไม่เกิน 9KB)
const QUEUE_PREFIX = "Q:";
const INBOUND_PREFIX = "I:";
const INBOUND_TOLERANCE_MS = 2000;        // เวลาต่างกันไม่เกินนี้ ถือว่าเป็นการแก้จาก Memento เอง
const INBOUND_MAX_AGE_MS = 3 * 86400000;  // inbound ที่ค้างเกิน 3 วัน → ลบทิ้ง
const LOCK_WAIT_MS = 10000;
const MAX_VALUE_LENGTH = 8000;            // property ละไม่เกิน 9KB

function props() {
  return PropertiesService.getScriptProperties();
}

// { ชื่อ: Calendar ID } จาก property "CAL:*" (ใช้ STORE ถ้าอยู่ใน withLock)
function calendarMap() {
  const all = STORE ? null : props().getProperties();
  const keys = STORE ? STORE.keys(CAL_PREFIX)
    : Object.keys(all).filter(k => k.indexOf(CAL_PREFIX) === 0);
  const map = {};
  keys.forEach(k => {
    const id = String((STORE ? STORE.getRaw(k) : all[k]) || "").trim();
    if (id) map[k.slice(CAL_PREFIX.length)] = id;
  });
  return map;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== Store =====
// อ่าน property ทั้งหมดครั้งเดียว แล้วเขียนกลับครั้งเดียวตอนจบ request
// (เรียก PropertiesService ทีละ key ช้ามาก → Memento timeout)
let STORE = null;

function Store() {
  this.all = props().getProperties();
  this.sets = {};
  this.dels = {};
}

Store.prototype.getRaw = function (key) {
  if (this.dels[key]) return null;
  if (key in this.sets) return this.sets[key];
  return key in this.all ? this.all[key] : null;
};

Store.prototype.setRaw = function (key, value) {
  this.sets[key] = value;
  delete this.dels[key];
};

Store.prototype.remove = function (key) {
  delete this.sets[key];
  if (key in this.all) this.dels[key] = true;
};

Store.prototype.keys = function (prefix) {
  const out = {};
  Object.keys(this.all).concat(Object.keys(this.sets)).forEach(k => {
    if (k.indexOf(prefix) === 0 && !this.dels[k]) out[k] = true;
  });
  return Object.keys(out);
};

Store.prototype.commit = function () {
  if (Object.keys(this.sets).length > 0) props().setProperties(this.sets);
  Object.keys(this.dels).forEach(k => props().deleteProperty(k));
  Object.assign(this.all, this.sets);
  Object.keys(this.dels).forEach(k => delete this.all[k]);
  this.sets = {};
  this.dels = {};
};

// ===== Lock =====
// LockService ปลด lock ให้เองเมื่อ script จบ (แม้ timeout/error) → ไม่ค้างถาวร
function withLock(name, fn) {
  const start = Date.now();
  TIMING = { _last: start };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) {
    console.log(name + ": Locked after " + (Date.now() - start) + " ms");
    return { ok: false, error: "Locked" };
  }
  mark("lockWait");

  let result;
  try {
    STORE = new Store();
    mark("readProps");
    migrateStorage();
    result = fn();
    mark("work");
  } catch (err) {
    console.log(name + " error: " + (err.stack || err));
    result = { ok: false, error: err.message };
  } finally {
    try {
      if (STORE) STORE.commit();
    } catch (err) {
      console.log(name + " commit error: " + (err.stack || err));
    }
    mark("commit");
    STORE = null;
    lock.releaseLock();
  }

  delete TIMING._last;
  TIMING.total = Date.now() - start;
  console.log(name + " timing(ms): " + JSON.stringify(TIMING));
  result.timing = TIMING;
  return result;
}

// ===== Timing =====
// จับเวลาแต่ละขั้นตอน → ดูใน Executions / Log Explorer ว่าช้าตรงไหน
let TIMING = null;

function mark(label) {
  if (!TIMING) return;
  const now = Date.now();
  TIMING[label] = now - TIMING._last;
  TIMING._last = now;
}

// ===== Entry points =====
function doGet() {
  return json({ ok: true, service: "CalendarSync" });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: "Invalid JSON" });
  }
  console.log("doPost: " + data.action);

  switch (data.action) {
    case "createFromMemento":
      return json(withLock(data.action, () => createFromMemento(data.event)));
    case "updateFromMemento":
      return json(withLock(data.action, () => updateFromMemento(data.event)));
    case "deleteFromMemento":
      return json(withLock(data.action, () => deleteFromMemento(data.event)));
    case "getQueue":
      return json(withLock(data.action, getQueue));
    case "ackQueue":
      return json(withLock(data.action, () => ackQueue(data.acks, data.ids)));
    case "manualSync":
      return json(withLock(data.action, runCalendarSync));
    default:
      return json({ ok: false, error: "Unknown action: " + data.action });
  }
}

// time-driven trigger
function calendarSyncTrigger() {
  const res = withLock("calendarSyncTrigger", runCalendarSync);
  console.log(JSON.stringify(res));
}

// ===== Sync time =====
function timeMachine() {
  const time = new Date(2026, 8, 13, 16).toISOString();
  setLastCalendarSyncTime(time);
}

function getLastCalendarSyncTime() {
  const today = new Date();
  const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);

  const saved = STORE ? STORE.getRaw("lastSyncTime") : props().getProperty("lastSyncTime");
  return saved || defaultDate.toISOString();
}

function setLastCalendarSyncTime(ts) {
  if (STORE) STORE.setRaw("lastSyncTime", ts);
  else props().setProperty("lastSyncTime", ts);
}

// ===== Storage (ผ่าน STORE เท่านั้น) =====
function readPrefixed(prefix) {
  const out = {};
  STORE.keys(prefix).forEach(k => {
    out[k.slice(prefix.length)] = JSON.parse(STORE.getRaw(k));
  });
  return out;
}

function readItem(prefix, eid) {
  const raw = STORE.getRaw(prefix + eid);
  return raw ? JSON.parse(raw) : null;
}

function writeItem(prefix, eid, obj) {
  STORE.setRaw(prefix + eid, JSON.stringify(obj));
}

function removeItem(prefix, eid) {
  STORE.remove(prefix + eid);
}

// ย้ายข้อมูลรูปแบบเก่า (SyncQueue / Inbound ก้อนเดียว, GLOBAL_LOCK) → รูปแบบใหม่ ทำครั้งเดียว
function migrateStorage() {
  const oldQueue = STORE.getRaw("SyncQueue");
  if (oldQueue) {
    const parsed = JSON.parse(oldQueue);
    if (Array.isArray(parsed)) {
      parsed.forEach(item => writeItem(QUEUE_PREFIX, item.eid, {
        action: item.action,
        modified: item.modified,
        payload: item.payload || null
      }));
    } else {
      Object.keys(parsed).forEach(eid => writeItem(QUEUE_PREFIX, eid, parsed[eid]));
    }
    STORE.remove("SyncQueue");
  }

  const oldInbound = STORE.getRaw("Inbound");
  if (oldInbound) {
    const parsed = JSON.parse(oldInbound);
    Object.keys(parsed).forEach(eid => {
      if (parsed[eid] && typeof parsed[eid] === "object") writeItem(INBOUND_PREFIX, eid, parsed[eid]);
    });
    STORE.remove("Inbound");
  }

  STORE.remove("GLOBAL_LOCK");
}

// ===== Queue (Calendar → Memento) =====
function pushQueue(eid, action, modified, payload) {
  const old = readItem(QUEUE_PREFIX, eid);

  // มีอยู่แล้ว และอันใหม่ไม่ใหม่กว่า → drop
  if (old && new Date(modified) <= new Date(old.modified)) return;

  const item = { action, modified, payload };
  if (JSON.stringify(item).length > MAX_VALUE_LENGTH) {
    // เกิน 9KB (description ยาวมาก) → ตัด description ให้สั้นลง
    payload.description = (payload.description || "").slice(0, 2000);
  }
  writeItem(QUEUE_PREFIX, eid, item);
}

function getQueue() {
  return { ok: true, queue: readPrefixed(QUEUE_PREFIX) };
}

// acks = {eid: modified} → ลบเฉพาะ version ที่ Memento ทำไปแล้ว
// ids = [eid] → แบบเก่า ลบทั้งหมด
function ackQueue(acks, ids) {
  const list = acks ? Object.keys(acks) : (ids || []);
  let removed = 0;

  list.forEach(eid => {
    const item = readItem(QUEUE_PREFIX, eid);
    if (!item) return;
    // ระหว่างที่ Memento ทำงาน มี version ใหม่กว่าเข้ามา → เก็บไว้ให้ sync รอบหน้า
    if (acks && acks[eid] && new Date(item.modified) > new Date(acks[eid])) return;

    removeItem(QUEUE_PREFIX, eid);
    removed++;
  });

  return { ok: true, removed: removed };
}

// ===== Inbound (Memento → Calendar, กันไม่ให้ส่งกลับไป Memento ซ้ำ) =====
function pushInbound(eid, action, modified) {
  const item = readItem(INBOUND_PREFIX, eid) || {};
  item[action] = modified;
  writeItem(INBOUND_PREFIX, eid, item);
}

function latestInbound(item) {
  return Math.max.apply(null, Object.keys(item).map(k => new Date(item[k]).getTime()));
}

function pruneInbound() {
  const all = readPrefixed(INBOUND_PREFIX);
  const now = Date.now();
  Object.keys(all).forEach(eid => {
    if (now - latestInbound(all[eid]) > INBOUND_MAX_AGE_MS) removeItem(INBOUND_PREFIX, eid);
  });
}

// ===== Rules =====
function isBusy(calendar, title) {
  title = title || "";
  return (calendar == "Kim" && ["ORนอกเวลา", "Consult"].some(key => key == title)) ||
    ((calendar == "Remind" || calendar == "Family") && ["อบรม", "กลับ", "เที่ยว", "ประชุม", "งาน"].some(key => title.includes(key))) ||
    (calendar == "Teach");
}

function isOutOfDuty(calendar, title) {
  title = title || "";
  return (calendar === "Family" || calendar === "Remind") &&
    ["อบรม", "กลับ", "เที่ยว", "ประชุม", "งาน"].some(k => title.includes(k));
}

function reminderMinutes(ev) {
  return Number(ev.minuteset) || 30;
}

function transparencyFor(ev) {
  return isBusy(ev.calendar, ev.title)
    ? CalendarApp.EventTransparency.OPAQUE
    : CalendarApp.EventTransparency.TRANSPARENT;
}

function dayCount(start, end) {
  return Math.round((end - start) / 86400000);
}

// ===== Calendar helpers =====
function getCalendar(name) {
  const id = calendarMap()[name];
  if (!id) throw new Error("Unknown calendar: " + name);

  const cal = CalendarApp.getCalendarById(id);
  if (!cal) throw new Error("Cannot access calendar: " + name);
  return cal;
}

// หาใน calendar ที่ระบุก่อน แล้วค่อยไล่หาใน calendar อื่น
function findEvent(eid, preferName) {
  const map = calendarMap();
  const names = [preferName].concat(Object.keys(map).filter(n => n !== preferName));

  for (let i = 0; i < names.length; i++) {
    const calId = map[names[i]];
    if (!calId) continue;

    const cal = CalendarApp.getCalendarById(calId);
    if (!cal) continue;

    const ev = cal.getEventById(eid);
    if (ev) return { calname: names[i], cal: cal, ev: ev };
  }

  return null;
}

function createEvent(calendar, ev) {
  const start = new Date(ev.date);
  const end = new Date(ev.enddate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date/time");
  }

  const title = ev.title || "";
  const options = { description: ev.description || "", location: ev.location || "" };
  let gEvent;

  if (ev.allday) {
    gEvent = dayCount(start, end) > 1
      ? calendar.createAllDayEvent(title, start, end, options)
      : calendar.createAllDayEvent(title, start, options);
  } else {
    gEvent = calendar.createEvent(title, start, end, options);
  }

  if (ev.remindset) {
    gEvent.addPopupReminder(reminderMinutes(ev));
  }
  gEvent.setTransparency(transparencyFor(ev));

  return gEvent;
}

function createdResult(gEvent) {
  const eid = gEvent.getId();
  const modified = gEvent.getLastUpdated();
  const created = gEvent.getDateCreated();

  pushInbound(eid, "create", new Date(modified).toISOString());

  return { ok: true, eid: eid, ModifiedTime: modified, CreatedTime: created };
}

// ===== Memento → Calendar =====
function createFromMemento(ev) {
  return createdResult(createEvent(getCalendar(ev.calendar), ev));
}

function updateFromMemento(ev) {
  console.log("=== UPDATE " + ev.eid + " (" + ev.calendar + ") ===");

  const found = findEvent(ev.eid, ev.calendar);
  if (!found) throw new Error("Event not found in any calendar");

  if (found.calname !== ev.calendar) {
    // ย้าย calendar → ลบของเดิม แล้วสร้างใหม่ (eid เปลี่ยน)
    console.log("Move " + found.calname + " → " + ev.calendar);
    found.ev.deleteEvent();
    pushInbound(ev.eid, "delete", new Date().toISOString());

    return createdResult(createEvent(getCalendar(ev.calendar), ev));
  }

  const gEvent = found.ev;
  const start = new Date(ev.date);
  const end = new Date(ev.enddate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date/time");
  }

  if (ev.allday) {
    const same = gEvent.isAllDayEvent() &&
      gEvent.getAllDayStartDate().getTime() === start.getTime() &&
      gEvent.getAllDayEndDate().getTime() === end.getTime();
    if (!same) {
      if (dayCount(start, end) > 1) gEvent.setAllDayDates(start, end);
      else gEvent.setAllDayDate(start);
    }
  } else {
    if (gEvent.isAllDayEvent() ||
        gEvent.getStartTime().getTime() !== start.getTime() ||
        gEvent.getEndTime().getTime() !== end.getTime()) {
      gEvent.setTime(start, end);
    }
  }

  const title = ev.title || "";
  if (gEvent.getTitle() !== title) gEvent.setTitle(title);
  if ((gEvent.getDescription() || "") !== (ev.description || "")) gEvent.setDescription(ev.description || "");
  if ((gEvent.getLocation() || "") !== (ev.location || "")) gEvent.setLocation(ev.location || "");

  const oldRemind = gEvent.getPopupReminders();
  if (ev.remindset) {
    const minutes = reminderMinutes(ev);
    if (oldRemind.length !== 1 || oldRemind[0] !== minutes) {
      gEvent.removeAllReminders();
      gEvent.addPopupReminder(minutes);
    }
  } else if (oldRemind.length > 0) {
    gEvent.removeAllReminders();
  }

  const newTrans = transparencyFor(ev);
  if (gEvent.getTransparency() !== newTrans) gEvent.setTransparency(newTrans);

  const modified = gEvent.getLastUpdated();
  pushInbound(ev.eid, "update", new Date(modified).toISOString());

  return { ok: true, ModifiedTime: modified };
}

function deleteFromMemento(ev) {
  const found = findEvent(ev.eid, ev.calendar);

  // ไม่พบ = ถูกลบไปแล้ว → ถือว่าสำเร็จ
  if (!found) return { ok: true, notFound: true };

  found.ev.deleteEvent();
  pushInbound(ev.eid, "delete", new Date().toISOString());

  return { ok: true };
}

// ===== Calendar → Memento =====
function runCalendarSync() {
  const lastSync = getLastCalendarSyncTime();
  const now = new Date().toISOString();

  mark("migrate");
  const changes = loadCalendarChanges(lastSync);
  mark("fetchCalendars");
  console.log("lastSync = " + lastSync + ", now = " + now + ", changes = " + changes.length);

  if (changes.length > 0) {
    buildQueueFromCalendarChanges(changes, lastSync);
  }
  pruneInbound();
  mark("buildQueue");

  // ถ้า load ล้มเหลว จะ throw ก่อนถึงตรงนี้ → lastSync ไม่ขยับ ไม่ทำข้อมูลหาย
  setLastCalendarSyncTime(now);

  return { ok: true, changes: changes.length };
}

function changesRequest(calId, since, pageToken) {
  let url = "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(calId) + "/events"
    + "?showDeleted=true&maxResults=2500&updatedMin=" + encodeURIComponent(since);
  if (pageToken) url += "&pageToken=" + encodeURIComponent(pageToken);

  return {
    url: url,
    method: "get",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };
}

function parseChanges(calName, res) {
  if (res.getResponseCode() !== 200) {
    throw new Error("Calendar API (" + calName + ") " + res.getResponseCode() + ": " +
      res.getContentText().slice(0, 200));
  }
  return JSON.parse(res.getContentText());
}

function loadCalendarChanges(since) {
  const changes = [];
  const map = calendarMap();
  const calNames = Object.keys(map);
  if (calNames.length === 0) throw new Error("No calendars in Script Properties (CAL:*), run setupCalendars()");

  // หน้าแรกของทุก calendar ยิงพร้อมกัน (fetchAll) → เร็วกว่ายิงทีละอัน
  const firstPages = UrlFetchApp.fetchAll(
    calNames.map(calName => changesRequest(map[calName], since, null))
  );

  calNames.forEach((calName, i) => {
    let body = parseChanges(calName, firstPages[i]);

    while (true) {
      (body.items || []).forEach(ev => {
        changes.push({
          calendar: calName,
          eid: ev.iCalUID || (ev.id + "@google.com"),
          status: ev.status,
          summary: ev.summary,
          description: ev.description,
          location: ev.location,
          start: ev.start,
          end: ev.end,
          updated: ev.updated,
          created: ev.created
        });
      });

      if (!body.nextPageToken) break;
      // หน้าถัดไป (เกิดน้อยมาก) → ยิงทีละหน้า
      const res = UrlFetchApp.fetch(changesRequest(map[calName], since, body.nextPageToken).url, {
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      });
      body = parseChanges(calName, res);
    }
  });

  return changes;
}

function buildQueueFromCalendarChanges(changes, lastSync) {
  changes.sort((a, b) => new Date(a.updated) - new Date(b.updated));

  changes.forEach(ch => {
    const eid = ch.eid;
    const modified = ch.updated || new Date().toISOString();
    const action = (ch.status === "cancelled") ? "delete"
      : (new Date(ch.created) > new Date(lastSync)) ? "create"
      : "update";

    // inbound: ถ้า Memento เป็นคนแก้ล่าสุด → ไม่ต้องส่งกลับไป Memento
    const inbound = readItem(INBOUND_PREFIX, eid);
    if (inbound) {
      const inboundTS = latestInbound(inbound);
      const changeTS = new Date(modified).getTime();
      removeItem(INBOUND_PREFIX, eid);

      console.log("Inbound hit: " + eid + " " + action + " drop=" + (inboundTS + INBOUND_TOLERANCE_MS >= changeTS));
      if (inboundTS + INBOUND_TOLERANCE_MS >= changeTS) return;
    }

    // event ที่ถูกลบ API ส่งมาแค่ id/status → start/end อาจไม่มี
    const start = ch.start || {};
    const end = ch.end || {};
    const title = ch.summary || "";
    const remind = isBusy(ch.calendar, title);

    pushQueue(eid, action, modified, {
      calendar: ch.calendar,
      title: title,
      description: ch.description || "",
      location: ch.location || "",
      allday: !!start.date,
      date: start.date || start.dateTime,
      enddate: end.date || end.dateTime,
      start: start.date || start.dateTime,
      end: end.date || end.dateTime,
      remindset: remind,
      minuteset: remind ? 30 : "",
      holiday: ch.calendar === "Holidays",
      outofduty: isOutOfDuty(ch.calendar, title)
    });
  });
}

// ===== Setup (รันเองใน Apps Script editor) =====
// หา/สร้างปฏิทินตาม DEFAULT_CALENDARS แล้วบันทึก ID เป็น property CAL:<ชื่อ>
// ชื่อที่มี property อยู่แล้วจะไม่แตะ, Kim = ปฏิทินหลักของบัญชี (primary)
function setupCalendars() {
  const p = props();
  const existing = p.getProperties();

  DEFAULT_CALENDARS.forEach(name => {
    const key = CAL_PREFIX + name;
    if (existing[key]) {
      console.log(name + ": already set " + existing[key]);
      return;
    }

    if (name === "Kim") {
      p.setProperty(key, "primary");
      console.log(name + ": primary");
      return;
    }

    const found = CalendarApp.getOwnedCalendarsByName(name);
    if (found.length > 1) {
      console.log(name + ": found " + found.length + " calendars with this name, set " + key + " by hand");
      return;
    }
    const cal = found.length === 1 ? found[0] : CalendarApp.createCalendar(name);
    p.setProperty(key, cal.getId());
    console.log(name + (found.length === 1 ? ": found " : ": created ") + cal.getId());
  });

  listCalendars();
}

// แสดงทุกปฏิทินในบัญชีพร้อม ID และบอกว่าผูกกับ CAL:<ชื่อ> ไหน
function listCalendars() {
  const map = calendarMap();
  const primaryId = CalendarApp.getDefaultCalendar().getId();
  const linked = {};
  Object.keys(map).forEach(name => {
    const id = map[name] === "primary" ? primaryId : map[name];
    linked[id] = (linked[id] ? linked[id] + ", " : "") + CAL_PREFIX + name;
  });

  console.log("--- Calendars in this account ---");
  CalendarApp.getAllCalendars().forEach(cal => {
    const id = cal.getId();
    console.log(cal.getName() + " | " + id + (linked[id] ? " | " + linked[id] : ""));
  });

  console.log("--- Script Properties ---");
  Object.keys(map).forEach(name => {
    const ok = CalendarApp.getCalendarById(map[name]) ? "ok" : "CANNOT ACCESS";
    console.log(CAL_PREFIX + name + " = " + map[name] + " | " + ok);
  });
}
