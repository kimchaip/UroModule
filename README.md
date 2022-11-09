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
### 1.Load zip file โครงสร้างฐานข้อมูล ตามlink เก็บไว้ที่ folder "Download" ในโทรศัพท์
### 2.ติดตั้งapp Memento Database
### 3.restoreข้อมูล โดยเปิด app Memento database แล้ว setting>Restore>select a backup file เลือกfileที่loadมา (ชื่อ memento_backup_******.zip) รอติดตั้งฐานข้อมูล
### 4.การติดตั้ง script : ในแต่ละ Library เข้าไปใน Library กด...>Scripts>+>Add javascript libraries>3Dot>AddGitHub repository พิมพ์ ้http:/github.com/kimchaip/UroModule/

