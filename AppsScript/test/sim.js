// End-to-end simulation: Memento CalendarSync.js <-> Apps Script Code.gs
process.env.TZ = "Asia/Bangkok";
const fs = require("fs");
const vm = require("vm");
const moment = require("moment");

const REPO = require("path").join(__dirname, "..", "..") + "/";
const DAY = 86400000;

// ---------- fake clock ----------
const RealDate = Date;
let NOW = RealDate.parse("2026-10-03T02:00:00Z");
class FakeDate extends RealDate {
  constructor(...a) { if (a.length === 0) super(NOW); else super(...a); }
  static now() { return NOW; }
}
function tick(ms) { NOW += ms || 60000; }
function isDate(x) { return x && typeof x.getTime === "function"; }
function midnight(d) { const x = new RealDate(isDate(d) ? d.getTime() : d); x.setHours(0, 0, 0, 0); return x.getTime(); }
function ymd(ms) { return moment(ms).format("YYYY-MM-DD"); }

// ---------- fake Google Calendar ----------
const gcal = {};   // calId -> {events:{}}
let gseq = 1;
let httpCalls = 0;

function touch(ev) { ev.updated = new FakeDate().toISOString(); }

function mkEvent(calId, o) {
  const id = "ev" + (gseq++);
  const t = new FakeDate().toISOString();
  const ev = {
    id, iCalUID: id + "@google.com", calId,
    title: o.title || "", description: o.description || "", location: o.location || "",
    start: o.start, end: o.end, allDay: !!o.allDay,
    reminders: [], transparency: "OPAQUE",
    created: t, updated: t, status: "confirmed",
  };
  gcal[calId].events[id] = ev;
  return ev;
}

function wrapEvent(ev) {
  return {
    getId: () => ev.iCalUID,
    getLastUpdated: () => new FakeDate(ev.updated),
    getDateCreated: () => new FakeDate(ev.created),
    deleteEvent: () => { ev.status = "cancelled"; touch(ev); },
    isAllDayEvent: () => ev.allDay,
    getAllDayStartDate: () => { if (!ev.allDay) throw new Error("not all-day"); return new FakeDate(ev.start); },
    getAllDayEndDate: () => { if (!ev.allDay) throw new Error("not all-day"); return new FakeDate(ev.end); },
    setAllDayDate: d => { ev.allDay = true; ev.start = midnight(d); ev.end = ev.start + DAY; touch(ev); },
    setAllDayDates: (s, e) => { ev.allDay = true; ev.start = midnight(s); ev.end = midnight(e); touch(ev); },
    getStartTime: () => new FakeDate(ev.start),
    getEndTime: () => new FakeDate(ev.end),
    setTime: (s, e) => { ev.allDay = false; ev.start = s.getTime(); ev.end = e.getTime(); touch(ev); },
    getTitle: () => ev.title, setTitle: v => { ev.title = v; touch(ev); },
    getDescription: () => ev.description, setDescription: v => { ev.description = v; touch(ev); },
    getLocation: () => ev.location, setLocation: v => { ev.location = v; touch(ev); },
    getPopupReminders: () => ev.reminders.slice(),
    removeAllReminders: () => { ev.reminders = []; touch(ev); },
    addPopupReminder: m => { ev.reminders.push(m); touch(ev); },
    getTransparency: () => ev.transparency,
    setTransparency: t => { ev.transparency = t; touch(ev); },
  };
}

function wrapCal(calId) {
  const cal = gcal[calId];
  return {
    getEventById: uid => {
      const ev = Object.values(cal.events).find(e => e.iCalUID === uid && e.status !== "cancelled");
      return ev ? wrapEvent(ev) : null;
    },
    createEvent: (title, s, e, opts) => wrapEvent(mkEvent(calId, Object.assign({ title, start: s.getTime(), end: e.getTime() }, opts))),
    createAllDayEvent: (title, s, a3, a4) => {
      const multi = isDate(a3);
      const start = midnight(s);
      const end = multi ? midnight(a3) : start + DAY;
      return wrapEvent(mkEvent(calId, Object.assign({ title, start, end, allDay: true }, multi ? a4 : a3)));
    },
  };
}

