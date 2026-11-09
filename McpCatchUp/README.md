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
