# EmrIntake: ถ่ายภาพ EMR → Patient + Consult

ถ่ายภาพหน้า Order ของ EMR โรงพยาบาล ให้ LINE แปลงภาพเป็นข้อความแล้ว copy จากนั้นกดปุ่ม Tasker 1 ปุ่ม จะได้ Patient (เพิ่มใหม่หรืออัปเดต) และ consult ที่รอนำเข้า กดปุ่ม "นำเข้า consult" ใน Memento อีก 1 ครั้ง จะได้ Consult ที่ผูก Patient แล้ว ถ้าต้องผ่าตัดใช้ EntryMx = set OR ใน Consult ตามเดิม

| ไฟล์ | ใช้ที่ไหน |
|---|---|
| `emrextract.js` | Tasker action JavaScript อ่านข้อความ EMR แล้วตั้งตัวแปร `%name %hnx %yearx %monthx %dayx %cdate %dxx %pasthx %jsonline` |
| `ConsultImport.js` | Memento Action script ใน library Consult อ่าน `consultInbox.json` แล้วสร้าง Consult |
| `failmask.js` | Tasker action JavaScript (ใช้ร่วมกับ setOutcome) ถ้าอ่านไม่ครบ ปิดชื่อ/HN/เบอร์โทร/เลขบัตรเป็น X แล้วตั้ง `%failline` ไว้บันทึกลง `extractFail.json` ดูข้อ 6 |

ต้องมี: Memento Database รุ่นเต็ม, Tasker และ plugin Memento ของ Tasker (action "Add/edit an entry") และติดตั้ง UroModule ตาม [README](../README.md) แล้ว

Tasker ต้องได้สิทธิ์อ่าน log (`READ_LOGS`) จึงจะอ่าน `%CLIP` ได้บน Android 10 ขึ้นไป ให้ grant ครั้งเดียวผ่าน adb (หรือแอป Tasker Permissions) แล้วปิด USB debugging ได้ สิทธิ์จะอยู่ถาวร **อย่า revoke** ไม่อย่างนั้นปุ่มจะอ่าน clipboard ไม่ได้

```
adb shell pm grant net.dinglisch.android.taskerm android.permission.READ_LOGS
adb shell am force-stop net.dinglisch.android.taskerm
```

## 1. โฟลเดอร์ไฟล์
Memento ให้ script อ่าน/เขียนไฟล์ได้เฉพาะในโฟลเดอร์ที่ตั้งไว้ที่ Memento > Settings > **Folder accessible to scripts** และ `ConsultImport.js` อ้างไฟล์ด้วยชื่อเปล่า (`consultInbox.json`, `consultInbox.done`) จึงต้องให้ Tasker เขียนไฟล์ลงโฟลเดอร์เดียวกันนี้

คู่มือนี้ใช้โฟลเดอร์ `Workload` เป็นตัวอย่าง ถ้าตั้งเป็นโฟลเดอร์อื่น ให้เปลี่ยน `Workload/` ในตารางข้อ 2 เป็นชื่อโฟลเดอร์นั้น (path ของ Tasker นับจาก `/sdcard`)

copy `emrextract.js` และ `failmask.js` ไปไว้ในโฟลเดอร์ `Workload/` ของมือถือ (ถ้าเก็บ script ไว้โฟลเดอร์อื่น ให้แก้ Path ของ action JavaScript ตาม)

## 2. Tasker: task `setConsult`

