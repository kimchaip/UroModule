# ตั้งค่า CalendarSync (Memento ⇄ Google Calendar)

คู่มือนี้สำหรับคนที่จะเอา CalendarSync ไปใช้กับบัญชี Google ของตัวเอง ภาพรวมการทำงานและรายละเอียดโค้ดดู [HANDOFF_CalendarSync.md](HANDOFF_CalendarSync.md)

ในโค้ดไม่มีค่าเฉพาะของแต่ละคน ค่าที่ต้องตั้งเองมี 2 อย่าง:

| ค่า | เก็บที่ไหน | ตั้งในขั้นตอน |
|---|---|---|
| Calendar ID ของแต่ละปฏิทิน | Script Properties ของ Apps Script, key `CAL:<ชื่อ>` | 2 |
| URL ของ Web App (`/exec`) | ตัวแปร `APP_SCRIPT_URL` ใน shared script ของ Memento | 5 |

**ห้าม commit ทั้งสองค่านี้ลง repo** repo นี้เป็น public และ `doPost` ไม่ได้ตรวจว่าใครเรียก ใครมี URL ก็สั่งสร้าง/แก้/ลบ event ได้

## 1. สร้างโปรเจกต์ Apps Script

1. เปิด https://script.google.com > **New project** ตั้งชื่อ เช่น `CalendarSync`
2. ลบโค้ดตัวอย่าง แล้ววาง [`Code.gs`](Code.gs) ทั้งไฟล์ > Save
3. **Project Settings** (รูปเฟือง) > **Time zone** = `(GMT+07:00) Bangkok`
4. **Services** (เครื่องหมาย + ข้าง Services) > เลือก **Google Calendar API** > Add
   `Code.gs` เรียก Calendar API โดยตรงเพื่อดึงการเปลี่ยนแปลง ขั้นนี้ทำให้ API เปิดใช้งานในโปรเจกต์

## 2. สร้างปฏิทินและเก็บ Calendar ID

ชื่อปฏิทินในระบบนี้คือชื่อที่ใช้ใน Memento (field `Calendar`) ไม่จำเป็นต้องตรงกับชื่อที่เห็นใน Google Calendar แต่ถ้าใช้ `setupCalendars()` จะหาจากชื่อใน Google Calendar

ชื่อที่มีความหมายในโค้ด (กฎ busy/reminder อยู่ทั้งใน `Code.gs` และ `CalendarSync.js`):

| ชื่อ | ความหมาย |
|---|---|
| `Kim` | ปฏิทินหลักของบัญชี (`primary`) title "ORนอกเวลา" หรือ "Consult" → busy + เตือน 30 นาที |
| `Holidays` | วันหยุด → ตั้ง `Holiday` = true ใน Memento |
| `Remind`, `Family` | title มี อบรม/กลับ/เที่ยว/ประชุม/งาน → busy + เตือน และนับเป็นวันไม่อยู่ (`OutOfDuty`) |
| `Teach` | ทุก event เป็น busy + เตือน |

ปฏิทินอื่น (เช่น ของเพื่อนร่วมงาน) ตั้งชื่ออะไรก็ได้ sync ปกติแต่ไม่มีกฎพิเศษ

### วิธี ก: ให้สคริปต์ทำให้ (แนะนำ)

1. ใน editor เลือกฟังก์ชัน **`setupCalendars`** จาก dropdown ด้านบน > **Run**
2. ครั้งแรกจะขอสิทธิ์ > **Review permissions** > เลือกบัญชี > (ถ้าขึ้น "Google hasn't verified this app" กด Advanced > Go to CalendarSync) > **Allow**
3. ดูผลใน **Execution log**
   - `Kim: primary` ใช้ปฏิทินหลัก
   - `found <id>` เจอปฏิทินชื่อนั้นที่บัญชีนี้เป็นเจ้าของอยู่แล้ว ใช้อันนั้น
   - `created <id>` ไม่เจอ จึงสร้างใหม่
   - `already set` มี property อยู่แล้ว ไม่แตะ
   - `found N calendars with this name` มีชื่อซ้ำ ต้องตั้งเองตามวิธี ข
4. ท้าย log จะเรียก `listCalendars()` ให้ แสดงทุกปฏิทินในบัญชีพร้อม ID และบอกว่า property ไหนเข้าถึงไม่ได้ (`CANNOT ACCESS`)

รัน `setupCalendars()` ซ้ำได้ จะเติมเฉพาะชื่อที่ยังขาด

### วิธี ข: ตั้งเองทีละปฏิทิน

ใช้กับปฏิทินที่ไม่อยู่ในรายการข้างบน หรือปฏิทินที่คนอื่นแชร์มา

1. สร้างปฏิทิน (ถ้ายังไม่มี): https://calendar.google.com > **Other calendars** > **+** > **Create new calendar** > ใส่ชื่อ > Create calendar
2. หา Calendar ID: ชี้ที่ชื่อปฏิทินทางซ้าย > ⋮ > **Settings and sharing** > เลื่อนลงถึง **Integrate calendar** > **Calendar ID** (หน้าตาแบบ `xxxx@group.calendar.google.com`) > copy
   ปฏิทินหลักของบัญชีใช้คำว่า `primary` ได้เลย