function apiItem(ev) {
  if (ev.status === "cancelled") return { id: ev.id, status: "cancelled", updated: ev.updated };
  const t = ms => ev.allDay ? { date: ymd(ms) } : { dateTime: moment(ms).format() };
  return {
    id: ev.id, iCalUID: ev.iCalUID, status: ev.status, summary: ev.title,
    description: ev.description || undefined, location: ev.location || undefined,
    start: t(ev.start), end: t(ev.end), updated: ev.updated, created: ev.created,
  };
}

function apiFetch(url) {
  const m = url.match(/calendars\/([^/]+)\/events\?(.*)$/);
  const calId = decodeURIComponent(m[1]);
  const q = new URLSearchParams(m[2]);
  const since = RealDate.parse(q.get("updatedMin"));
  const items = Object.values(gcal[calId].events).filter(e => RealDate.parse(e.updated) >= since).map(apiItem);
  return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ items }) };
}

// ---------- Apps Script context ----------
// Calendar ID ปลอม ใส่ไว้ใน Script Properties แบบเดียวกับของจริง (CAL:<ชื่อ>)
const CAL = {};
["Kim", "Holidays", "Remind", "Teach", "Family", "Other", "Test"].forEach(n => { CAL[n] = n === "Kim" ? "primary" : "cal-" + n.toLowerCase(); });
let PROPS = {};
Object.keys(CAL).forEach(n => { PROPS["CAL:" + n] = CAL[n]; });
const gas = vm.createContext({
  Date: FakeDate, console: { log: () => {} }, JSON, Math, Object, Array, String, Number, isNaN, encodeURIComponent, decodeURIComponent,
  Logger: { log: () => {} },
  PropertiesService: { getScriptProperties: () => ({
    getProperties: () => Object.assign({}, PROPS),
    getProperty: k => (k in PROPS ? PROPS[k] : null),
    setProperty: (k, v) => { PROPS[k] = v; },
    setProperties: o => { Object.assign(PROPS, o); },
    deleteProperty: k => { delete PROPS[k]; },
  }) },
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
  ContentService: { createTextOutput: s => ({ content: s, setMimeType() { return this; } }), MimeType: { JSON: "json" } },
  CalendarApp: {
    getCalendarById: id => (gcal[id] ? wrapCal(id) : null),
    EventTransparency: { OPAQUE: "OPAQUE", TRANSPARENT: "TRANSPARENT" },
  },
  UrlFetchApp: { fetch: (url) => apiFetch(url), fetchAll: reqs => reqs.map(r => apiFetch(r.url)) },
  ScriptApp: { getOAuthToken: () => "token" },
});
vm.runInContext(fs.readFileSync(process.env.GAS || (REPO + "AppsScript/Code.gs"), "utf8"), gas);
Object.values(CAL).forEach(id => { gcal[id] = { events: {} }; });

// ---------- Memento context ----------
let mEntries = [];
let mseq = 1;
let messages = [];
function MEntry(fields) { this.id = "m" + (mseq++); this.f = Object.assign({}, fields); this.trashed = false; }
MEntry.prototype.field = function (n) { return this.f[n] === undefined ? null : this.f[n]; };
MEntry.prototype.set = function (n, v) { this.f[n] = v; };
MEntry.prototype.trash = function () { this.trashed = true; };

const mem = vm.createContext({
  Date: FakeDate, JSON, Math, Object, Array, String, Number, moment,
  message: s => messages.push(s),
  log: () => {},
  cancel: () => { throw new Error("CANCELLED"); },
  lib: () => ({
    entries: () => mEntries.filter(e => !e.trashed).slice().reverse(),
    create: o => { const e = new MEntry(o); mEntries.push(e); return e; },
  }),
  http: () => ({
    headers() {},
    post: (url, body) => {
      httpCalls++;
      const out = vm.runInContext("doPost", gas)({ postData: { contents: body } });
      return { code: 200, body: out.content };
    },
  }),
});
vm.runInContext("var APP_SCRIPT_URL = 'https://example.invalid/exec';\n" + fs.readFileSync(REPO + "CalendarSync.js", "utf8"), mem);
const M = name => vm.runInContext(name, mem);

