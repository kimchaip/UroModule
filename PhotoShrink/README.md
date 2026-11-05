# ย่อรูปเก่าในฟิลด์ Photo

Memento Cloud ของแพ็ก Pro ได้ 5GB แต่รูปจากกล้อง (ประมาณ 4.7MB ต่อรูป) ใช้พื้นที่ไปเกือบหมด ทดสอบแล้ว (2026-11-04) ว่าถ้าย่อรูปใน entry พื้นที่บน cloud จะลดลงด้วย

รูปที่ถ่ายใหม่ผ่านฟิลด์จะถูกย่อตาม Image capture size ของฟิลด์ (ตั้ง Max width / Max height = 1600) แต่รูปที่เลือกจากแกลเลอรีไม่ถูกย่อ

## ขั้นตอน

| ขั้น | ไฟล์ | ทำอะไร | สถานะ |
|---|---|---|---|
| 1 | `PhotoList.js` | Action ระดับ library ใน UroBase / Consult / Backup ทำรายการไฟล์ในทุกฟิลด์รูป/ไฟล์เป็น `photolist_<library>_<เวลา>.json` ใน /Workload และสรุปจำนวนแยกตามฟิลด์ อ่านอย่างเดียว | พร้อมทดสอบ |
| 2 | `ResizePhotos.ps1` (คอม Windows) | ดาวน์โหลดรูปของ library จากหน้า File storage ของ Memento แล้วย่อให้ด้านยาวไม่เกิน 1600px ใช้ชื่อไฟล์เดิม เก็บต้นฉบับไว้เป็นสำรอง | รอทดสอบ |
| 3 | `PhotoSwap.js` | Action ระดับ entry: เปลี่ยน Photo ของ entry ที่เลือกเป็นรูปชื่อเดียวกันใน /Workload/PhotoSmall/ บันทึก path เดิมใน `photoswap_log.txt` | รอทดสอบกับ entry เดียว |

ผลขั้น 1 (2026-11-05): UroBase มี 415 entry ที่มีรูป รวม 832 ไฟล์ทั้งหมดอยู่ในฟิลด์ Photo (jpg 830, heic 2) เก็บในพื้นที่ส่วนตัวของ Memento (`/data/user/0/com.luckydroid.droidbase/...`) ซึ่ง Tasker อ่านไม่ได้ จึงใช้การดาวน์โหลดจากหน้า File storage แทน

## ติดตั้ง PhotoList.js

1. เปิด library (เช่น UroBase) > แก้ไข library > Actions > เพิ่ม Action ระดับ library (ไม่ต้องเลือก entry)
2. วางโค้ดจาก `PhotoList.js` ไม่ต้องเลือก JavaScript library
3. กดรัน จะเห็นข้อความสรุปจำนวนรูปและโฟลเดอร์ที่เก็บรูป
