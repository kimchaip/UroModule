# Outcome: ผลการรักษา (Clavien + FollowUp)

**กติกาบันทึก**
- ระหว่างนอนโรงพยาบาล: เขียนใน OpResult เหมือนเดิม
- ผลตรวจที่มีวันที่ของตัวเอง (CT, US, KUB, MRI, patho, lab, PSA): ลง **FollowUp** ทุกครั้ง แม้ทำระหว่าง admit
- Report จับคู่ผลกับการผ่าตัดจากวันที่ให้เอง และอัปเดตทุกครั้งที่บันทึก FollowUp หรือการผ่าตัด

ลง FollowUp ได้ 2 ทาง: พิมพ์เอง หรือถ่ายรูปผล → LINE แปลงเป็นข้อความ → Tasker ฝากไว้ในไฟล์ → กดปุ่ม **นำเข้าผลตรวจ** ใน FollowUp

| ไฟล์ | ใช้ที่ไหน |
|---|---|
| `Outcome.js` | Memento JavaScript library (แบบ MyDate.js): เดา Clavien, นำเข้าผลจาก `outcomeInbox.json` เข้า FollowUp |
| `outcomeextract.js` | Tasker action JavaScript: อ่านข้อความผล patho / imaging / PSA / lab → `%jsonline` |

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
| `Data`, `Key` | Text ซ่อน | script ใช้ ห้ามแก้ |

- พิมพ์เองกรอกแค่ `Patient`, `Date`, `Type` และค่าที่มี เช่น PSA ก็กรอก `PSA` ช่องเดียว
- `pT` ที่ลงท้ายด้วย `?` (เช่น `>=T2?`) คือเดาจากคำบรรยาย ใบรายงานไม่ได้เขียน TNM ตรงๆ ต้องตรวจเอง
- ตั้งชื่อ entry (Entry name) เป็น `Date` + `Type` + `Patient`

### Report (ใช้วิเคราะห์: ชนิดเดียวกับ field ต้นทางใน FollowUp เช่น `BxGG`, `GradeGroup`, `StoneN`, `PIRADS`, `NodesPos`, `NodesTotal` เป็น Integer, `PSAPre`, `PSAD`, `StoneSize`, `ProstateVol`, `TumorSize` เป็น Real number ที่เหลือเป็น Text)
| กลุ่ม | Field | มาจาก |
|---|---|---|
| Complication | `Clavien`, `ClavienAuto` (ค่าที่ script เดา), `ClavienWhy` (เหตุผล) | UroBase/Backup + ปุ่ม Clavien |
| ก่อนผ่าตัด | `StoneSide`, `StoneSite`, `StoneSize`, `StoneN`, `StoneHU`, `Hydro`, `ProstateVol`, `PIRADS`, `PSAPre`, `PSAD` | FollowUp ล่าสุดภายใน 180 วันก่อนวันผ่าตัด |
| Biopsy ก่อนผ่าตัด | `BxCell`, `BxGleason`, `BxGG`, `BxCores` | Patho ล่าสุดภายใน 365 วันก่อนวันผ่าตัด |
| Patho การผ่าตัดนี้ | `PathoCell`, `PathoGrade`, `Gleason`, `GradeGroup`, `pT`, `pN`, `Margin`, `LVI`, `Muscle`, `NodesPos`, `NodesTotal`, `TumorSize`, `PathoNo` | Patho ตั้งแต่วันผ่าตัดถึง 120 วัน ที่การผ่าตัดนี้เป็นครั้งล่าสุดก่อนวันที่ของผล |

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

## 3. Tasker: task ใหม่ชื่อ setOutcome
copy `outcomeextract.js` ไปไว้ในโฟลเดอร์ `Workload/` ของมือถือ (ที่เดียวกับ `emrextract.js` ดู [EmrIntake/README.md](../EmrIntake/README.md) ข้อ 1)

| # | Action | ค่า | If |
|---|---|---|---|
| 1 | Variables > Variable Set | Name `%txt` To `%CLIP` | `%CLIP` Set |
| 2 | Code > JavaScript | Path `Workload/outcomeextract.js`, Auto Exit ✓, Timeout 2, Continue Task After Error ✓ | |
| 3 | Task > If | | `%jsonline` Set |
| 4 | File > Write File | File `Workload/outcomeInbox.json`, Text `%jsonline`, **Append ✓**, **Add Newline ✓** | |
| 5 | Alert > Notify | Title `ผล %otype รอนำเข้า` Text `HN %hnx %namex วันที่ %odate` / `%osum` | |
| 6 | Task > Else | | |
| 7 | Alert > Flash | `อ่าน HN/ชื่อ หรือวันที่ไม่ได้` | |
| 8 | Task > End If | | |

เรียก task นี้ด้วยมือ (ปุ่ม/shortcut) หลัง copy ข้อความจาก LINE ไม่ผูกกับ Clipboard Changed เพราะ setConsult ใช้อยู่แล้ว
**HN**: ใช้เลขของ รพ.เราแบบ `HN 200-66-58 (03)` ก่อนเสมอ (เช่นสติกเกอร์บนใบส่งตัวหรือใบผลจาก รพ.อื่น) ถ้าไม่มีจึงใช้ `HN: 123456` ตัวแรก ใบส่งตัว (MOPH Refer) ที่ไม่มี HN ของ รพ.เรา จะไม่ถูกฝากเข้าไฟล์ (ขึ้น "อ่าน HN หรือวันที่ไม่ได้") เพราะ `HN:` ในใบนั้นเป็นของ รพ.ต้นทาง วันที่แบบ `วันที่ 12 เดือน ตุลาคม พ.ศ. 2569` อ่านได้

