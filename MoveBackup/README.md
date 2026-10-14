# ย้าย UroBase → Backup แล้วแก้ MergeID

entry ที่ย้ายด้วยคำสั่ง Move ของ Memento จะได้ id ใหม่ ทำให้ MergeID ของ entry อื่นใน admission เดียวกันอ้าง id เก่า ใช้ Action ในโฟลเดอร์นี้แก้ โดยทุกตัวเรียก `mer.correct(patient)` ใน `UroObj.js`

| ไฟล์ | ใส่เป็น Action ใน | ใช้ตอนไหน |
|---|---|---|
| `RecordBeforeMove.js` | UroBase (เลือก entry) | ก่อนย้าย: จด id ของ Patient ลง `movedpatients.txt` |
| `CorrectMergeAfterMove.js` | Patient (ระดับ library) | หลังย้าย: แก้ MergeID ของคนไข้ทุกคนในไฟล์ แล้วต่อท้าย `done` |
| `CorrectMergeID.js` | UroBase / Backup / Consult (เลือก entry) | ถ้าลืมจดก่อนย้าย: แก้เฉพาะคนไข้ของ entry ที่เลือก |

ขั้นตอน

1. ใน UroBase เลือก entry ที่จะย้าย แล้วกด Action จาก `RecordBeforeMove.js`
2. Move entry เหล่านั้นไป Backup ตามปกติ
3. ใน Patient กด Action จาก `CorrectMergeAfterMove.js`

ทุก Action ต้องเลือก JavaScript library `MyDate.js` และ `UroObj.js` และเปิดสิทธิ์ Libraries, Read files, Write files ไฟล์ `movedpatients.txt` อยู่ใน default folder (/Workload)

`mer.correct` ถือว่า entry ใน admission เดียวกันคือ entry ที่ VisitType เป็น Admit, VisitDate เดียวกัน และผลไม่มีคำว่า "ไม่ทำ" (Consult: "ไม่มา") เรียงตามวันผ่าตัด ถ้าวันเดียวกันเรียง Consult, Backup, UroBase
