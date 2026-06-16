var autofill = {
  findresult : function (query, libName, title, desc, count) {
    // filter
    let dx = libByName(libName);
    let dxs =  dx.entries();
    let qarr = query.toLowerCase()
                    .replace(/[ -\/]+/g, ";");
    dxs = dxs.filter(e=>{
      let str = e.field(title)
                 .toLowerCase()
                 .replace(/[ -\/]+/g, ";");
      if (str.indexOf(qarr) >-1)
        return true;
      return false;
    });
    let result;
    if(count) {
      // to object
      result = dxs.map(e=>{
        let o = new Object();
        o["title"] = e.field(title);
        if(desc.length>0) {
          o["desc"] = desc.map(v=>e.field(v))
                          .join() + " ©" + e.field(count);
          desc.forEach(v=>o[v.toLowerCase()] = e.field(v));
        }
        o["count"] = e.field(count);
        return o;
      });
    }
    else {
      // grouping
      let group = {};
      for(let i in dxs) {
        let ent = [];
        ent.push(dxs[i].field(title));
        if(desc && desc.length>0)
          ent = ent.concat(desc.map(v=>dxs[i].field(v)));
        let key = ent.join(";");
        group[key] = (group[key] || 0) + 1;
      }
      // to object
      result = Object.keys(group).map(k=>{
        let o = new Object();
        let a = k.split(";");
        o["title"] = a.splice(0, 1);
        if(a.length>0) {
          o["desc"] = a.join();
          for(let i=0; i<desc.length; i++)
            o[desc[i].toLowerCase()] = a[i];
        }
        o["count"] = group[k];
        return o;
      });
    }
    // sort by count
    result.sort((a,b)=>b.count-a.count);
    return result;
  }
};

var script = {

  // -----------------------------
  // Utility
  // -----------------------------
  calcOpMinutes : function(entries, isORExtra) {
    return entries.reduce((t,a)=>{
      let base = a.field("OpLength");
      let bufferGA = isORExtra ? 900000 : 1800000;   // GA 15 vs 30 นาที
      let bufferLA = 600000;  // LA 10 นาที
      let buffer = a.field("ORType") == "GA" ? bufferGA : bufferLA;
      return t + base + buffer;
    },0) / 60000;
  },

  analyzeHoliday : function(hd) {
    if(!hd || hd.length==0) return { holiday:false, orExtra:false, banned:false };

    return {
      holiday : hd.some(h=>h.field("Holiday")),
      orExtra : hd.some(h=>h.field("Title")=="ORนอกเวลา" && h.field("Calendar")=="Kim"),
      banned  : hd.some(h=>h.field("OutOfDuty"))
    };
  },

  checkholiday : function(date) {
    if (!my.dateIsValid(date)) return [];
    
    const hd = libByName("Holidays");
    const hds = hd.entries();

    const datestr = date.toDateString();
    return hds.filter(e=>{
      if(my.dateIsValid(e.field("Date"))) {
        return e.field("Date").toDateString()==datestr;
      }
      return false;
    });
  },

  // -----------------------------
  // หา earliest OR Extra
  // -----------------------------
  findEarliestORExtra : function(lb) {

    let today = new Date();

    for(let i=0; i<60; i++) {
      let checkDate = my.dateadd(today, i);

      let hd = this.checkholiday(checkDate);
      let hinfo = this.analyzeHoliday(hd);

      if(!hinfo.orExtra) continue;     // ต้องเป็น OR นอกเวลา
      if(hinfo.banned) continue;       // ห้าม set
      if(hinfo.holiday) continue;      // ไม่เอาวันหยุด

      let all = lb.entries();
      
      let datestr = checkDate.toDateString();
      let cases = all.filter(a =>
        a.field("Date").toDateString() == datestr &&
        a.field("Status") != "Not"
      );

      let totalMin = this.calcOpMinutes(cases, true);
      let cutoff = 7*60+30;   // 8.30-16.00 = 7.30

      if(totalMin <= cutoff) {
        return { date:new Date(checkDate), totalMin };
      }
    }

    return null;
  },

  // -----------------------------
  // หา earliest Monday
  // -----------------------------
  findEarliestMonday : function(lb) {

    let today = new Date();

    for(let i=0; i<60; i++) {
      let checkDate = my.dateadd(today, i);

      if(checkDate.getDay() !== 1) continue;  // ต้องเป็นวันจันทร์

      let hd = this.checkholiday(checkDate);
      let hinfo = this.analyzeHoliday(hd);

      if(hinfo.banned) continue;
      if(hinfo.holiday) continue;
      if(hinfo.orExtra) continue;  // จันทร์ปกติเท่านั้น

      let all = lb.entries();
      
      let datestr = checkDate.toDateString();
      let cases = all.filter(a =>
        a.field("Date").toDateString() == datestr &&
        a.field("Status") != "Not"
      );

      let totalMin = this.calcOpMinutes(cases, false);
      let cutoff = 6*60 + 30;   // 9.00-15.00 = 6.00

      if(totalMin <= cutoff) {
        return { date:new Date(checkDate), totalMin };
      }
    }

    return null;
  },

  // -----------------------------
  // ใช้ในปุ่ม
  // -----------------------------
  run : function(e, lb) {

    let orExtra = this.findEarliestORExtra(lb);
    let monday  = this.findEarliestMonday(lb);

    // เตรียมข้อความ
    let txtExtra = orExtra
      ? "OR นอกเวลา: " + orExtra.date.toDateString()
      : "ไม่พบวัน OR นอกเวลา";

    let txtMon = monday
      ? "OR วันจันทร์: " + monday.date.toDateString()
      : "ไม่พบวันจันทร์";

    // -----------------------------
    // Dialog ให้เลือก
    // -----------------------------
    const dlg = dialog()
      .title("เลือกวันที่ต้องการ Set OR")
      .text(txtMon + "\n" + txtExtra)
      .neutralButton("Cancel", () => {
        return true;
      })
      .negativeButton("OR วันจันทร์", () => {
        if(monday) {
          e.set("Date", monday.date);
        }
        return true;
      })
      .positiveButton("OR นอกเวลา", () => {
        if(orExtra) {
          e.set("Date", orExtra.date);
        } 
        return true;
      })
      .show();
  }
};
