# Uro Module
## What is this?
  Javascript Library for Memento database.
  เป็น script เพื่อใช้ประกอบกับฐานข้อมูล เพื่อเก็บข้อมูลคนไข้ ตารางผ่าตัด เคสconsult report และ OpUroSx ซึ่ง sync กับ google sheet เพื่อไปแสดงผลเป็นตารางผ่าตัดนอกเวลา ให้เพื่อนร่วมงานทราบเคส
  สามารถ copy ไป ประยุกต์ใช้ ตามต้องการได้ครับ แต่ต้องเรียนรู้ javascript + Memento database script เล็กน้อย เพื่อปรับเปลี่ยนcode ตามต้องการ
## How to use this?
  1.Load โครงสร้างฐานข้อมูล ตามlink เก็บไว้ที่ folder "Downloads" โทรศัพท์
  2.เปิด app Memento database แล้ว setting>Restore>select a backup file เลือกfileที่loadมา
  3.ติดตั้ง script ในแต่ละ Library โดยเข้าไป Library>Scripts>

# Urobase Object
## Library
	pt, or, cs, bu
## oldUr, oldCs, oldPt {}​
	- save
	- load
	- get :
		opdate, csdate, patient, 
		optype, que, vstype, 
		ward, vsdate, dcdate, 
		emx, apdate, status, 
		dj, opext, bonus, 
		rcdate, dx, rx, 
		note, op, result, track
## mer {}​
	- lastadmit
	- linklastadmit
	- getmergeid
	- mergelastadmit
	- posinmerge
	- mergeeffect
	- changeother
	- mlacancel
	- merge
## que {}​
	- string
	- getstart
	- max
	- checkque
	- checkid
	- checkdup
	- findque
	- findme
	- finddup
	- findhole
	- sort
	- reorder
## emx {}​
	- createnew
	- flu
	- setor
## fill {}​
	- track
	- underlying
	- los
	- ptstatus
	- color
## pto {}​
	- agetext
	- uniqueHN
	- age
	- status
	- dj
	- donesettrack
	- resetdone
## uro {}​
	- checkdx
	- checkop
	- setnewdate
	- setopextra
	- setvisitdate
	- setq
	- runq
	- setDJstent
	- lastDJStamp
	- createautofill
	- createoplist
	- updateDJStamp
	- resetcolor
## cso {}​
	- setnewdate
	- setvisitdate
	- resetcolor
# trig {}​
	* PatientOpenEdit
	* PatientBeforeEdit
        * PatientAfterEdit
	* PatientBeforeViewCard 
	* PatientBeforeOpenLib
	* UroOpenEdit
	* UroBeforeEdit
	* UroAfterEdit
	* UroBeforeViewCard
        * UroBeforeOpenLib
        * BackupOpenEdit
        * BackupBeforeEdit
        * BackupAfterEdit
        * BackupBeforeViewCard
        * BackupBeforeOpenLib
	* ConsultOpenEdit
	* ConsultBeforeEdit
	* ConsultAfterEdit
	* ConsultBeforeViewCard 
	* ConsultBeforeOpenLib
