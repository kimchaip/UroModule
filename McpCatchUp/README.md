# McpCatchUp

การเขียนข้อมูลผ่าน uro-mcp (Memento Cloud API) ไม่ทำให้ trigger ของ Memento ทำงาน
แผนคือให้ uro-mcp เขียนคิวลง library ใหม่ **McpQueue** แล้วให้ script ที่ผูกกับ trigger
"Opening a library" ไล่ทำ trigger ที่ขาดไป (`trig.BeforeEdit` / `trig.AfterEdit` ใน `UroObj.js`)
โดยไม่แก้ field ของ library เดิม

## ขั้นที่ 1: PoC (`PoC.js`)

ทดสอบเฉพาะใน McpQueue ไม่แตะข้อมูลคนไข้

1. สร้าง library ใหม่ชื่อ `McpQueue` มี field
   | Field | ชนิด |
   |---|---|
   | Library | Text |
   | EntryId | Text |
   | Action | Text (create / update) |
   | Done | Checkbox (ไม่มีค่า default) |
   | Note | Text |
2. McpQueue > Scripts > Triggers > เพิ่ม trigger event **Opening a library** วางโค้ดจาก `PoC.js`
   และเปิดสิทธิ์ Libraries ที่ไอคอนโล่
3. สร้าง entry ใน McpQueue 2 แถว (Done ไม่ติ๊ก)
   - แถว 1: Library ว่าง, EntryId ว่าง
   - แถว 2: Library = `Holidays`, EntryId = id ของ entry ใน Holidays (Claude ให้ id ได้)
4. ออกจาก McpQueue แล้วเปิดใหม่ ควรขึ้นข้อความ "ทำคิว 2 รายการ, หา entry เจอ 1"
5. ปิดแอปแล้วเปิดใหม่ ดูว่า Done ยังติ๊กและ Note ยังอยู่ จากนั้นรอ sync แล้วให้ Claude อ่านผ่าน uro-mcp
6. ถ้ามี Memento Desktop ทดสอบแบบเดียวกันบน PC ด้วย

ผล PoC (2026-11-09): ผ่าน trigger "Opening a library" (After window display) ทำงาน, e.set บันทึกจริง และ findById ข้าม library ได้

## ขั้นที่ 2: ตัวจริง (`McpCatchUp.js`)

uro-mcp เขียนคิวลง McpQueue ทุกครั้งที่สร้างหรือแก้ entry ใน UroBase, Backup, Consult, Patient,
FollowUp, DxAutoFill, OperationList, Holidays (field Library, EntryId, Action = create / update)

ตั้งค่า
1. McpQueue: ลบ trigger PoC ออก (ไม่ต้องมี trigger ใน McpQueue)
2. UroBase, Consult, Patient: เพิ่ม trigger **Opening a library** (After window display) วางโค้ดจาก
   `McpCatchUp.js` เลือก library `MyDate.js`, `UroObj.js` และเปิดสิทธิ์ Libraries
3. ใส่ `McpQueue` ใน `MEMENTO_LIBRARIES` ของ uro-mcp (Vercel)

การทำงานต่อ 1 คิว
- หา entry ไม่เจอ (ยัง sync มาไม่ถึง): Note = "ยังไม่เจอ entry" รอรอบหน้า
- เจอ: ติ๊ก Done, Note = "กำลังทำ" แล้วเรียก `trig.BeforeEdit` / `trig.AfterEdit` (Patient ใช้
  `PatientBeforeEdit` / `PatientAfterEdit`, FollowUp ใช้ `FollowUpAfterEdit`) สำเร็จแล้ว Note = "ok"
- validator ไม่ผ่าน (Dx/Op ว่าง, HN ซ้ำ, visit ซ้ำ): Note = "ต้องแก้เอง: ข้อความ" ให้เปิด entry นั้นแก้ในแอป
- ถ้า Note ค้างเป็น "กำลังทำ" แปลว่า script หยุดกลางทาง ให้เปิด entry นั้นแล้วกดบันทึกในแอป
- ทำครั้งละไม่เกิน 20 คิว

ส่ง "update" ให้ BeforeEdit เสมอ เพราะ entry ถูกบันทึกแล้ว ถ้าส่ง "create" validator จะนับ entry ตัวเอง
เป็นข้อมูลซ้ำ ส่วนค่าที่ทำเฉพาะตอน create (setortype, setvisittype, fill.dr) ดูความต่างจาก Previous
ซึ่ง entry จาก API ไม่มี จึงไม่ทำงานทั้งสองแบบ

ข้อจำกัด
- การย้ายลงถังขยะ / กู้คืนผ่าน uro-mcp ยังไม่มี trigger ตามหลัง (BeforeDelete / AfterDelete)
- ถ้าแก้ entry ในแอปก่อนคิวถูกทำ การเปลี่ยนค่าที่ Claude แก้จะไม่ถูกนับเป็น "เปลี่ยน" (Previous ถูกเขียนใหม่ตอนเปิด edit)
- เปิด 2 เครื่องพร้อมกันก่อน sync อาจทำคิวเดียวกันซ้ำ

## ทดสอบ (คนไข้ปลอมเท่านั้น)
1. ให้ Claude สร้าง Patient ปลอม (HN ปลอม) และ Consult ของคนนั้น ผ่าน uro-mcp
2. sync แล้วเปิด Consult ในแอป ดูข้อความผล และดูว่า field ที่ trigger เติม (เช่น MergeID, VisitType, Ward) มีค่า
3. ให้ Claude แก้ Consult นั้น แล้วเปิดใหม่ ดู Note = ok
4. ให้ Claude สร้าง Consult ซ้ำวันเดียวกัน ควรได้ "ต้องแก้เอง: ... not unique"
5. ย้ายข้อมูลปลอมลงถังขยะเมื่อเสร็จ
