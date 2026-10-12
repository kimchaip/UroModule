# Handoff: CalendarSync (Memento ⇄ Google Calendar)

สถานะ ณ 2026-10-11: **ใช้งานได้ ทดสอบบนเครื่องจริงผ่านครบทุกกรณี** ไม่มีงานค้างของ CalendarSync

2026-10-12: ย้าย Calendar ID ออกจากโค้ดไปไว้ใน Script Properties (`CAL:<ชื่อ>`), เพิ่ม `setupCalendars()` / `listCalendars()` และเอา `AppsScript/` เข้า repo วิธีตั้งค่าใหม่ดู [SETUP.md](SETUP.md)

## 1. ภาพรวม

```
Memento (library ปฏิทิน)                     Apps Script Web App                 Google Calendar (10 ปฏิทิน)
CalendarSync.js  ──POST JSON──────────────▶  Code.gs doPost()  ──CalendarApp──▶  สร้าง/แก้/ลบ event
   ▲                                          │
   │ getQueue / ackQueue                      │ Calendar API (updatedMin) ◀── trigger ทุก 30 นาที + manualSync
   └──────────── queue (Script Properties) ◀──┘
```

- **Memento → Calendar:** trigger ใน Memento เรียก `createFromMemento` / `updateFromMemento` / `deleteFromMemento` ทันทีที่บันทึก
- **Calendar → Memento:** Apps Script อ่านการเปลี่ยนแปลงจาก Calendar API แล้วเก็บเป็น **queue** จากนั้น Memento กด **Sync now** (`syncNow()`) เพื่อสั่ง `manualSync` → `getQueue` → apply → `ackQueue`
- **กันส่งย้อนกลับ (inbound):** ทุกครั้งที่ Memento แก้ Calendar, Apps Script จดเวลาไว้ (`I:<eid>`) พอ Calendar API ส่งการเปลี่ยนแปลงเดียวกันกลับมา จะเทียบเวลาแล้วทิ้ง ไม่ส่งกลับเข้า Memento

## 2. ไฟล์และที่อยู่

| ไฟล์ | ที่อยู่ | หมายเหตุ |
|---|---|---|
| `CalendarSync.js` | repo `github.com/kimchaip/UroModule` branch **`master`** (ไม่ใช่ main) | Memento โหลดจาก raw.githubusercontent.com/kimchaip/UroModule/master/ → **push = deploy ทันที** |
| `Code.gs` | repo `AppsScript/Code.gs` | ไม่มี Calendar ID ในโค้ด อ่านจาก Script Properties `CAL:<ชื่อ>` (ดู [SETUP.md](SETUP.md)) |
| ตัวจำลองทดสอบ | repo `AppsScript/test/sim.js` | `npm install moment` แล้ว `node AppsScript/test/sim.js` จาก root ของ repo |
| Apps Script project | บัญชี Google ของผู้ใช้ | Claude แก้ตรงไม่ได้ ผู้ใช้ copy วางเอง |

Commit ที่เกี่ยวข้อง: `4b4e91b` (แก้บั๊ก CalendarSync), `04fb5f8` (ack แบบมี version), `650ae77` (log จับเวลา) — `CalendarSync.js` ไม่มีการเปลี่ยนแปลงหลังจากนั้น

## 3. วิธี deploy Apps Script (ทุกครั้งที่แก้ Code.gs)

1. วาง `Code.gs` ทั้งไฟล์แทนของเดิมใน Apps Script editor
2. **Deploy > Manage deployments > ✏️ (deployment เดิม) > Version: New version > Deploy** → URL คงเดิม ไม่ต้องแก้ `APP_SCRIPT_URL` (ประกาศใน shared script ของ Memento ไม่อยู่ใน repo)
3. ตั้งค่าที่ต้องถูก: **Execute as = Me**, **Who has access = Anyone** (ถ้าไม่ใช่ Anyone จะได้ 403 "ต้องมีสิทธิ์เข้าถึง"), **Project time zone = (GMT+07:00) Bangkok**
4. ทดสอบ: เปิด URL `/exec` ใน browser → ต้องได้ `{"ok":true,"service":"CalendarSync"}`
5. Time-driven trigger: `calendarSyncTrigger` ทุก 30 นาที

## 4. Memento: CalendarSync.js

ฟังก์ชันหลัก: `validate(e)` (before save), `onCreateEntry(e)` / `onUpdateEntry(e)` (after save), `onDeleteEntry(e)`, `syncNow()` (ปุ่ม Sync now), `syncFromQueue()`, `callAppScript(payload)`, `buildEvent(e, eid)`

