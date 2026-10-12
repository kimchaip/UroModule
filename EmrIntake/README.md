# EmrIntake: ถ่ายภาพ EMR → Patient + Consult

ถ่ายภาพหน้า Order ของ EMR โรงพยาบาล ให้ LINE แปลงภาพเป็นข้อความแล้ว copy จากนั้นกดปุ่ม Tasker 1 ปุ่ม จะได้ Patient (เพิ่มใหม่หรืออัปเดต) และ consult ที่รอนำเข้า กดปุ่ม "นำเข้า consult" ใน Memento อีก 1 ครั้ง จะได้ Consult ที่ผูก Patient แล้ว ถ้าต้องผ่าตัดใช้ EntryMx = set OR ใน Consult ตามเดิม

| ไฟล์ | ใช้ที่ไหน |
|---|---|
| `emrextract.js` | Tasker action JavaScript อ่านข้อความ EMR แล้วตั้งตัวแปร `%name %hnx %yearx %monthx %dayx %cdate %dxx %pasthx %jsonline` |
| `ConsultImport.js` | Memento Action script ใน library Consult อ่าน `consultInbox.json` แล้วสร้าง Consult |

ต้องมี: Memento Database รุ่นเต็ม, Tasker และ plugin Memento ของ Tasker (action "Add/edit an entry") และติดตั้ง UroModule ตาม [README](../README.md) แล้ว

## 1. โฟลเดอร์ไฟล์
Memento ให้ script อ่าน/เขียนไฟล์ได้เฉพาะในโฟลเดอร์ที่ตั้งไว้ที่ Memento > Settings > **Folder accessible to scripts** และ `ConsultImport.js` อ้างไฟล์ด้วยชื่อเปล่า (`consultInbox.json`, `consultInbox.done`) จึงต้องให้ Tasker เขียนไฟล์ลงโฟลเดอร์เดียวกันนี้

คู่มือนี้ใช้โฟลเดอร์ `Workload` เป็นตัวอย่าง ถ้าตั้งเป็นโฟลเดอร์อื่น ให้เปลี่ยน `Workload/` ในตารางข้อ 2 เป็นชื่อโฟลเดอร์นั้น (path ของ Tasker นับจาก `/sdcard`)

copy `emrextract.js` ไปไว้ในโฟลเดอร์ `Workload/` ของมือถือ

## 2. Tasker: task `setConsult`

| # | Action | ค่า | If |
|---|---|---|---|
| 1 | Variables > Variable Set | Name `%txt` To `%CLIP` | `%CLIP` Set |
| 2 | Code > JavaScript | Path `Workload/emrextract.js`, Auto Exit ✓, Timeout 2, Continue Task After Error ✓ | `%txt` ~R `HN\s*:\s*\d` |
| 3 | Task > If | | `%hnx` Set AND `%name` Set AND `%cdate` Set |
| 4 | Plugin Memento > Add/edit an entry | library **Patient**, ค้นด้วย `HN` = `%hnx`, `PtName` = `%name`, `YY` = `%yearx`, `MM` = `%monthx`, `DD` = `%dayx` | |
| 5 | File > Write File | File `Workload/consultInbox.json`, Text `%jsonline`, **Append ✓**, **Add Newline ✓** | |
| 6 | Alert > Notify | Title `Consult รอนำเข้า` Text `%name HN %hnx` / `Dx: %dxx` / `วันที่: %cdate` | |
| 7 | Task > End If | | |

ชื่อตัวแปร local ของ Tasker ต้องยาวอย่างน้อย 3 ตัวอักษร จึงใช้ `%dxx` ไม่ใช่ `%dx`

## 3. ปุ่มสั่งรัน
ใน Quick Settings (ดึงแถบด้านบนลงมา) มีปุ่ม Tasker (Device control) ตั้งให้มี Trigger **setConsult**

ใช้งาน: copy ข้อความ OCR ใน LINE > ดึงแถบลง > Tasker > setConsult

