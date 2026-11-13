# McpCatchUp

การเขียนข้อมูลผ่าน uro-mcp (Memento Cloud API) ไม่ทำให้ trigger ของ Memento ทำงาน
script นี้ทำ trigger ที่ขาดไป (`trig.*BeforeEdit` / `*AfterEdit` ใน `UroObj.js`) เมื่อเปิด library ในแอป
โดยไม่แก้ field ของ library เดิม

## ทำงานอย่างไร

1. uro-mcp ใส่ `"_mcp": "create"` หรือ `"_mcp": "update"` ลงใน field `Previous` ของ entry ที่สร้างหรือแก้
   ใน UroBase, Backup, Consult, Patient, DxAutoFill, OperationList ถ้า Previous มีค่าเดิมอยู่แล้วจะเก็บไว้
   (trigger ใช้เทียบว่าค่าไหนเปลี่ยน)
2. เครื่องหมายอยู่ใน entry เอง จึงมาพร้อมการ sync ของ library นั้น
3. เมื่อเปิด library script หา entry ที่แก้ภายใน 30 วันและมี `_mcp` ใน Previous
   เอาเครื่องหมายออก แล้วเรียก BeforeEdit (ส่ง "update" เสมอ) และ AfterEdit ซึ่งเขียน Previous ใหม่
4. FollowUp ไม่มี Previous: เมื่อเปิด FollowUp จะเรียก `rpo.syncPatient` ของคนไข้ที่มี FollowUp แก้ภายใน 3 วัน
   (ทำซ้ำได้ แค่ทำให้ Report ตรง)

ส่ง "update" ให้ BeforeEdit เสมอ เพราะ entry ถูกบันทึกแล้ว ถ้าส่ง "create" validator จะนับ entry ตัวเอง
เป็นข้อมูลซ้ำ entry ที่ Claude สร้างจะมี Previous ว่างหลังเอาเครื่องหมายออก เหมือน entry ใหม่ในแอป

ระหว่างทำ script เปลี่ยน `message` / `cancel` / `exit` ชั่วคราว validator ที่ไม่ผ่าน (Dx/Op ว่าง, HN ซ้ำ,
visit ซ้ำ) จึงไม่หยุด script ทั้งตัว แต่จะขึ้นในข้อความ "ต้องเปิดแก้เอง: ..." ให้เปิด entry นั้นแก้ในแอป
ทำครั้งละไม่เกิน 30 entry

## ตั้งค่า

trigger **Opening a library** (After window display) วางโค้ดจาก `McpCatchUp.js` เลือก library
`MyDate.js`, `UroObj.js` และเปิดสิทธิ์ Libraries ใน UroBase, Consult, Patient
(และ Backup, DxAutoFill, OperationList, FollowUp ถ้าจะให้ Claude แก้ library เหล่านั้น) ใช้โค้ดเดียวกันทุก library

## ข้อจำกัด

- trigger ทำงานเมื่อเปิด library ของ entry นั้นเท่านั้น (Memento sync library ตอนเปิด)
- Holidays ที่แก้ผ่าน Claude ไม่ sync ไป Google Calendar จนกว่าจะเปิด entry แล้วกดบันทึกในแอป
- การย้ายลงถังขยะ / กู้คืนผ่าน uro-mcp ยังไม่มี trigger ตามหลัง (BeforeDelete / AfterDelete)
- เปิดการ์ด entry ที่มีเครื่องหมาย (เช่น กดลิงก์ที่ AI ใน Memento ให้มา) ใน UroBase, Backup, Consult, Patient:
  BeforeViewCard / PatientBeforeViewCard เรียก `mcp.catchUp` ใน UroObj.js ทำ trigger ที่ค้างของ entry นั้นทันที
  (DxAutoFill / OperationList ไม่มี trigger ตอนเปิดการ์ด ยังต้องเปิด library)
- ถ้าเปิดฟอร์มแก้ entry ตรงๆ โดยไม่ผ่านการ์ด OpenEdit จะเขียน Previous ใหม่และเครื่องหมายจะหาย
  กดบันทึกแล้ว trigger ปกติจะทำงานแทน (แต่เป็นแบบ update ไม่ใช่ create)
- ถ้า script หยุดกลางทางเพราะ error ที่ไม่ใช่ validator เครื่องหมายของ entry นั้นถูกเอาออกแล้ว ดูใน log ของ script

## ประวัติ

- `PoC.js` ทดสอบ trigger "Opening a library" (ผ่าน 2026-11-09)
- รุ่นแรกใช้ library McpQueue เป็นคิว แต่ Memento sync McpQueue เฉพาะตอนเปิด McpQueue คิวจึงมาไม่ถึง
  เลยเปลี่ยนมาใช้เครื่องหมายใน Previous แทน (เลิกใช้ McpQueue ได้)
