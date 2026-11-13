# OrQueue: mini app คิวผ่าตัด

Mini app ใน Memento แสดงคิวผ่าตัดจาก UroBase เป็นปฏิทินล่วงหน้า 3 เดือน เพื่อดูว่าวันไหนยังแทรกเคสได้
ดูอย่างเดียว ไม่เขียนข้อมูล (แทรกเคสด้วย AI ใน Memento ตามปกติ)

## หน้าจอ

- ด้านบน: วันที่ยังแทรกได้ใกล้สุด 2 วัน
- ปฏิทินรายเดือน (เลื่อนได้ 3 เดือน) ระบายสีเฉพาะวัน OR
  เขียว = ว่าง, เหลือง = เหลือไม่ถึง 1 ชม., แดง = เต็ม, เทา = ปิด (วันหยุด/ไม่อยู่),
  แดง "นอกวัน OR" = มีเคสในวันที่ไม่ใช่วัน OR
- กดวันไหนเห็นลำดับเคสพร้อมเวลาโดยประมาณ ช่วงรอ และช่องที่แทรกได้
- เคสที่มีรูปในฟิลด์ `Photo` (เช่น ภาพนิ่ว) แสดงรูปย่อ 3 รูปแรกใต้เคส กดเพื่อดูเต็มจอและเลื่อนดูรูปถัดไป

## กฎคำนวณ (kim, 2026-11-13)

| เรื่อง | กฎ |
|---|---|
| วัน OR | ทุกวันจันทร์ + วันที่มี Holidays ของ calendar `Kim` ชื่อ `OR นอกเวลา` (หรือ `ORนอกเวลา`) |
| วันปิด | Holidays ที่ `OutOfDuty` = จริง, หรือวันจันทร์ที่ `Holiday` = จริง |
| เริ่ม | 08:30 |
| GA | เรียงจากสั้นไปยาว (ไม่ยึด Que) GA→GA เผื่อ 45 น. วันจันทร์, 20 น. นอกเวลา |
| LA | LA OPD ทำก่อน GA เคสแรก (ไม่เกิน 3) และระหว่าง GA (ช่องละไม่เกิน 2) ไม่เป็นเคสสุดท้าย, LA Admit ที่เหลือทำหลัง GA เคสสุดท้าย; LA→LA และ LA↔GA เผื่อ 15 น. |
| เต็มหรือยัง (จันทร์) | แทรก GA ได้ถ้า GA เคสสุดท้ายตอนนี้เสร็จไม่เกิน 14:30 (เคสใหม่ที่ยาวสุดจะไปอยู่ท้าย) |
| เต็มหรือยัง (นอกเวลา) | เคสใหม่ต้องเริ่มก่อน 16:00 |
| เวลาผ่าตัด | `OpLength` ของ UroBase (ถ้าว่าง ใช้ GA 60 น., LA 15 น. และขึ้นเตือนสีแดง) |
| เคสที่นับ | `Status` ไม่ใช่ `Not` และ `Dr` เป็น ชัยพร หรือว่าง |

ค่าเหล่านี้อยู่ด้านบนของ `orqueue-logic.js` (object `orq`) แก้ที่เดียว

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `orqueue-logic.js` | สูตรคำนวณ (ไม่มี Memento API) |
| `src/app.js`, `src/style.css`, `src/body.html` | หน้าจอ และ `loadMemento()` ฟังก์ชันเดียวที่อ่านข้อมูลจาก Memento |
| `build.js` | รวมทุกไฟล์เป็น `index.html` ไฟล์เดียว: `node MiniApp/OrQueue/build.js` |
| `index.html` | หน้า mini app ที่ใช้จริง (สร้างจาก build.js อย่าแก้ตรง ๆ) |
| `test/orqueue.test.js` | ทดสอบสูตร: `node MiniApp/OrQueue/test/orqueue.test.js` |

ถ้าเปิด `index.html` นอก Memento จะแสดงข้อมูลตัวอย่าง (ผู้ป่วยสมมติ)

## วิธีสร้างใน Memento

Mini app สร้างผ่าน Builder (AI) ในแอป และ Memento ยังไม่เปิดเอกสาร API ของ mini app
จึงให้ Builder เขียนเฉพาะ `loadMemento()` ส่วนหน้าจอและสูตรใช้ไฟล์ใน repo

1. ใน Memento กด **Add App**
   - ชื่อ: คิวผ่าตัด, Framework: **Plain HTML**
   - Libraries: เลือก **UroBase** และ **Holidays** ตั้งสิทธิ์เป็น **อ่านอย่างเดียว**
2. กด **Create** แล้วพิมพ์ข้อความในหัวข้อ "ข้อความสั่ง Builder" ด้านล่าง
3. Builder จะขอให้วางเนื้อหา `index.html` หรือเปิด **Settings > Code** แล้วแทนไฟล์หน้าหลักด้วย `index.html` ทั้งไฟล์
   จากนั้นพิมพ์ใน Builder: "Now implement only loadMemento() as described in its comment."
4. เปิดแอป ถ้าแถบสีเหลือง "ข้อมูลตัวอย่าง" ยังอยู่ แปลว่า `loadMemento()` ยังไม่ทำงาน
   ถ้ามีข้อความสีแดง "อ่านข้อมูลจาก Memento ไม่ได้" ให้ส่งข้อความนั้นให้ Builder แก้

### ข้อความสั่ง Builder

```
Build a read-only app from my own HTML file. I will give you index.html (one self-contained page with inline CSS and JS).
Rules:
1. Use index.html exactly as given. Do not change layout, styles, the orq object or the rendering code.
2. Implement ONLY the function loadMemento(from, to) near the top of the <script>. Its comment lists the exact output shape.
   - Read the UroBase library entries whose Date is between from and to.
     Map fields: Date->date, ORType->type, Que->que, OpLength->minutes (duration in ms, divide by 60000; null if empty),
     VisitType->visit, Status->status, Dr->dr, Patient (link; use the linked entry's title)->name, Op->op, Dx->dx.
     Photo (image field, may hold several images)->photos: an array of strings that an <img src> in this app can display
     (convert the stored files to whatever URL this app can show); [] when empty.
   - Read the Holidays library entries whose Date is between from and to.
     Map fields: Date->date, Title->title, Calendar->calendar, Holiday->holiday, OutOfDuty->outOfDuty.
   - Return a Promise of { cases, hols }. Throw a normal Error with a clear message if a read fails.
3. Never create, edit or delete entries. Do not add test entries.
4. When it works, the yellow "ข้อมูลตัวอย่าง" banner disappears and the calendar shows real UroBase cases.
```

## หมายเหตุ

- บันทึกจาก mini app ไม่เรียก trigger แต่แอปนี้อ่านอย่างเดียว จึงไม่มีผล
- ปุ่มหาวันว่างเดิมใน `Autofill.js` และ `Widget.js` ยังใช้ตัวเลขเก่า (GA นอกเวลา 15 น., LA 10 น., วันจันทร์ 6 ชม.) ไม่ได้แก้ในงานนี้
