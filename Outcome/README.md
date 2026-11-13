# Outcome: ผลการรักษา (Clavien + FollowUp)

**กติกาบันทึก**
- ระหว่างนอนโรงพยาบาล: เขียนใน OpResult เหมือนเดิม
- ผลตรวจที่มีวันที่ของตัวเอง (CT, US, KUB, MRI, patho, lab, PSA): ลง **FollowUp** ทุกครั้ง แม้ทำระหว่าง admit
- Report จับคู่ผลกับการผ่าตัดจากวันที่ให้เอง และอัปเดตทุกครั้งที่บันทึก FollowUp หรือการผ่าตัด

ลง FollowUp ได้ 2 ทาง: พิมพ์เอง หรือให้ AI ใน Memento อ่านใบผลแล้วลงให้ (AI ต้องเขียน `Data` ตามรูปแบบในข้อ 1 ด้วย)

| ไฟล์ | ใช้ที่ไหน |
|---|---|
| `Outcome.js` | Memento JavaScript library (แบบ MyDate.js): เดา Clavien |

ส่วนที่ Report ใช้ (`rpo.setResults`, `rpo.syncPatient`, `trig.FollowUpAfterEdit`, `trig.FollowUpAfterDelete`) อยู่ใน `UroObj.js`

## 1. Field ใหม่

### UroBase และ Backup (เพิ่ม 1 field เหมือนกันทั้ง 2 library, ไม่แตะ Consult)
| Field | ชนิด | หมายเหตุ |
|---|---|---|
| `Clavien` | Single choice: `None`, `I`, `II`, `IIIa`, `IIIb`, `IVa`, `IVb`, `V` | ปุ่ม Clavien เติมให้ถ้ายังว่าง แก้เองได้ script จะไม่ทับค่าที่เลือกไว้ |

ต้องสะกดตัวเลือกให้ตรงตามนี้ทุกตัว ไม่อย่างนั้น script set ค่าไม่ได้

### Library ใหม่: FollowUp (1 entry = ผลตรวจ 1 ครั้ง)
| Field | ชนิด | ใช้กับ |
|---|---|---|
| `Patient` | Link to entry → Patient (1 entry) | ทุกชนิด |
| `Date` | Date | วันที่ของผล (patho = วันที่รายงาน) |
| `Type` | Single choice: `CT`, `KUB`, `US`, `IVP`, `MRI`, `PSA`, `Lab`, `Patho`, `Other` (cystoscopy และ biopsy เป็นการผ่าตัดใน UroBase ผลเขียนใน OpResult) | ทุกชนิด |
| `StoneFree` | Single choice: `SF`, `Residual <=4mm`, `Residual >4mm` | imaging หลังผ่าตัด |
| `StoneSize` (mm) | Real number | imaging |
| `StoneN`, `StoneHU` | Integer | imaging |
| `StoneSide` | Single choice: `Rt`, `Lt`, `Bilat` | imaging |
| `StoneSite` | Text | imaging |
| `Hydro` | Single choice: `none`, `mild`, `moderate`, `severe` | imaging |
| `ProstateVol` (ml) | Real number | US / MRI |
| `PIRADS` | Integer | MRI |
| `PSA`, `Cr`, `eGFR` | Real number | PSA / Lab |
| `Organ`, `Specimen`, `Cell`, `Grade`, `Gleason`, `pT`, `pN`, `Margin`, `LVI`, `Muscle`, `Cores`, `PathoNo` | Text | Patho |
| `GradeGroup`, `NodesPos`, `NodesTotal` | Integer | Patho |
| `TumorSize` (cm) | Real number | Patho |
| `Recurrence` | Single choice: `No`, `Yes`, `Suspicious` | หมอเลือกเอง (script ไม่เดา) |
| `Finding` | Text (multi-line) | Impression / Diagnosis จากใบรายงาน |
| `Data` | Text ซ่อน | JSON รายละเอียดที่ Report ใช้ (ดูด้านล่าง) |
| `Key` | Text ซ่อน | เดิมใช้กันนำเข้าซ้ำจาก Tasker ตอนนี้ไม่ใช้แล้ว (ไม่ต้องลบ field) |

- พิมพ์เองกรอกแค่ `Patient`, `Date`, `Type` และค่าที่มี เช่น PSA ก็กรอก `PSA` ช่องเดียว
- `Data` ของ imaging ต้องใส่เมื่อมีนิ่วหรือ hydro เพราะ Report ใช้แยกข้างที่ผ่าตัด:
  `{"stones":[{"side":"Rt","site":"renal pelvis","mm":12,"n":1,"hu":900},{"site":"bladder","mm":5,"n":"multiple"}],"hydroSide":{"Rt":"moderate","Lt":"none"}}`
  นิ่ว 1 รายการต่อ 1 ตำแหน่ง, side เป็น `Rt`/`Lt`/`Bilat` หรือไม่ใส่ (เช่น bladder), hydroSide ใส่เฉพาะข้างที่ใบผลระบุ