| # | Action | ค่า | If |
|---|---|---|---|
| 1 | Variables > Variable Set | Name `%txt` To `%CLIP` | `%CLIP` Set |
| 2 | Code > JavaScript | Path `Workload/emrextract.js`, Auto Exit ✓, Timeout 2, Continue Task After Error ✓ | `%txt` ~R `HN\s*:?\s*\d` |
| 3 | Variables > Variable Set | Name `%fsrc` To `emr` | |
| 4 | Code > JavaScript | Path เดียวกับ action 2 แต่ชื่อไฟล์ `failmask.js`, Auto Exit ✓, Timeout 2, Continue Task After Error ✓ | `%txt` Set |
| 5 | File > Write File | File `Workload/extractFail.json`, Text `%failline`, **Append ✓**, **Add Newline ✓** | `%failline` Set |
| 6 | Alert > Flash | `อ่านไม่ครบ บันทึกเคสไว้แล้ว` | `%failline` Set |
| 7 | Task > If | | `%hnx` Set AND `%name` Set AND `%cdate` Set |
| 8 | Plugin Memento > Add/edit an entry | library **Patient**, ค้นด้วย `HN` = `%hnx`, `PtName` = `%name`, `YY` = `%yearx`, `MM` = `%monthx`, `DD` = `%dayx` | |
| 9 | File > Write File | File `Workload/consultInbox.json`, Text `%jsonline`, **Append ✓**, **Add Newline ✓** | |
| 10 | Alert > Notify | Title `Consult รอนำเข้า` Text `%name HN %hnx` / `Dx: %dxx` / `วันที่: %cdate` | |
| 11 | Task > End If | | |

action 3-6 เพิ่มใหม่สำหรับบันทึกเคสที่อ่านไม่ครบ (ข้อ 6) ใส่ไว้ก่อน action If เดิม

ชื่อตัวแปร local ของ Tasker ต้องยาวอย่างน้อย 3 ตัวอักษร จึงใช้ `%dxx` ไม่ใช่ `%dx`

## 3. ปุ่มสั่งรัน
ใน Quick Settings (ดึงแถบด้านบนลงมา) มีปุ่ม Tasker (Device control) ตั้งให้มี Trigger **setConsult**

ใช้งาน: copy ข้อความ OCR ใน LINE > ดึงแถบลง > Tasker > setConsult

ทำไมไม่ใช้ profile อัตโนมัติ: บน Android 13 ขึ้นไป event Clipboard Changed ต้องให้ Tasker อ่าน log ของระบบ ซึ่งบางเครื่อง (ทดสอบบน Samsung Android 16) ไม่ยอมให้สิทธิ์แม้ grant `READ_LOGS` ผ่าน adb แล้ว และ event Received Share ก็ไม่ทำให้ Tasker ขึ้นในเมนูแชร์ แต่ Tasker อ่าน `%CLIP` ได้เมื่อสั่งรันเอง (ยังต้องมีสิทธิ์ `READ_LOGS` ตามด้านบน) ถ้าเครื่องของคุณใช้ Clipboard Changed ได้ จะสร้าง profile นั้นเรียก setConsult แทนปุ่มก็ได้

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

## 6. บันทึกเคสที่อ่านไม่สำเร็จ (extractFail.json)
ถ้า setConsult หรือ setOutcome อ่านไม่ครบ `failmask.js` จะเขียนข้อความลง `Workload/extractFail.json` 1 บรรทัดต่อเคส (sync ไป PC ที่ `OneDrive\Workload`) แล้วนำไปปรับ regex ใน `emrextract.js` / `outcomeextract.js`

**นับว่าอ่านไม่ครบเมื่อ**
- consult (`emr`): ไม่ได้ HN, ชื่อ, วันที่ หรือ Dx
- ผลตรวจ (`outcome`): ไม่ได้ทั้ง HN และชื่อ หรือไม่ได้วันที่
- ปุ่ม "อ่านผิด" (`wrong`): อ่านได้แต่ค่าผิด หมอกดบันทึกเอง

**ข้อมูลที่ปิดก่อนบันทึก** (เปลี่ยนเป็น X คงรูปแบบไว้ เช่น `นาย XXXXX XXXX`, `HN XXX-XX-XX`)
- ชื่อ/HN ที่ script อ่านได้, ชื่อหลังคำนำหน้า (นาย นาง น.ส. ด.ช. นพ. Mr. Dr. ฯลฯ) และหลัง `ชื่อ` / `ชื่อ-สกุล` / `Patient name` / `Name` (ถ้าป้ายอยู่ท้ายบรรทัด ปิดบรรทัดถัดไป)
- บรรทัดหลัง `ที่อยู่` / `บ้านเลขที่` / `Address`
- เลขบัตรประชาชน 13 หลัก, เบอร์โทร, HN ทุกรูปแบบ และตัวเลขที่ติดกันตั้งแต่ 5 หลัก (ค่าแล็บที่ยาว 5 หลัก เช่น WBC 12000 จะถูกปิดด้วย)
- ส่วนที่เหลือ เช่น Dx, วันที่, ผลตรวจ ยังอยู่ จึงยังไม่ควรส่งไฟล์นี้ให้คนอื่น