// ---------- user actions ----------
const mUser = {
  create(fields) { const e = new MEntry(fields); mEntries.push(e); M("validate")(e); M("onCreateEntry")(e); tick(); return e; },
  edit(e, changes) { Object.assign(e.f, changes); M("validate")(e); M("onUpdateEntry")(e); tick(); return e; },
  delete(e) { M("onDeleteEntry")(e); e.trash(); tick(); },
};
const gUser = {
  create(calName, o) { const ev = mkEvent(CAL[calName], o); tick(); return ev; },
  edit(ev, changes) { Object.assign(ev, changes); touch(ev); tick(); return ev; },
  delete(ev) { ev.status = "cancelled"; touch(ev); tick(); },
};
function syncNow() { messages = []; M("syncNow")(); tick(); return messages.slice(); }
function findG(uid) { for (const id in gcal) for (const k in gcal[id].events) { const e = gcal[id].events[k]; if (e.iCalUID === uid) return e; } return null; }
function liveM() { return mEntries.filter(e => !e.trashed); }
function at(dayOffset, h, mi) { const d = new RealDate(NOW); d.setHours(0, 0, 0, 0); return new RealDate(d.getTime() + dayOffset * DAY + ((h || 0) * 60 + (mi || 0)) * 60000); }
function calNameOf(ev) { return Object.keys(CAL).find(n => CAL[n] === ev.calId); }

// ---------- assertions ----------
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  PASS " + name); }
  else { fail++; console.log("  FAIL " + name + (detail !== undefined ? "  -> " + JSON.stringify(detail) : "")); }
}
function section(t) { console.log("\n== " + t); }
function noEcho(label) { const msg = syncNow(); check(label + ": sync ไม่สะท้อนกลับ (No changes)", msg.join("|").includes("No changes"), msg); }

// initial sync to set lastSync
syncNow();

// ===== A. Memento -> Calendar =====
section("A1 สร้าง event มีเวลา ใน Memento");
let e1 = mUser.create({ Title: "ORนอกเวลา", Calendar: "Kim", Date: at(1), StartTime: at(1, 18), EndTime: at(1, 20), AllDay: false });
let g1 = findG(e1.field("eid"));
check("ได้ eid กลับมา", !!e1.field("eid"));
check("Calendar มี event เวลา 18-20", g1 && g1.start === at(1, 18).getTime() && g1.end === at(1, 20).getTime(), g1 && [new Date(g1.start), new Date(g1.end)]);
check("busy → reminder 30 + OPAQUE", g1 && g1.reminders.join() === "30" && g1.transparency === "OPAQUE", g1 && [g1.reminders, g1.transparency]);
check("RemindSet/MinuteSet ใน Memento", e1.field("RemindSet") === true && e1.field("MinuteSet") === 30, [e1.field("RemindSet"), e1.field("MinuteSet")]);
noEcho("A1");

section("A2 สร้าง all-day 1 วัน");
let e2 = mUser.create({ Title: "วันหยุด", Calendar: "Holidays", Date: at(2), AllDay: true });
let g2 = findG(e2.field("eid"));
check("all-day 1 วัน", g2 && g2.allDay && g2.start === at(2).getTime() && g2.end === at(3).getTime(), g2 && [g2.allDay, new Date(g2.start), new Date(g2.end)]);
check("Holiday = true", e2.field("Holiday") === true);
check("ไม่ busy → TRANSPARENT, ไม่มี reminder", g2 && g2.transparency === "TRANSPARENT" && g2.reminders.length === 0, g2 && [g2.transparency, g2.reminders]);
noEcho("A2");

section("A3 สร้าง all-day 3 วัน");
let e3 = mUser.create({ Title: "ประชุมวิชาการ", Calendar: "Remind", Date: at(5), EndDate: at(8), AllDay: true });
let g3 = findG(e3.field("eid"));
check("all-day 3 วัน", g3 && g3.allDay && g3.start === at(5).getTime() && g3.end === at(8).getTime(), g3 && [new Date(g3.start), new Date(g3.end)]);
check("OutOfDuty = true", e3.field("OutOfDuty") === true);
noEcho("A3");

section("A4 แก้ title + เวลา ใน Memento");
mUser.edit(e1, { Title: "Consult", StartTime: at(1, 19), EndTime: at(1, 21) });
g1 = findG(e1.field("eid"));
check("Calendar อัปเดต title/เวลา", g1 && g1.title === "Consult" && g1.start === at(1, 19).getTime() && g1.end === at(1, 21).getTime(), g1 && [g1.title, new Date(g1.start), new Date(g1.end)]);
noEcho("A4");