ทำไมไม่ใช้ profile อัตโนมัติ: บน Android 13 ขึ้นไป event Clipboard Changed ต้องให้ Tasker อ่าน log ของระบบ ซึ่งบางเครื่อง (ทดสอบบน Samsung Android 16) ไม่ยอมให้สิทธิ์แม้ grant `READ_LOGS` ผ่าน adb แล้ว และ event Received Share ก็ไม่ทำให้ Tasker ขึ้นในเมนูแชร์ แต่ Tasker อ่าน `%CLIP` ได้เมื่อสั่งรันเอง ถ้าเครื่องของคุณใช้ Clipboard Changed ได้ จะสร้าง profile นั้นเรียก setConsult แทนปุ่มก็ได้

## 4. Memento: ปุ่ม "นำเข้า consult"
1. เปิด library **Consult** > ⋮ > **Scripts** > **+**
2. เลือกชนิด **Action** (ทำงานกับทั้ง library) ตั้งชื่อ `นำเข้า consult`
3. วางโค้ดจาก `ConsultImport.js`
4. เลือก JavaScript library **MyDate.js** และ **UroObj.js** และเปิดสิทธิ์ Read files / Write files
5. บันทึก ปุ่มจะอยู่ในเมนู action ของหน้ารายการ Consult

## 5. ทดสอบด้วยข้อมูลปลอม
copy ข้อความนี้ แล้วกดปุ่ม setConsult

```
ชื่อ-สกุล : นาย ทดสอบ ระบบ HN : 9999999
อายุ : 50 ปี 3 เดือน 2 วัน
Final Dx.
ㆍ Gross hematuria [R31]
ㆍ Benign prostatic hyperplasia [N40]
Progress note
# Gross hematuria 2 days
# CT abdomen pending
Create
12/10/69 10:30
```

- ควรขึ้นแจ้งเตือน "Consult รอนำเข้า" และมี Patient HN 9999999
- Memento > Consult > กด "นำเข้า consult" ได้ Consult วันที่ 12/10/2026, Dx `Gross hematuria`, PastHx = ประวัติผ่าตัดเดิม (ถ้ามี) + BPH + บรรทัด # 2 บรรทัด
- กดซ้ำต้องไม่สร้างซ้ำ
- ทดสอบเสร็จแล้วลบ Patient และ Consult ของ HN 9999999

## กติกาการอ่านข้อความ
- HN จาก `HN : ตัวเลข`, ชื่อจากบรรทัด `ชื่อ-สกุล :` (ติดคำนำหน้ากับชื่อ เช่น "นายทดสอบ")
- ConsultDate = วันที่แรกใต้บรรทัด "Create" (ปี 69 → 2569 → 2026)
- Dx = Final Dx ตัวแรก โดยตัดรหัส ICD เช่น `[R31]` ออก ถ้าไม่มี Final Dx ใช้บรรทัด # แรก
- PastHx = Final Dx ที่เหลือ + บรรทัด # ใน Progress note (บรรทัดที่ OCR ตัดจะต่อกลับให้) ต่อท้ายประวัติผ่าตัดที่ระบบเติมเอง
- บรรทัดที่นำเข้าแล้วจดไว้ใน `consultInbox.done` (โฟลเดอร์เดียวกัน) และไม่นำเข้าซ้ำ แม้ลบ entry ใน Memento ไปแล้ว (`file().write` ของ Memento ล้างไฟล์ไม่ได้ จึงใช้วิธีจดแทน)
- ข้ามรายการที่ไม่พบ HN ใน Patient, ไม่มีวันที่หรือ Dx, หรือมี Consult วันเดียวกัน คนเดียวกัน Dx เดียวกันแล้ว

รูปแบบหน้า EMR ของแต่ละโรงพยาบาลต่างกัน ถ้าใช้กับ EMR อื่นต้องแก้ regex ใน `emrextract.js`