รูปแบบ 1 บรรทัด:
```
{"t":1792900000000,"src":"emr","fail":["hn","date"],"got":{"name":"XXXXX XXXX","dx":"Ureteric stone"},"note":"","text":"ชื่อ-สกุล : นาย XXXXX XXXX\nH.N. XXXXXXX ..."}
```
`got` = ค่าที่อ่านได้ (ชื่อ/HN เป็น X), `note` = หมายเหตุจากปุ่มอ่านผิด

**ปุ่ม "อ่านผิด"**: Tasker task ใหม่ชื่อ `reportWrong` เพิ่มเป็น Trigger อีกปุ่มใน Quick Settings ใช้ตอนเห็น Notify แล้วค่าไม่ถูก (clipboard ยังเป็นข้อความเดิม)

| # | Action | ค่า | If |
|---|---|---|---|
| 1 | Variables > Variable Set | Name `%txt` To `%CLIP` | `%CLIP` Set |
| 2 | Alert > Input Dialog | Title `ค่าไหนอ่านผิด` (ไม่พิมพ์ก็ได้ ไม่ต้องพิมพ์ชื่อหรือ HN) | |
| 3 | Variables > Variable Set | Name `%fnote` To `%input` | `%input` Set |
| 4 | Variables > Variable Set | Name `%fsrc` To `wrong` | |
| 5 | Code > JavaScript | Path `failmask.js` (โฟลเดอร์เดียวกับ emrextract.js), Auto Exit ✓, Timeout 2, Continue Task After Error ✓ | `%txt` Set |
| 6 | File > Write File | File `Workload/extractFail.json`, Text `%failline`, **Append ✓**, **Add Newline ✓** | `%failline` Set |
| 7 | Alert > Flash | `บันทึกเคสอ่านผิดแล้ว` | `%failline` Set |

**เคสที่แก้แล้ว** จดใน `extractFail.done` (โฟลเดอร์เดียวกัน) บรรทัดละ 1 เคส: ค่า `t` ของเคสนั้นตามด้วยเลข PR ที่แก้ เช่น `1792900000000 #85` ไม่ลบบรรทัดใน `extractFail.json` เอง (Tasker ต่อท้ายไฟล์อยู่ ลบพร้อมกันอาจชนกันตอน sync) จะล้างไฟล์บนมือถือเมื่อเคสในไฟล์จดใน .done ครบแล้ว

ตัวอย่างที่นำไปทดสอบหรือใส่ใน repo ต้องเป็นข้อมูลปลอมทั้งหมด (repo เป็น public) เปลี่ยนวันที่และรายละเอียดเฉพาะของคนไข้ด้วย

## กติกาการอ่านข้อความ
- HN จาก `HN : ตัวเลข`, ชื่อจากบรรทัด `ชื่อ-สกุล :` (ติดคำนำหน้ากับชื่อ เช่น "นายทดสอบ")
- ConsultDate = วันที่แรกใต้บรรทัด "Create" (ปี 69 → 2569 → 2026)
- Dx = Final Dx ตัวแรก โดยตัดรหัส ICD เช่น `[R31]` ออก ถ้าไม่มี Final Dx ใช้บรรทัด # แรก
- PastHx = Final Dx ที่เหลือ + บรรทัด # ใน Progress note (บรรทัดที่ OCR ตัดจะต่อกลับให้) ต่อท้ายประวัติผ่าตัดที่ระบบเติมเอง
- บรรทัดที่นำเข้าแล้วจดไว้ใน `consultInbox.done` (โฟลเดอร์เดียวกัน) และไม่นำเข้าซ้ำ แม้ลบ entry ใน Memento ไปแล้ว (`file().write` ของ Memento ล้างไฟล์ไม่ได้ จึงใช้วิธีจดแทน)
- ข้ามรายการที่ไม่พบ HN ใน Patient, ไม่มีวันที่หรือ Dx, หรือมี Consult วันเดียวกัน คนเดียวกัน Dx เดียวกันแล้ว