section("A5 เปลี่ยน event มีเวลา → all-day");
mUser.edit(e1, { AllDay: true });
g1 = findG(e1.field("eid"));
check("Calendar เป็น all-day", g1 && g1.allDay && g1.start === at(1).getTime() && g1.end === at(2).getTime(), g1 && [g1.allDay, new Date(g1.start), new Date(g1.end)]);
noEcho("A5");

section("A6 เปลี่ยน all-day → มีเวลา");
mUser.edit(e1, { AllDay: false, StartTime: at(1, 9), EndTime: at(1, 10), EndDate: null });
g1 = findG(e1.field("eid"));
check("Calendar เป็น event มีเวลา 9-10", g1 && !g1.allDay && g1.start === at(1, 9).getTime() && g1.end === at(1, 10).getTime(), g1 && [g1.allDay, new Date(g1.start), new Date(g1.end)]);
noEcho("A6");

section("A7 ไม่ busy แล้ว → ลบ reminder");
mUser.edit(e1, { Title: "นัดทั่วไป" });
g1 = findG(e1.field("eid"));
check("reminder ถูกลบ + TRANSPARENT", g1 && g1.reminders.length === 0 && g1.transparency === "TRANSPARENT", g1 && [g1.reminders, g1.transparency]);
mUser.edit(e1, { Title: "Consult" });
g1 = findG(e1.field("eid"));
check("กลับเป็น busy → reminder 30 กลับมา", g1 && g1.reminders.join() === "30" && g1.transparency === "OPAQUE", g1 && [g1.reminders, g1.transparency]);
noEcho("A7");

section("A8 ย้าย calendar Kim → Family");
const oldEid = e1.field("eid");
mUser.edit(e1, { Calendar: "Family", Title: "กลับบ้าน" });
const gOld = findG(oldEid);
g1 = findG(e1.field("eid"));
check("eid เปลี่ยน", e1.field("eid") !== oldEid);
check("event เดิมถูกลบ", gOld && gOld.status === "cancelled");
check("event ใหม่อยู่ใน Family", g1 && calNameOf(g1) === "Family" && g1.status === "confirmed");
noEcho("A8");
check("A8: Memento ยังมี entry เดียว (ไม่ถูกลบจาก delete ของ eid เก่า)", liveM().filter(e => e.field("Title") === "กลับบ้าน").length === 1);

section("A9 ลบ event ใน Memento");
const delEid = e2.field("eid");
mUser.delete(e2);
check("Calendar event ถูกลบ", findG(delEid).status === "cancelled");
noEcho("A9");

section("A10 ลบใน Memento แต่ Google ลบไปก่อนแล้ว");
let e10 = mUser.create({ Title: "test", Calendar: "Test", Date: at(3), StartTime: at(3, 8), EndTime: at(3, 9), AllDay: false });
const g10 = findG(e10.field("eid"));
g10.status = "cancelled"; touch(g10);
messages = [];
mUser.delete(e10);
check("ไม่ขึ้น Delete failed", messages.join("|").includes("Delete calendar successful"), messages);
syncNow();

// ===== B. Calendar -> Memento =====
section("B1 สร้าง event มีเวลา ใน Google Calendar");
const gb1 = gUser.create("Kim", { title: "ORนอกเวลา", start: at(4, 17).getTime(), end: at(4, 19).getTime() });
let msg = syncNow();
let eb1 = liveM().find(e => e.field("eid") === gb1.iCalUID);
check("Memento สร้าง entry", !!eb1, msg);
check("เวลา 17-19 ถูกต้อง", eb1 && +eb1.field("StartTime") === at(4, 17).getTime() && +eb1.field("EndTime") === at(4, 19).getTime(), eb1 && [eb1.field("StartTime"), eb1.field("EndTime")]);
check("Calendar/Title/AllDay ถูกต้อง", eb1 && eb1.field("Calendar") === "Kim" && eb1.field("Title") === "ORนอกเวลา" && eb1.field("AllDay") === false);
check("RemindSet = true (busy)", eb1 && eb1.field("RemindSet") === true);
noEcho("B1");

section("B2 สร้าง all-day 2 วัน ใน Google Calendar");
const gb2 = gUser.create("Family", { title: "เที่ยว", start: at(10).getTime(), end: at(12).getTime(), allDay: true });
syncNow();
let eb2 = liveM().find(e => e.field("eid") === gb2.iCalUID);
check("Memento all-day 2 วัน", eb2 && eb2.field("AllDay") === true && +eb2.field("Date") === at(10).getTime() && +eb2.field("EndDate") === at(12).getTime(), eb2 && [eb2.field("AllDay"), eb2.field("Date"), eb2.field("EndDate")]);
check("OutOfDuty = true", eb2 && eb2.field("OutOfDuty") === true);

