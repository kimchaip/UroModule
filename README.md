# MyDate Object
## my {}​
	- date
	- dateadd
	- dateminus
	- gdate
	- gday

## Date
	today, ntoday

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
	* PatientBeforeEdit
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