### ใบ MOPH Refer (ใบส่งตัว)
ถ้าข้อความมีคำว่า "MOPH Refer" / "ระบบส่งตัวผู้ป่วย" / "แบบส่งต่อ" จะอ่านแบบใบ Refer แทน
- HN = HN ของ รพ.เราในรูปแบบ `HN 999-99-99 (03)` หรือ `HN 9999999 (03)` → `9999999` (ไม่สนใจ `(03)`) ไม่ใช้ `HN:` ของ รพ.ต้นทาง ถ้าไม่พบ HN แบบนี้จะไม่นำเข้า
- ชื่อ = บรรทัดที่ขึ้นต้นด้วย `ชื่อ ` ถ้าไม่มีใช้ข้อความหลัง "ขอส่งผู้ป่วยชื่อ" จนถึง HN
- อายุ = `อายุ: 50 ปี 3 เดือน 2 วัน`
- ConsultDate = `วันที่ 12 เดือน ตุลาคม พ.ศ. 2569` บนหัวใบ
- Dx = ข้อความหลัง `IMP :` หรือ `Imp:` (ต่อบรรทัดที่ OCR ตัด)
- PastHx = ข้อความหลัง `U/D :` (ข้ามถ้าเขียน `no U/D`) และ `ประวัติผ่าตัด =`

ตัวอย่างปลอม (ส่วนที่ใช้):
```
MOPH Refer
วันที่ 12 เดือน ตุลาคม พ.ศ. 2569
พร้อมหนังสือนี้ ขอส่งผู้ป่วยชื่อ นาย ทดสอบ ระบบ HN: 000123456
เพศ: ชาย อายุ: 50 ปี 3 เดือน 2 วัน
ประวัติผ่าตัด = ไส้ติ่ง 10 ปี
ชื่อ นายทดสอบ ระบบ
อายุ 50.3.2. ปี HN 999-99-99 (03)
- ชาย 50 ปี , U/D : DM, HT
- Admit since 8/10/2569, Present with fever -> IMP : acute
pyelonephritis
```

### ใบ Consultation Report (consult ภายใน รพ.)
ถ้าข้อความมี "Consultation Report", "Clinical diagnosis" หรือ "Patient name" (รวมคำที่ OCR อ่าน i เป็น l เช่น "Patlent") จะอ่านแบบนี้
- HN = `HN 9999999` หรือ `HN 999-99-99` (ไม่มี `:` ก็ได้ ต้องตั้ง If ของ action 2 เป็น `HN\s*:?\s*\d`)
- ชื่อ = หลัง `Patient name` (ตัด Sex/HN ที่อยู่บรรทัดเดียวกันออก)
- อายุ = `Age 60 ปี 1 เดือน 2 วัน`
- ConsultDate = **วันที่กดปุ่ม** เพราะในใบไม่มีวันที่ consult ถ้านำเข้าใบของวันก่อน ให้แก้วันที่ใน Memento เอง
- Dx = ข้อความหลัง `IMP :` ถ้าไม่มีใช้ `Clinical diagnosis`
- PastHx = บรรทัด `#` ใน Problem list

ตัวอย่างปลอม (ส่วนที่ใช้):
```
Consultation Report
Patlent name นาย ทดสอบ ระบบ
Sex ชาย Age 60 ปี 1 เดือน 2 วัน HN 9999999
Clinical dlagnosls BPH
Problem list
# Lt inguinal hernia
# Hematoma at surgical site
#UD: HT, DLP
IMP : BPH
```

รูปแบบหน้า EMR ของแต่ละโรงพยาบาลต่างกัน ถ้าใช้กับ EMR อื่นต้องแก้ regex ใน `emrextract.js`
