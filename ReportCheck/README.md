# ตรวจ Report ให้ตรงกับ UroBase / Backup

Report ไม่ได้ link กับ entry ใน UroBase/Backup โดยตรง แต่จับคู่จาก Patient + วันที่ผ่าตัด + ORType + Dx + Op ถ้า Report ถูกลบไปตอนย้าย entry หรือแก้ entry แล้ว Report ไม่ตาม ทั้งสองฝั่งจะไม่ตรงกัน

| ไฟล์ | ใส่เป็น Action ใน | ทำอะไร |
|---|---|---|
| `ReconcileReport.js` | Patient (ระดับ library) | ตรวจคนไข้ทุกคนด้วย `rpo.reconcile` |
| `DeleteUnmatchReport.js` | Report (เลือก entry) | ลบ Report ที่เลือกซึ่งมี Output = 1 |

`rpo.reconcile(patient)` ใน `UroObj.js` ใช้กับการผ่าตัดที่ Status ไม่ใช่ Not:

1. คู่ที่ตรงกันทุกค่า: อัปเดต Report ด้วย `rpo.setAll` ให้เป็นค่าปัจจุบัน
2. การผ่าตัดที่ไม่มีคู่ แต่มี Report ที่ไม่มีคู่ในวันเดียวกัน: ใช้ Report นั้นแล้วอัปเดต
3. การผ่าตัดที่ยังไม่มีคู่: สร้าง Report ใหม่
4. Report ที่เหลือ (ไม่มีการผ่าตัดคู่ หรือซ้ำ): ใส่ `1` ใน field `Output` ไม่ลบ

ใช้ field `Output` (Text) ที่มีอยู่แล้วใน Report (Report ที่จับคู่ได้จะถูกล้าง Output) ทุก Action ต้องเลือก JavaScript library `MyDate.js` และ `UroObj.js`

ตั้งแต่ PR นี้ ทุกครั้งที่บันทึก entry ใน UroBase / Backup (ทั้งจาก edit card และแก้จากหน้า list) จะเรียก `rpo.sync` ซึ่ง reconcile คนไข้คนนั้นให้อัตโนมัติ Action `ReconcileReport.js` จึงใช้แค่ตรวจข้อมูลเก่าเป็นครั้งคราว

เปลี่ยน Patient ของ entry: ลบ Report ของการผ่าตัดนี้ที่คนเดิม และลบ Report อื่นของคนเดิมที่ไม่มีการผ่าตัดคู่ (ไม่ใส่ Output = 1) คนเดิมหาจาก id ที่เก็บใน Previous (`PatientId`) เพราะ `pt.find()` ค้นด้วย title รวม "ชื่อ อายุ ปี HN" ไม่เจอ
