# HANDOFF: UroModule

เอกสารส่งต่องานสำหรับคนหรือ AI ที่จะมาแก้โค้ดนี้ต่อ อ่าน [README.md](README.md) ก่อนเพื่อดูภาพรวม library และไฟล์

## โค้ดทำงานอย่างไร

- โค้ดทั้งหมดเป็น **shared script library ของ Memento** ไม่ได้ build หรือรันนอกแอป แต่ละ library ใน Memento มี trigger ที่เรียกฟังก์ชันใน `trig` ของ `UroObj.js`
- ลำดับโหลด: `MyDate.js` ต้องมาก่อน (ประกาศ `my`, `today`, `hour`, `more`/`less`/`equal`) แล้วตามด้วย `UroObj.js` และไฟล์อื่น
- `UroObj.js` แบ่งเป็น object ตามหน้าที่:

| object | หน้าที่ |
|---|---|
| `pt`, `or`, `cs`, `bu`, `dx`, `op`, `rp`, `hd`, `wd` | handle ของแต่ละ library (`libByName`) |
| `uro`, `buo`, `cso` | config ของ UroBase / Backup / Consult (`lib`, ชื่อ field วันที่ `opdate`, field ผล `result`, regex "ไม่ทำ"/"งด") ใช้เป็น `this` ให้ฟังก์ชันส่วนกลาง |
| `pto`, `dxo`, `opo`, `rpo` | logic ของ Patient / DxAutoFill / OperationList / Report |
| `old` | snapshot ค่าก่อนแก้ไข (ดูหัวข้อถัดไป) |
| `fill` | เติมข้อมูลอัตโนมัติ: Status จาก OpResult, DJ stent, LOS, Track, Active, Future, Color, Ward, VisitDate, PastHx |
| `valid` | ตรวจ HN ซ้ำ, visit ซ้ำ, Dx/Op ครบ, วันผ่าตัดตรงวันไม่อยู่ |
| `mer` | merge หลาย entry ที่อยู่ใน admission เดียวกัน (`MergeID` เป็น JSON ของ `{lib, e}`) แล้ว copy field ร่วมไปทุก entry |
| `que` | จัดคิว OR (`Que` = "01", "02", ...) ตาม TimeIn ในวันและ ORType เดียวกัน |
| `emx` | `EntryMx` = "F/U" สร้างนัดใน Consult, "set OR" สร้าง entry ใน UroBase จาก `AppointDate` |
| `dxop` | สร้าง/อัปเดต link ไป DxAutoFill และ OperationList และนับจำนวนครั้ง |
| `cal` | link entry กับวันใน Holidays และเตือนเมื่อตรงวันหยุด/วันไม่อยู่/OR นอกเวลา |
| `sync` | sync UroBase ไป Google Sheet ไม่เกินชั่วโมงละครั้ง (เวลา sync ล่าสุดเก็บในไฟล์ `lastsync_orsync.txt`) |
| `trig` | จุดเข้าที่ trigger ใน Memento เรียก |

### trigger

ฟังก์ชันใน `trig` รับ `(e, value)` โดย `value` เป็น `"create"` หรือ `"update"` และใช้ `this` เป็น config ของ library เช่น trigger ของ UroBase เรียกแบบ

```js
trig.BeforeEdit.call(uro, entry(), "update");
```

| ช่วงใน Memento | ฟังก์ชัน |
|---|---|
| Opening an Entry Edit card | `OpenEdit` (`PatientOpenEdit`, `DxOpenEdit`, `OpListOpenEdit`) |
| Before saving | `BeforeEdit` (`PatientBeforeEdit`, `DxBeforeEdit`, `OpListBeforeEdit`, `HDBeforeEdit`) |
| After saving | `AfterEdit` (`PatientAfterEdit`, `DxAfterEdit`, `OpListAfterEdit`, `HDAfterEdit`) |
| Opening an Entry View card | `BeforeViewCard` (`PatientBeforeViewCard`) |
| แก้ field จากหน้า list | `BeforeUpdatingField`, `AfterUpdatingField` |
| ลบ entry | `BeforeDelete`, `AfterDelete` |
| รายวัน | `DailyUpdateAll` อัปเดตอายุ, Track, LOS, Active, Future, Color |

script ที่ตั้งไว้ในแต่ละ trigger อยู่ในแอป Memento ไม่ได้อยู่ใน repo นี้

## การรู้ว่า field ไหนถูกแก้ (`old` / field `Previous`)

Memento ไม่มี API ให้อ่านค่าเดิมตอนแก้ไข จึงเก็บเอง:

