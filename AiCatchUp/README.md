# AiCatchUp

การเขียนข้อมูลโดย AI ใน Memento (ผู้ช่วย AI ในแอป) ไม่ทำให้ trigger ของ Memento ทำงาน
ส่วนนี้ทำ trigger ที่ขาดไป (`trig.*BeforeEdit` / `*AfterEdit` ใน `UroObj.js`) ให้ภายหลัง โดยไม่แก้ field ของ library เดิม
logic ทั้งหมดอยู่ใน object `aic` ของ `UroObj.js`

## ทำงานอย่างไร

1. AI ใส่ `"_mcp": "create"` หรือ `"_mcp": "update"` ลงใน field `Previous` ของ entry ที่สร้างหรือแก้
   ใน UroBase, Backup, Consult, Patient, DxAutoFill, OperationList ถ้า Previous มีค่าเดิมอยู่แล้วจะเก็บไว้
   (trigger ใช้เทียบว่าค่าไหนเปลี่ยน) วิธีเขียนอยู่ในคำสั่งของ AI (ไฟล์ skill `memento-ai/mcp-marker-section.md`)
   ชื่อ `_mcp` เป็นชื่อเดิมตั้งแต่สมัย uro-mcp คงไว้เพื่อไม่ต้องแก้คำสั่งของ AI
2. trigger ทำงานได้ 2 จังหวะ (ทำครั้งเดียว เพราะเอาเครื่องหมายออกก่อนเรียก trigger)
   - **เปิดการ์ด entry** (เช่น กดลิงก์ที่ AI ให้มา): BeforeViewCard, PatientBeforeViewCard, DxBeforeViewCard,
     OpListBeforeViewCard เรียก `aic.catchUp` ทำ trigger ของ entry นั้นทันที
   - **เปิด library**: `aic.catchUpLibrary` หา entry ที่แก้ภายใน 30 วันและมี `_mcp` ใน Previous
     ทำครั้งละไม่เกิน 30 entry ตามลำดับที่ AI เขียน
3. FollowUp ไม่มี Previous: เมื่อเปิด FollowUp จะเรียก `rpo.syncPatient` ของคนไข้ที่มี FollowUp แก้ภายใน 3 วัน
   (ทำซ้ำได้ แค่ทำให้ Report ตรง)

ส่ง "update" ให้ BeforeEdit เสมอ เพราะ entry ถูกบันทึกแล้ว ถ้าส่ง "create" validator จะนับ entry ตัวเอง
เป็นข้อมูลซ้ำ entry ที่ AI สร้างจะมี Previous ว่างหลังเอาเครื่องหมายออก เหมือน entry ใหม่ในแอป

ระหว่างทำ script เปลี่ยน `message` / `cancel` / `exit` ชั่วคราว validator ที่ไม่ผ่าน (Dx/Op ว่าง, HN ซ้ำ,
visit ซ้ำ) จึงไม่หยุด script แต่จะขึ้นข้อความ "AI: ... ต้องเปิดแก้เอง" ให้เปิด entry นั้นแก้ในแอป

## ตั้งค่า

1. trigger **Opening a library** (After window display) ของ UroBase, Consult, Patient, Backup, DxAutoFill,
   OperationList, FollowUp วางโค้ดบรรทัดเดียวจาก `AiCatchUp.js`:
   ```
   aic.catchUpLibrary(lib());
   ```
   เลือก library `MyDate.js`, `UroObj.js` (โค้ดเดิมจาก McpCatchUp.js ที่วางไว้ แทนด้วยบรรทัดนี้)
2. DxAutoFill / OperationList: trigger **Opening an Entry View card** โค้ด `trig.DxBeforeViewCard(entry());`
   และ `trig.OpListBeforeViewCard(entry());` (เลือก library MyDate.js, UroObj.js)

## ข้อจำกัด

- การเขียนของ AI มาถึงเครื่องเมื่อ Memento sync library นั้น (ตอนเปิด library)
- Holidays ที่ AI แก้ไม่ sync ไป Google Calendar จนกว่าจะเปิด entry แล้วกดบันทึกในแอป
- การลบหรือกู้คืนโดย AI ไม่มี trigger ตามหลัง (BeforeDelete / AfterDelete)
- ถ้าเปิดฟอร์มแก้ entry ตรงๆ โดยไม่ผ่านการ์ด OpenEdit จะเขียน Previous ใหม่และเครื่องหมายจะหาย
  กดบันทึกแล้ว trigger ปกติจะทำงานแทน (แต่เป็นแบบ update ไม่ใช่ create)
- ถ้า trigger ไม่ผ่าน เครื่องหมายของ entry นั้นถูกเอาออกแล้ว ดูสาเหตุใน log ของ script

## ประวัติ

- เดิมชื่อ McpCatchUp ใช้กับ uro-mcp (Claude เขียนผ่าน Memento Cloud API) เปลี่ยนมาใช้กับ AI ใน Memento 2026-11-13
- รุ่นแรกใช้ library McpQueue เป็นคิว แต่ Memento sync McpQueue เฉพาะตอนเปิด McpQueue คิวจึงมาไม่ถึง
  เลยเปลี่ยนมาใช้เครื่องหมายใน Previous แทน