**ไม่มี HN** (เช่นผล CT จาก รพ.อื่น): อ่านชื่อจาก `Patient Name :` หรือ `ชื่อ-สกุล :` แทน (ไม่ใช้ Patient ID ของ รพ.อื่น) ตอนนำเข้า Memento หาคนไข้จากชื่อ โดยตัดคำนำหน้า (นาย นาง นางสาว ฯลฯ) และช่องว่างออกก่อนเทียบ นำเข้าเฉพาะเมื่อเจอชื่อตรงกัน**คนเดียว** ถ้าไม่เจอหรือชื่อซ้ำหลายคน จะข้ามและค้างไว้ในไฟล์ คนไข้ต้องมีอยู่ใน Patient แล้ว ถ้า Notify ไม่มี `%namex` ให้แก้ Notify ตามตารางข้างบน

ตรวจ Notify ทุกครั้ง ถ้า `%osum` ดูผิด ให้แก้ใน FollowUp หลังนำเข้า

## 4. Memento
1. เพิ่ม JavaScript library `Outcome.js` (แบบเดียวกับ MyDate.js)
2. สร้าง library **FollowUp** ตามข้อ 1
   - Trigger: **After saving the entry** (สร้างและแก้) โค้ด `trig.FollowUpAfterEdit(entry());`
   - Trigger: **After deleting an entry** โค้ด `trig.FollowUpAfterDelete(entry());`
   - Action ชนิด library ชื่อ `นำเข้าผลตรวจ` โค้ด `oco.importFollowUp();`
3. **UroBase** และ **Backup**: Action
   - ชนิด entry ชื่อ `Clavien` โค้ด `cdo.runOne(entry());`
   - ชนิด library ชื่อ `Clavien ทั้งหมด` โค้ด `cdo.runAll(lib());`
4. trigger และปุ่มทั้งหมดเลือก library `UroObj.js`, `MyDate.js` (ปุ่มเพิ่ม `Outcome.js`) และให้สิทธิ์ Read/Write files

### ปุ่มทำอะไร
- **นำเข้าผลตรวจ**: นำทุกบรรทัดที่ค้างในไฟล์เข้า FollowUp (หา Patient จาก HN ถ้าไม่มี HN หาจากชื่อที่ตรงกันคนเดียว) แล้วอัปเดต Report ของคนไข้เหล่านั้น บรรทัดที่หาคนไข้ไม่เจอหรือชื่อซ้ำค้างไว้ในไฟล์
- **Clavien**: เดา Clavien ของการผ่าตัดนี้ เติมถ้ายังว่าง เก็บค่าที่เดาและเหตุผลใน Report แล้วแสดงเหตุผล
- **Clavien ทั้งหมด**: ทำแบบเดียวกันกับทุก entry ที่ Done, ผ่าตัดมาแล้ว ≥ 30 วัน และยังว่าง (Backup มีหลายพัน entry อาจใช้เวลาหลายนาที)

## 5. กติกาเดา Clavien (ภายใน 30 วันหลังผ่าตัด)
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

## 6. ทดสอบ (ใช้ข้อมูลปลอม HN 123456)
1. สร้าง Patient HN 123456 และ UroBase การผ่าตัดปลอม 1 entry Status Done (ดูว่ามี Report แถวใหม่)
2. FollowUp: สร้าง entry พิมพ์เอง Type `PSA`, PSA 8.2, วันที่ก่อนวันผ่าตัด 10 วัน → Report ของการผ่าตัดนี้ต้องได้ PSAPre 8.2
3. ใส่ข้อความปลอมนี้ใน `%CLIP` แล้วรัน setOutcome
   ```
   CT KUB HN 123456
   Exam date: (วันก่อนวันผ่าตัด 5 วัน)
   IMPRESSION: Rt renal pelvic stone 12 mm with moderate hydronephrosis.
   ```
   Notify ควรขึ้น `CT, Residual >4mm, Rt renal pelvis 12mm, hydro moderate`
4. FollowUp > นำเข้าผลตรวจ: ควรได้ "HN 123456 CT ..." และ Report ได้ StoneSize 12, Hydro moderate
5. กดซ้ำ: ต้องขึ้น "ไม่มีผลรอนำเข้า"
6. ลบ FollowUp PSA → Report PSAPre ต้องว่าง
7. UroBase entry ปลอม > Clavien: ควรขึ้น None และ Report มี ClavienAuto None
8. ลบข้อมูลปลอมทั้งหมด

## ความเป็นส่วนตัว
รูปและข้อความที่ประมวลบนมือถือมี HN ได้ (ต้องใช้จับคู่คนไข้) แต่ถ้าจะส่งรูปหรือข้อความออกนอกเครื่อง ให้ปิด HN/ชื่อก่อนทุกครั้ง
