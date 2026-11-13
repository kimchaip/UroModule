// ===== AiCatchUp : ทำ trigger ที่ค้างของ entry ที่ AI ใน Memento สร้างหรือแก้ เมื่อเปิด library =====
// วางใน trigger "Opening a library" (After window display) ของ UroBase, Consult, Patient,
// Backup, DxAutoFill, OperationList, FollowUp (โค้ดเดียวกัน) เลือก library MyDate.js, UroObj.js
// logic อยู่ใน aic ของ UroObj.js
aic.catchUpLibrary(lib());