- `pT` ที่ลงท้ายด้วย `?` (เช่น `>=T2?`) คือเดาจากคำบรรยาย ใบรายงานไม่ได้เขียน TNM ตรงๆ ต้องตรวจเอง
- ตั้งชื่อ entry (Entry name) เป็น `Date` + `Type` + `Patient`

### Report (ใช้วิเคราะห์: ชนิดเดียวกับ field ต้นทางใน FollowUp เช่น `BxGG`, `GradeGroup`, `StoneN`, `PIRADS`, `NodesPos`, `NodesTotal` เป็น Integer, `PSAPre`, `PSAD`, `StoneSize`, `ProstateVol`, `TumorSize` เป็น Real number ที่เหลือเป็น Text)
| กลุ่ม | Field | มาจาก |
|---|---|---|
| Complication | `Clavien`, `ClavienAuto` (ค่าที่ script เดา), `ClavienWhy` (เหตุผล) | UroBase/Backup + ปุ่ม Clavien |
| ก่อนผ่าตัด | `StoneSide`, `StoneSite`, `StoneSize`, `StoneN`, `StoneHU`, `Hydro`, `ProstateVol`, `PIRADS`, `PSAPre`, `PSAD` | FollowUp ล่าสุดภายใน 180 วันก่อนวันผ่าตัด |
| Biopsy ก่อนผ่าตัด | `BxCell`, `BxGleason`, `BxGG`, `BxCores` | Patho ล่าสุดภายใน 365 วันก่อนวันผ่าตัด |
| Patho การผ่าตัดนี้ | `PathoCell`, `PathoGrade`, `Gleason`, `GradeGroup`, `pT`, `pN`, `Margin`, `LVI`, `Muscle`, `NodesPos`, `NodesTotal`, `TumorSize`, `PathoNo` | Patho ตั้งแต่วันผ่าตัดถึง 120 วัน ที่การผ่าตัดนี้เป็นครั้งล่าสุดก่อนวันที่ของผล |

**นิ่วและ Hydro ใช้เฉพาะข้างที่ผ่าตัด** ข้างอ่านจาก Op ก่อน ถ้าไม่มีดู Dx (Rt, Lt, Bilat หรือมีทั้ง Rt และ Lt) นิ่วที่ไม่มีข้าง (เช่น bladder) นับด้วย การผ่าตัดที่ไม่ระบุข้างใช้นิ่วทุกก้อน ค่ามาจากนิ่วแต่ละก้อนที่เก็บไว้ใน `Data` ของ FollowUp จึงใช้กับผลที่นำเข้าไปแล้วได้ ส่วน Hydro แยกข้างได้เฉพาะผลที่มี `hydroSide` ใน `Data`

ถ้ายังไม่สร้าง field ไหน script จะข้าม field นั้นและเขียน log ไว้ ไม่ทำให้ trigger เดิมล้ม
stone-free หลังผ่าตัด, PSA ระยะยาว และ recurrence คำนวณตอนวิเคราะห์จาก FollowUp โดยตรง

**ตัวอย่าง** TURBT 1/2 → CT 1/3 (admit เดิม) → cystectomy 20/3 → patho cystectomy 5/4
- แถว TURBT: patho ของ TURBT
- แถว cystectomy: CT 1/3 เป็นค่าก่อนผ่าตัด, patho TURBT เป็น biopsy, patho 5/4 เป็น patho ของ cystectomy

## 2. ส่วนที่เพิ่มใน UroObj.js
- `rpo.setAll` เรียก `rpo.setResults(r, e)` ท้ายสุด: บันทึกการผ่าตัดเมื่อไหร่ Report ได้ Clavien และผลจาก FollowUp
- เพิ่ม `rpo.put`, `rpo.setResults`, `rpo.find`, `rpo.allops`, `rpo.syncPatient`
- เพิ่ม `trig.FollowUpAfterEdit`, `trig.FollowUpAfterDelete`: บันทึกหรือลบ FollowUp แล้ว Report ทุกการผ่าตัดของคนไข้คนนั้นอัปเดตเอง

ไม่ได้แก้ field หรือ trigger เดิมของ UroBase, Backup, Consult, Patient

## 3. Memento
1. เพิ่ม JavaScript library `Outcome.js` (แบบเดียวกับ MyDate.js)
2. สร้าง library **FollowUp** ตามข้อ 1
   - Trigger: **After saving the entry** (สร้างและแก้) โค้ด `trig.FollowUpAfterEdit(entry());`
   - Trigger: **After deleting an entry** โค้ด `trig.FollowUpAfterDelete(entry());`
