# UroModule

ชุด JavaScript สำหรับ [Memento Database](https://mementodatabase.com/) บน Android ใช้บันทึกข้อมูลคนไข้ urology ด้วยมือถือ ได้แก่ ข้อมูลคนไข้, ตารางผ่าตัด, เคส consult, การนอนโรงพยาบาล, DJ stent และรายงานผลการผ่าตัด แล้ว sync ตารางผ่าตัดไป Google Sheet และนัดหมายไป Google Calendar

เป้าหมายคือให้การลงข้อมูลบนมือถือทำได้เร็วและไม่ซ้ำซ้อน โดย script จะเติมข้อมูลอัตโนมัติ ตรวจข้อมูลซ้ำ และเก็บข้อมูลไว้ใช้วิเคราะห์ผลการรักษาภายหลัง

## ภาพรวม

```
            ┌──────────── Patient ────────────┐
            │  (HN, ชื่อ, อายุ, Underlying, DJ) │
            └───────┬───────────┬─────────────┘
                    │ link      │ link
        ┌───────────▼──┐   ┌────▼─────┐        ┌──────────┐
        │   UroBase    │   │ Consult  │        │  Report  │ 1 แถว / 1 การผ่าตัด
        │ (ตาราง OR    │──►│ (นัด F/U,│        │ (ใช้วิเคราะห์) │
        │  ≤ ~2 ปี)     │   │  consult)│        └────▲─────┘
        └──┬────────┬──┘   └──────────┘             │ rpo.setAll
           │        └───────────────────────────────┘
           │ ย้ายข้อมูลเก่า                  DxAutoFill / OperationList
        ┌──▼─────┐                         (รายการ Dx/Op ที่ใช้บ่อย + OpType)
        │ Backup │ (ข้อมูล UroBase ที่เก่ากว่า ~2 ปี)
        └────────┘
  Holidays ◄──► Google Calendar (CalendarSync.js + Apps Script)
  UroBase / UroCRH ──► Google Sheet (syncGoogleSheet)
```

### Library ใน Memento

| Library | ใช้ทำอะไร |
|---|---|
| **Patient** | ข้อมูลคนไข้ 1 คน 1 entry: HN, ชื่อ, วันเกิด/อายุ, Underlying, สถานะ, DJ stent ล่าสุด (`DJstent`, `DJStamp`), re-op |
| **UroBase** | การผ่าตัด/หัตถการ 1 ครั้ง 1 entry: วันที่, Dx, Op, ORType (GA/LA), คิว, Admit/OPD, LOS, OpResult, DJ stent, Status (Plan/Done/Not) |
| **Backup** | โครงสร้างเดียวกับ UroBase เก็บข้อมูลเก่ากว่า ~2 ปี เพื่อให้ UroBase เล็กและเร็ว |
| **Consult** | เคส consult และนัด F/U (`ConsultDate`, `Rx`) |
| **Report** | สรุปการผ่าตัด 1 แถวต่อ 1 การผ่าตัด สร้าง/แก้/ลบอัตโนมัติจาก UroBase ใช้วิเคราะห์ผลการรักษา |
| **DxAutoFill** | คู่ Dx → Op ที่เคยใช้ พร้อมจำนวนครั้ง ใช้เติมอัตโนมัติ |
| **OperationList** | รายการหัตถการ, กลุ่ม (`OpList`, `OpGroup`), ประเภท (`OpType` เช่น OH = OR นอกเวลา) |
| **Holidays** | วันหยุด, วันไม่อยู่, OR นอกเวลา sync กับ Google Calendar |
| **UroCRH** | ตารางที่ sync ไป Google Sheet ให้เพื่อนร่วมงานดู |

### ไฟล์ใน repo

| ไฟล์ | หน้าที่ |
|---|---|
| `MyDate.js` | ฟังก์ชันวันที่และเวลา (`my.date`, `my.compDate`, `my.diffDate` ฯลฯ) และตัวแปร `today`, `hour` ต้องโหลดก่อนไฟล์อื่น |
| `UroObj.js` | logic หลักของทุก library และ trigger (`trig.*`) เช่น เติมข้อมูลอัตโนมัติ, ตรวจซ้ำ, จัดคิว OR, merge การ admit, DJ stent, LOS, สร้าง Report |
| `Autofill.js` | ค้นหาและเรียงตัวเลือก Dx/Op/ชื่อ ตามความถี่ และปุ่มหาวันว่าง OR (วันจันทร์ / OR นอกเวลา) |
| `CalendarSync.js` | sync library Holidays กับ Google Calendar ผ่าน Apps Script Web App |
| `Widget.js` | สร้าง widget แสดงรายการ OR ที่จะมาถึง 90 วัน |

## การติดตั้ง

Template ที่แชร์ไว้ เปิดลิงก์บนมือถือที่ติดตั้ง Memento Database เพื่อเพิ่ม library เข้าแอปได้ทันที:

- [Patient](https://mementodb.com/t/4669873801396224)
- [UroBase](https://mementodb.com/t/6472042078797824)

ถ้าต้องการโครงสร้างครบทุก library ให้ใช้วิธี restore ด้านล่าง

1. ดาวน์โหลด zip โครงสร้างฐานข้อมูลจาก [Google Drive](https://drive.google.com/file/d/1EQxo1GUh1thZnCH3xzjhITYhuYa9Z5pX/view?usp=drive_link) เก็บไว้ที่ folder "Download" ในโทรศัพท์
2. ติดตั้งแอป Memento Database
3. Restore: เปิดแอป > Settings > Restore > เลือกไฟล์ `memento_backup_******.zip` แล้วรอติดตั้ง
4. ให้สิทธิ์ script: เปิด library "Patient" > ... > Scripts > กดไอคอนโล่มุมขวาบน เปิด Libraries, Read files, Write files, Network ทำแบบเดียวกันกับทุก library (UroBase, Consult, Backup, DxAutoFill, OperationList, Report, Holidays) ถ้าแอปถามว่าจะ "upload" ไหมตอนเปิด library ครั้งแรก ให้ตอบ "No, Thanks"
5. แก้ได้เฉพาะ field ประเภท selection เช่น Ward, Dr, Underlying field อื่นอย่าแก้ เพราะ script อ้างชื่อ field โดยตรง

หมายเหตุ: Memento เวอร์ชันฟรีจำกัด 3 library และ 1 script ต่อ library จึงเพิ่ม library หรือ script ไม่ได้ ถ้าต้องการใช้เต็มที่ต้องซื้อเวอร์ชันเต็ม

## การนำไปใช้ต่อ

copy ไปปรับใช้ได้ตามต้องการ แต่ต้องรู้ JavaScript และ Memento Database scripting เล็กน้อย รายละเอียดโครงสร้างโค้ด ข้อตกลง และข้อควรระวังอยู่ใน [HANDOFF.md](HANDOFF.md)