3. ใน Apps Script: **Project Settings** > **Script Properties** > **Edit script properties** > **Add script property**
   - Property: `CAL:<ชื่อ>` เช่น `CAL:Teach`
   - Value: Calendar ID ที่ copy มา
   - **Save script properties**
4. รัน **`listCalendars`** เพื่อตรวจว่าทุกบรรทัดใต้ `--- Script Properties ---` เป็น `ok`

ปฏิทินที่คนอื่นแชร์มา ต้องได้สิทธิ์ **Make changes to events** ถ้าจะให้ Memento สร้าง/แก้ event ในนั้น

ข้อควรระวัง:
- ห้ามให้ 2 ชื่อชี้ Calendar ID เดียวกัน
- Script Properties มี key อื่นที่สคริปต์ใช้เอง (`Q:...`, `I:...`, `lastSyncTime`) อย่าลบหรือแก้

## 3. Deploy เป็น Web App

1. **Deploy** > **New deployment** > ⚙️ เลือก **Web app**
2. Execute as = **Me**, Who has access = **Anyone** (ถ้าไม่ใช่ Anyone Memento จะได้ 403)
3. **Deploy** > copy **Web app URL** (ลงท้าย `/exec`)
4. ทดสอบ: เปิด URL ใน browser ต้องได้ `{"ok":true,"service":"CalendarSync"}`

แก้ `Code.gs` ครั้งต่อไป: **Deploy > Manage deployments** > ✏️ deployment เดิม > Version: **New version** > Deploy (URL เดิม ไม่ต้องแก้ Memento)

## 4. ตั้ง trigger ดึงการเปลี่ยนแปลงจาก Google

**Triggers** (รูปนาฬิกา) > **Add Trigger**
- function: `calendarSyncTrigger`
- event source: **Time-driven** > **Minutes timer** > **Every 30 minutes**

## 5. ตั้งค่าใน Memento

1. library ปฏิทินต้องมี field ตามชื่อนี้ (ตัวพิมพ์ต้องตรง): `Title, Calendar, Date, EndDate, StartTime, EndTime, AllDay, Description, Location, Holiday, OutOfDuty, RemindSet, MinuteSet, eid, ModifiedTime, CreatedTime`
2. ตัวเลือกของ field **`Calendar`** = ชื่อหลัง `CAL:` ใน Script Properties ทุกตัว (เช่น `Kim`, `Holidays`, `Teach`)
3. สร้าง shared script ที่ประกาศ URL จากขั้นตอน 3 แล้วให้ library ปฏิทินโหลด script นี้ด้วย

   ```js
   let APP_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";
   ```

4. ให้ library ปฏิทินโหลด `CalendarSync.js` จาก `https://raw.githubusercontent.com/kimchaip/UroModule/master/CalendarSync.js` (ไฟล์นี้ใช้ `moment()` ถ้า Memento ขึ้นว่า moment is not defined ให้เพิ่ม moment.js เป็น script ของ library ด้วย)
5. ผูกฟังก์ชันกับ trigger ของ library ปฏิทิน: `validate(entry())` ก่อน save, `onCreateEntry(entry())` / `onUpdateEntry(entry())` หลัง save, `onDeleteEntry(entry())` ตอนลบ entry และปุ่ม/action **Sync now** เรียก `syncNow()`

## 6. ทดสอบ

1. สร้าง entry ใน Memento → ต้องเห็น event ใน Google Calendar และ Memento ขึ้น "Create calendar successful"
2. สร้าง event ใน Google Calendar → กด Sync now ใน Memento → ต้องได้ entry ใหม่ 1 อัน (ไม่ซ้ำ)
3. ถ้ามีปัญหา ดู log ที่ Apps Script > **Executions** ทุก request มีบรรทัด `<action> timing(ms)` และ error

| อาการ | สาเหตุ |
|---|---|
| `Unknown calendar: X` | ไม่มี property `CAL:X` หรือชื่อใน Memento สะกดไม่ตรง |
| `Cannot access calendar: X` | Calendar ID ผิด หรือบัญชีนี้ไม่มีสิทธิ์ในปฏิทินนั้น |
| `No calendars in Script Properties` | ยังไม่ได้ทำขั้นตอน 2 |
| `APP_SCRIPT_URL is not set` | Memento ยังไม่โหลด shared script ในขั้นตอน 5.3 |
| 403 ตอนเรียก | deployment ไม่ได้ตั้ง Who has access = Anyone |

## ถ้า URL หลุด

ทำ **Deploy > New deployment** ใหม่ แก้ `APP_SCRIPT_URL` ใน Memento เป็น URL ใหม่ แล้ว **Manage deployments** > Archive อันเก่า