**ชื่อ field ใน library ปฏิทิน (ต้องตรงตัวพิมพ์):** `Title, Calendar, Date, EndDate, StartTime, EndTime, AllDay, Description, Location, Holiday, OutOfDuty, RemindSet, MinuteSet, eid, ModifiedTime, CreatedTime`

**ตัวเลือก field `Calendar` ต้องตรงกับชื่อใน Script Properties `CAL:<ชื่อ>`** (ชุดเดิมมี 10 ปฏิทิน: Kim, Holidays, Remind, Teach, Family, Test และปฏิทินของบุคคลอีก 4 อัน) — เคยเจอ `TestSync` ใน Memento ทำให้ได้ error `Unknown calendar: TestSync` และห้ามให้ 2 ชื่อชี้ Calendar ID เดียวกัน

**กฎ busy/reminder (มีทั้งสองฝั่ง ต้องแก้ให้ตรงกัน):**
- `isBusy`: Kim + title เป็น "ORนอกเวลา"/"Consult" | Remind/Family + title มี อบรม/กลับ/เที่ยว/ประชุม/งาน | Teach ทั้งหมด → RemindSet = true, MinuteSet = 30, OPAQUE
- `isOutOfDuty`: Remind/Family + คำเดียวกัน
- Holidays → Holiday = true

**พฤติกรรมที่ทำไว้:**
- `callAppScript` ไม่ crash: network error / HTML response → คืน `{ok:false, error}`; log เวลา round-trip + `server timing`
- `syncFromQueue`: create/update ที่หา entry ไม่เจอ → สร้าง; เจอแล้ว → อัปเดต (ไม่สร้างซ้ำ); delete ที่หา entry ไม่เจอ → ack ทิ้ง; ตอน ack ส่งทั้ง `ids` และ `acks {eid: modified}`
- ตอน update จาก Calendar **ไม่ทับ** `RemindSet`/`MinuteSet` ใน Memento (ตั้งใจ comment ไว้)

## 5. Apps Script: Code.gs (โครงสร้าง)

- **Actions ใน `doPost`:** `createFromMemento, updateFromMemento, deleteFromMemento, getQueue, ackQueue, manualSync`; `doGet` = health check
- **`withLock(name, fn)`:** ใช้ `LockService.getScriptLock()` (รอ 10 วินาที) — แทน lock แบบเก่าใน Properties ที่ค้างถาวรได้
- **`Store`:** อ่าน Script Properties **ครั้งเดียว** ต่อ request (`getProperties`) และเขียน**ครั้งเดียว**ตอนจบ (`setProperties`) — เคยเรียกทีละ key แล้ว Memento timeout
- **Storage keys:** `Q:<eid>` = queue item `{action, modified, payload}`; `I:<eid>` = inbound `{create|update|delete: ISO}`; `lastSyncTime`
  - `migrateStorage()` ย้ายรูปแบบเก่า (`SyncQueue`, `Inbound` ก้อนเดียว, `GLOBAL_LOCK`) อัตโนมัติ — ทำไปแล้ว
- **`loadCalendarChanges`:** `UrlFetchApp.fetchAll` ทุกปฏิทินพร้อมกัน, `showDeleted=true`, อ่าน `nextPageToken`, ถ้า API error → throw (lastSyncTime ไม่ขยับ ข้อมูลไม่หาย)
- **`buildQueueFromCalendarChanges`:** eid = `iCalUID` (fallback `id + "@google.com"`); action = cancelled→delete, created > lastSync→create, อื่นๆ→update; inbound เทียบเวลาล่าสุด ± `INBOUND_TOLERANCE_MS` (2 วินาที) → ถ้า Memento แก้ล่าสุด ทิ้ง; event ที่ถูกลบ API ส่งมาแค่ id/status (start/end ไม่มี)
- `pruneInbound` ลบ inbound ที่เก่ากว่า 3 วัน; `pushQueue` ตัด description ถ้า item > 8000 ตัวอักษร (ลิมิต 9KB/property)
- **`updateFromMemento`:** หา event ในปฏิทินที่ระบุก่อน แล้วไล่ที่อื่น; ถ้าเปลี่ยนปฏิทิน → ลบของเดิม + สร้างใหม่ (**eid เปลี่ยน**, คืน eid ใหม่ให้ Memento); เช็ก `isAllDayEvent()` ก่อนเรียก `getAllDayStartDate()`
- **`deleteFromMemento`:** หาไม่เจอ = ถือว่าลบแล้ว คืน ok
- **Logging:** ใช้ `console.log` เท่านั้น (`Logger.log` ไม่ไป Cloud Logging เพราะผูก GCP project) — ทุก request log `"<action> timing(ms): {...}"` ดูใน Apps Script > Executions หรือ Log Explorer