section("B3 แก้ event ใน Google Calendar");
gUser.edit(gb1, { title: "Consult", start: at(4, 18).getTime(), end: at(4, 20).getTime(), location: "ER" });
syncNow();
eb1 = liveM().find(e => e.field("eid") === gb1.iCalUID);
check("Memento อัปเดต title/เวลา/location", eb1 && eb1.field("Title") === "Consult" && +eb1.field("StartTime") === at(4, 18).getTime() && eb1.field("Location") === "ER", eb1 && [eb1.field("Title"), eb1.field("StartTime"), eb1.field("Location")]);
check("ไม่สร้าง entry ซ้ำ", liveM().filter(e => e.field("eid") === gb1.iCalUID).length === 1);

section("B4 ลบ event ใน Google Calendar");
gUser.delete(gb1);
syncNow();
check("Memento entry ถูก trash", !liveM().some(e => e.field("eid") === gb1.iCalUID));
noEcho("B4");

section("B5 สร้างแล้วลบใน Google ก่อน sync");
const gb5 = gUser.create("Teach", { title: "สอน", start: at(6, 9).getTime(), end: at(6, 12).getTime() });
gUser.delete(gb5);
msg = syncNow();
check("Memento ไม่มี entry", !liveM().some(e => e.field("eid") === gb5.iCalUID));
check("queue ว่าง (ack แล้ว)", !Object.keys(PROPS).some(k => k.startsWith("Q:")), Object.keys(PROPS).filter(k => k.startsWith("Q:")));

section("B6 สร้างแล้วแก้ใน Google ก่อน sync");
const gb6 = gUser.create("Remind", { title: "ประชุม", start: at(7, 13).getTime(), end: at(7, 14).getTime() });
gUser.edit(gb6, { title: "ประชุมกรรมการ" });
syncNow();
const eb6 = liveM().filter(e => e.field("eid") === gb6.iCalUID);
check("มี entry เดียว + title ล่าสุด", eb6.length === 1 && eb6[0].field("Title") === "ประชุมกรรมการ", eb6.map(e => e.field("Title")));

// ===== C. Conflicts =====
section("C1 แก้ใน Memento แล้วแก้ใน Google ทีหลัง (ก่อน sync)");
const ec1 = eb6[0];
mUser.edit(ec1, { Title: "ประชุม A", Date: at(7), StartTime: at(7, 13), EndTime: at(7, 14) });
gUser.edit(gb6, { title: "ประชุม B" });
syncNow();
check("Google ใหม่กว่า → Memento ได้ 'ประชุม B'", ec1.field("Title") === "ประชุม B", ec1.field("Title"));

section("C2 แก้ใน Google แล้วแก้ใน Memento ทีหลัง (ก่อน sync)");
gUser.edit(gb6, { title: "ประชุม C" });
mUser.edit(ec1, { Title: "ประชุม D" });
syncNow();
check("Memento ใหม่กว่า → คงเป็น 'ประชุม D'", ec1.field("Title") === "ประชุม D", ec1.field("Title"));
check("Google เป็น 'ประชุม D'", gb6.title === "ประชุม D", gb6.title);

section("C3 trigger 30 นาที + Sync now");
gUser.create("Other", { title: "เวร", start: at(9, 8).getTime(), end: at(9, 16).getTime() });
vm.runInContext("calendarSyncTrigger", gas)();
tick();
msg = syncNow();
check("event ที่ trigger ดึงไว้ ถูกสร้างใน Memento", liveM().some(e => e.field("Title") === "เวร"), msg);
check("ไม่ซ้ำ", liveM().filter(e => e.field("Title") === "เวร").length === 1);

section("C4 Sync now ซ้ำ");
noEcho("C4");

section("สรุปสถานะ");
check("inbound ไม่ค้างเกิน", Object.keys(PROPS).filter(k => k.startsWith("I:")).length <= 3, Object.keys(PROPS).filter(k => k.startsWith("I:")));
console.log("\nHTTP calls: " + httpCalls);
console.log("RESULT: " + pass + " passed, " + fail + " failed");