3. **UroBase** และ **Backup**: Action
   - ชนิด entry ชื่อ `Clavien` โค้ด `cdo.runOne(entry());`
   - ชนิด library ชื่อ `Clavien ทั้งหมด` โค้ด `cdo.runAll(lib());`
4. trigger และปุ่มทั้งหมดเลือก library `UroObj.js`, `MyDate.js` (ปุ่มเพิ่ม `Outcome.js`) และให้สิทธิ์ Read/Write files

### ปุ่มทำอะไร
- **Clavien**: เดา Clavien ของการผ่าตัดนี้ เติมถ้ายังว่าง เก็บค่าที่เดาและเหตุผลใน Report แล้วแสดงเหตุผล
- **Clavien ทั้งหมด**: ทำแบบเดียวกันกับทุก entry ที่ Done, ผ่าตัดมาแล้ว ≥ 30 วัน และยังว่าง (Backup มีหลายพัน entry อาจใช้เวลาหลายนาที)

## 4. กติกาเดา Clavien (ภายใน 30 วันหลังผ่าตัด)
| เหตุการณ์ | grade |
|---|---|
| Patient = Dead และมีวันที่ เช่น `dead 29/3/2021` ใน OpResult/Rx ภายใน 30 วัน หรือเขียน dead ในบรรทัด P/O day | V |
| OpResult มี `ICU` (ตัวใหญ่), ET tube, intubate, CPR, levophed/vasopressor | IVa |
| ผ่าตัดซ้ำเพื่อแก้ปัญหา (explore, ห้ามเลือด, clot, irrigate, revise, PCN, DJ stent, drain, debride, embolize, resuture ฯลฯ) GA | IIIb |
| เหมือนข้างบน แต่ LA | IIIa |
| Consult ที่ Admit ภายใน 30 วันหลังจำหน่าย | II |
| OpResult มี PRC/FFP/ให้เลือด, sepsis/septic, ESBL, meropenem/ertapenem/vancomycin | II |
| OpResult มี ไข้ (ไม่นับ "คนไข้"), leak (ไม่นับ "no leak"), ปัสสาวะไม่ออก | I |
| ไม่มีข้างบน | None |

- ผ่าตัดที่นัดไว้ไม่นับ: off/change DJ, F/U, Cystoscopy, Foley, SPC, Dilate, second look, stage
- ผ่าตัดอื่นที่ไม่ใช่การแก้ปัญหา (เช่น TURBT แล้ว cystectomy) ไม่นับ แต่ขึ้นเป็นหมายเหตุให้ตรวจ
- IVb, IVa จาก septic shock ที่ไม่ได้ใช้ยากระตุ้นความดัน และ grade I ที่ไม่มีคำในรายการ ต้องเลือกเอง
- ลองกับข้อมูลการผ่าตัดย้อนหลัง 5,372 ครั้ง: None 4,949, I 89, II 152, IIIa 94, IIIb 36, IVa 32, V 20

## 5. ทดสอบ (ใช้ข้อมูลปลอม HN 123456)
1. สร้าง Patient HN 123456 และ UroBase การผ่าตัดปลอม 1 entry Status Done (ดูว่ามี Report แถวใหม่)
2. FollowUp: สร้าง entry พิมพ์เอง Type `PSA`, PSA 8.2, วันที่ก่อนวันผ่าตัด 10 วัน → Report ของการผ่าตัดนี้ต้องได้ PSAPre 8.2
3. ให้ AI ใน Memento ลง FollowUp ปลอมของ HN 123456: CT วันก่อนวันผ่าตัด 5 วัน "Rt renal pelvic stone 12 mm with moderate hydronephrosis"
   ดูว่า AI ใส่ `Data` เป็น `{"stones":[{"side":"Rt","site":"renal pelvis","mm":12,"n":1}],"hydroSide":{"Rt":"moderate"}}`
4. เปิด library FollowUp ใหม่ (ให้ Report อัปเดต) → Report ได้ StoneSize 12, Hydro moderate
5. ลบ FollowUp PSA → Report PSAPre ต้องว่าง
6. UroBase entry ปลอม > Clavien: ควรขึ้น None และ Report มี ClavienAuto None
7. ลบข้อมูลปลอมทั้งหมด

## ความเป็นส่วนตัว
รูปและข้อความใบผลมี HN และชื่อคนไข้ ถ้าจะส่งออกนอก Memento (เช่น ส่งให้คนอื่นดูหรือแนบใน issue) ให้ปิด HN/ชื่อก่อนทุกครั้ง