## 6. ผลทดสอบ / ข้อเท็จจริงที่ยืนยันแล้ว

- Performance: Sync now ≈ 3 วินาที round-trip, ฝั่ง server < 1 วินาที (fetchCalendars ~0.4–0.7s, lockWait ~150ms) ส่วนที่เหลือเป็น overhead ของ Google
- ตัวจำลอง `sim.js`: 50/50 ผ่าน (Memento→Calendar 10 กรณี, Calendar→Memento 6 กรณี, conflict 4 กรณี) และ mutation test ยืนยันว่าจับบั๊กได้จริง
- บนเครื่องจริงผ่าน 6/6: สร้างใน Memento + ไม่สะท้อนกลับ, แก้ใน Memento + ไม่สะท้อนกลับ, สร้างใน Google + ไม่ซ้ำ, all-day วันที่ไม่เลื่อน, ลบใน Google, ย้ายปฏิทิน
- **Memento: entry ที่ script สร้าง/`set()` จะไม่ไปกระตุ้น trigger `onCreateEntry`/`onUpdateEntry`** → ไม่มี sync วนลูป
- เวลาจาก `getLastUpdated()` ตรงกับ `updated` ของ API พอ (tolerance 2 วินาทีเพียงพอ)

## 7. ข้อควรระวัง / เคยเจอ

- 403 "การเข้าถึงถูกปฏิเสธ" = deployment ไม่ได้ตั้ง Who has access = Anyone
- `Script function not found: doGet` = เคยเกิดตอนเปิด URL ใน browser ก่อนเพิ่ม `doGet` (ตอนนี้มีแล้ว)
- Memento `http()` timeout ราว ~10+ วินาที → อย่าทำงานหนักใน request (อย่ากลับไปเรียก PropertiesService ทีละ key)
- PowerShell: commit message ที่มี `"` ให้ใช้ `git commit -F <file>`
- `timeMachine()` ใน Code.gs ใช้ตั้ง `lastSyncTime` ย้อนหลังเพื่อดึงการเปลี่ยนแปลงเก่าใหม่ (เรียกด้วยมือ นอก lock)

## 8. เรื่องที่เกี่ยวข้อง (ไม่ใช่ CalendarSync โดยตรง)

- **Google Sheets sync ของ library UroCRH:** Memento ไม่ให้เรียก `syncGoogleSheet()` จาก trigger แบบ **Scheduled** (error "Google Sheets sync isn't available in this context") → ผู้ใช้ย้ายไปไว้ใน trigger **Opening a library** ของ UroCRH เขียนแยกใน Memento (ไม่อยู่ใน UroObj.js) sync เมื่อห่างครั้งล่าสุด ≥ 12 ชม. เก็บเวลาในไฟล์ `lastsync_UroCRH.txt` (ใช้ `Date.now()`) — ไม่มี error; ยังไม่ได้ยืนยันว่าการนับ 12 ชม. จำเวลาได้จริง (เปิด library 2 ครั้งติด ครั้งที่ 2 ต้องไม่ sync; ถ้ายัง sync ให้ใช้ path เต็ม `/sdcard/Download/...`)
- หลังจากนี้มี commit อื่นใน `UroObj.js` (PR #46, #47: Previous loading และ throttle Google Sheet sync library-wide) — ไม่เกี่ยวกับ CalendarSync.js

## 9. ไอเดียที่ยังไม่ได้ทำ (ถ้าต้องการ)

- รวมกฎ `isBusy`/`isOutOfDuty` ให้มีที่เดียว (ตอนนี้ซ้ำทั้งสองฝั่ง แก้ฝั่งเดียวจะไม่ตรงกัน)
- Recurring events ยังไม่ได้รองรับเป็นพิเศษ (instance ที่แก้แยกจะได้ id แบบ `xxx_20261002T...`)
- ถ้าอยากให้ Sync now เร็วขึ้นอีก: ให้ Sync now เรียกแค่ `getQueue` (ให้ trigger 30 นาทีเป็นตัวดึงจาก Calendar)
