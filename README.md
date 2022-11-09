# Uro Module
## What is this?
  Javascript Library for my Memento database, about patient care, diagnosis, operation, consult, report, workload.
  ### เป็น script เพื่อใช้ประกอบกับฐานข้อมูล เพื่อเก็บข้อมูลคนไข้ ตารางผ่าตัด เคสconsult report และ OpUroSx ซึ่ง sync กับ google sheet เพื่อไปแสดงผลเป็นตารางผ่าตัดนอกเวลา ให้เพื่อนร่วมงานทราบเคส
  ### แบ่งเป็น 3 script library 
   #### 1.MyDate.js : เก็บ function เกี่ยวกับวันที่ และเวลา
   #### 2.UroObj.js : เก็บ function เกี่ยวกับฐานข้อมูลทั้งหมด เพื่อให้การใช้งานลื่นไหล ตรวจสอบการลงข้อมูลซ้ำซ้อน การใส่ข้อมูลอัตโนมัติ
   #### 3.Autofill.js : เก็บ function เกี่ยวกับการค้นหาข้อมูล เวลาบันทึก ชื่อ, Dx, Op จะมี datalist มาให้เลือก โดยเรียงจากข้อมูลที่พบบ่อยสุดไปน้อยสุด
  ### สามารถ copy ไป ประยุกต์ใช้ ตามต้องการได้ครับ แต่ต้องเรียนรู้ javascript + Memento database script เล็กน้อย เพื่อปรับเปลี่ยนcode ตามต้องการ
## How to use this?
 ### 1.Load zip file โครงสร้างฐานข้อมูล ตามlink https://1drv.ms/u/s!AnCWo7E60IzglYlBI0V6rO2j3YaL4w?e=sdDhQC เก็บไว้ที่ folder "Download" ในโทรศัพท์
 ### 2.ติดตั้งapp Memento Database
 ### 3.restoreข้อมูล โดยเปิด app Memento database แล้ว setting>Restore>select a backup file เลือกfileที่loadมา (ชื่อ memento_backup_******.zip) รอติดตั้งฐานข้อมูล
 ### 4.Permission for scripts : เลือก library "Patient">...>Scripts> กด iconรูปโล่ มุมขวาบน  เปิดทุกอัน Libraries, Read files, Write files, Network ทำเช่นนี้กับทุกๆ library ที่เหลือ (UroBase, Consult, Backup, DxAutoFill, OperationList, Report, OpUroSx, Holiday) หมายเหตุ : เวลาเปิดแต่ละ library ในครั้งแรก app จะถาม "upload" ไหม? ให้ตอบ "No, Thanks" ทั้งหมด
 ### 5.field ใน library แก้ไขได้แค่ field ประเภท selection เช่น Ward, Dr, underlying  นอกนั้นอย่าแก้ไข เพราะจะทำให้ เกิด error ได้
 ### 6.เสร็จสิ้นครับ สามารถทดลองใส่ข้อมูล, search, sort, filter, group ได้ แต่เพิ่ม library หรือเขียน script เพิ่มไม่ได้ เพราะเป็น free version limit library 3, script 1/library, ถูกใจค่อยซื้อเพื่อปลดลล๊อก