1. `old.save` เก็บค่าทุก field เป็น JSON ใน field ซ่อน `Previous` (ยกเว้น `OpDateCal`, `Output`) ถูกเรียกตอนเปิด edit card, เปิด view card และหลัง save โดยเขียนเฉพาะเมื่อค่าเปลี่ยน
2. `old.load(e)` แล้ว `old.field("ชื่อ field")` คืนค่าก่อนแก้ ใช้เทียบกับ `e.field(...)`
3. ถ้า `Previous` ว่างหรือเสีย `old.field()` จะคืนค่าปัจจุบัน คือถือว่าไม่มีอะไรเปลี่ยน
4. วันที่ใน `Previous` เป็นรูปแบบเต็ม เช่น `2026-06-15T00:00:00.000Z` ตอน load จะแปลงกลับเป็น Date เฉพาะรูปแบบนี้
5. ถ้า script ไปแก้ entry อื่น แล้ว entry นั้นต้องใช้ค่าเดิมต่อ ต้องอัปเดต `Previous` ของมันด้วย (ตัวอย่าง `que.oldsave`)

## ข้อตกลง

- **ห้ามเปลี่ยนชื่อหรือลบ field ใน UroBase, Backup, Consult** โค้ดหลายส่วนอ้างชื่อ field ตรง ๆ ข้อมูลใหม่สำหรับวิเคราะห์ให้เพิ่มใน **Report** แทน เช่น เขียนเป็น tag ใน OpResult แล้วให้ `rpo.setAll` แยกไปเก็บใน field ของ Report
- **ข้อความใน OpResult มีความหมาย**: "ไม่ทำ" → Status Not และไม่นับเป็น visit, "งด" → Status Not, คำเกี่ยวกับ DJ (on/change/off DJ) → ตั้ง `DJstent` ดู `fill.statusbyresult`, `fill.djbyresult` tag ใหม่ต้องเลี่ยงคำเหล่านี้
- **InvResult ถูก copy ไปทุก entry ใน admission เดียวกัน** (`mer.run`) ห้ามใช้เก็บข้อมูลที่เป็นของการผ่าตัดครั้งเดียว
- อ่าน/เขียนไฟล์ด้วย `file("ชื่อไฟล์")` โดยไม่ใส่ path เพราะตั้ง default folder ของ Memento เป็น `/Workload`
- วันที่ทุกอันผ่าน `my.date()` ซึ่งตั้งเวลาเป็น 07:00 ของวันนั้น เทียบวันด้วย `my.compDate` หรือ `my.gdate`
- รูปแบบโค้ดเดิม: ES6 พื้นฐาน, `let`, object literal, เรียกฟังก์ชันส่วนกลางด้วย `.call(config, e)`, comment สั้นภาษาอังกฤษ/ไทย, ไฟล์ใน repo ใช้ LF

## ขั้นตอนแก้โค้ด

1. แก้ใน branch ใหม่ ตรวจ syntax ด้วย `node --check UroObj.js` (รันจริงได้เฉพาะในแอป)
2. commit แล้วเปิด PR ที่อธิบาย Before / After / How จากนั้น merge เข้า `master` (Memento โหลด script จาก GitHub master จึงมีผลกับแอปทันทีหลัง merge)
3. ทดสอบในแอปบนมือถือ แล้ว `git pull` ใน `C:\Users\HP\UroModule` บน PC ให้ตรงกับ GitHub
4. ถ้ามีปัญหา revert PR นั้นบน GitHub

## สิ่งที่อยู่นอก repo

- `AppsScript/Code.gs` (ฝั่ง Google Apps Script ของ CalendarSync) และ `MementoScripts/` (เช่น `UroCRH_SheetSync.js`) อยู่ใน folder บน PC แต่ไม่ได้ commit (ถูก exclude ใน `.git/info/exclude`)
- โครงสร้าง library อยู่ใน template ของ Memento ที่แชร์ไว้ (ลิงก์ใน README หัวข้อการติดตั้ง)

## ข้อควรระวัง / งานค้าง

- `CalendarSync.js` อ่าน URL ของ Apps Script Web App จากตัวแปร `APP_SCRIPT_URL` ที่ประกาศใน shared script ของ Memento (ไม่อยู่ใน repo) เพราะ `doPost` ไม่ได้ตรวจสิทธิ์ผู้เรียก ใครมี URL ก็ส่งคำสั่งไปแก้ปฏิทินได้ ห้าม commit URL ลง repo
- การเปลี่ยนแปลงวันที่ 2026-10-11 (PR #46, #47: guard `Previous`, sync รายชั่วโมงแบบไฟล์, reviver วันที่) ทดสอบในแอปแล้ว ไม่มี error และไฟล์ `lastsync_orsync.txt` ถูกสร้างใน /Workload
- งานที่วางแผนไว้: library FollowUp สำหรับค่า PSA / ภาพถ่ายทางรังสีที่ตรวจซ้ำหลายครั้ง และ tag ผลการรักษาใน OpResult ที่ `rpo.setAll` แยกเข้า Report
