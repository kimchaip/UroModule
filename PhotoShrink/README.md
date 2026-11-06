# ย่อรูปเก่าในฟิลด์ Photo

Memento Cloud ของแพ็ก Pro ได้ 5GB แต่รูปจากกล้อง (ประมาณ 4.7MB ต่อรูป) ใช้พื้นที่ไปเกือบหมด ทดสอบแล้ว (2026-11-04) ว่าถ้าย่อรูปใน entry พื้นที่บน cloud จะลดลงด้วย

รูปที่ถ่ายใหม่ผ่านฟิลด์จะถูกย่อตาม Image capture size ของฟิลด์ (ตั้ง Max width / Max height = 1600) แต่รูปที่เลือกจากแกลเลอรีไม่ถูกย่อ

## ขั้นตอน

| ขั้น | ไฟล์ | ทำอะไร | สถานะ |
|---|---|---|---|
| 1 | `PhotoList.js` | Action ระดับ library ใน UroBase / Consult / Backup ทำรายการไฟล์ในทุกฟิลด์รูป/ไฟล์เป็น `photolist_<library>_<เวลา>.json` ใน /Workload และสรุปจำนวนแยกตามฟิลด์ อ่านอย่างเดียว | ใช้แล้ว |
| 2 | `ResizePhotos.ps1` (คอม Windows) | ดาวน์โหลดรูปของ library จากหน้า File storage ของ Memento แล้วย่อให้ด้านยาวไม่เกิน 1600px ใช้ชื่อไฟล์เดิม เก็บต้นฉบับไว้เป็นสำรอง | ใช้แล้ว |
| 3 | `PhotoSwap.js` | Action ระดับ entry: เปลี่ยน Photo ของ entry ที่เลือกเป็นรูปชื่อเดียวกันใน /Workload/PhotoSmall/ บันทึก path เดิมใน `photoswap_log.txt` | ใช้แล้ว |
| 4 | `PhotoSwapAll.js` | Action ระดับ library: ทำแบบขั้น 3 กับทุก entry ที่มีรูปย่อในรายชื่อ | ใช้แล้ว |
| 5 | Files > Find Missing Files | เลือกโฟลเดอร์ Workload/PhotoSmall ให้ Memento นำเข้ารูปย่อ | ใช้แล้ว |
| 6 | `PhotoRelink.js` | Action ระดับ library: แก้ entry ที่ใช้ไฟล์ร่วมกันแล้วยังชี้ไป PhotoSmall ให้ใช้ path ที่ Find Missing Files แก้แล้ว | ใช้แล้ว |

ข้อจำกัดที่เจอบนมือถือ (2026-11-05)
- `file()` ของ Memento หาไฟล์ได้เฉพาะที่อยู่ตรงใน /Workload ไม่เห็นโฟลเดอร์ย่อย จึงใช้รายชื่อ `photosmall_list.txt` (ResizePhotos.ps1 สร้างไว้ข้างโฟลเดอร์ PhotoSmall คัดลอกไปไว้ใน Workload)
- หลังเปลี่ยน path รูปจะขึ้น EACCES (Permission denied) ต้องทำ Files > Find Missing Files > เลือก Workload/PhotoSmall ให้ Memento ได้สิทธิ์อ่านไฟล์ แล้วรูปจะขึ้นปกติ
- ตัวเลขพื้นที่ cloud แสดงทีละ 0.1GB เปลี่ยนไม่กี่รูปจะมองไม่เห็นความต่าง

ผลขั้น 1 (2026-11-05): UroBase มี 415 entry ที่มีรูป รวม 832 ไฟล์ทั้งหมดอยู่ในฟิลด์ Photo (jpg 830, heic 2) เก็บในพื้นที่ส่วนตัวของ Memento (`/data/user/0/com.luckydroid.droidbase/...`) ซึ่ง Tasker อ่านไม่ได้ จึงใช้การดาวน์โหลดจากหน้า File storage แทน

ผลรวม (2026-11-06)
- UroBase: ไฟล์รูป 11.8GB เหลือ 1.3GB, Consult: 3.8GB เหลือ 0.4GB (Consult เปลี่ยน 622 จาก 628 entry ที่เหลือเป็น heic หรืออยู่โฟลเดอร์อื่น)
- พื้นที่ Memento Cloud ลดจาก 4.6GB เหลือประมาณ 1GB (32%) หลัง upload Consult ขึ้น cloud ครบ
- Backup ไม่ได้ย่อ (เก็บในเครื่อง ไม่ขึ้น cloud) entry ใน Backup ยังชี้ไฟล์ต้นฉบับเดิม
- ลำดับที่ใช้ได้: PhotoSwapAll > Find Missing Files > PhotoRelink > PhotoList ตรวจว่าไม่เหลือ path PhotoSmall
- หลังตรวจครบค่อยลบ Unlinked files ในหน้า File storage และ zip ใน Workload เก็บต้นฉบับในคอมไว้

## ติดตั้ง PhotoList.js

1. เปิด library (เช่น UroBase) > แก้ไข library > Actions > เพิ่ม Action ระดับ library (ไม่ต้องเลือก entry)
2. วางโค้ดจาก `PhotoList.js` ไม่ต้องเลือก JavaScript library
3. กดรัน จะเห็นข้อความสรุปจำนวนรูปและโฟลเดอร์ที่เก็บรูป
