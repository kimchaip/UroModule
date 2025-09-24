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
}
var script = {
  timeanswer : function (m) {
    let time = {};
    if(m>=10) {
      time["hr"] = Math.floor(m/60);
      time["min"] = m%60;
      if(time.hr>0)
        return "เต็มที่ ยังเหลือเวลาอยู่ " + time.hr + ":" + ("0" + time.min).slice(-2) + " น."
      else
        return "ยังเหลือเวลาอยู่ " + time.min + " น."
    }
    else if(m>=0){
      return "้เต็มแล้ว ยังเหลือเวลา " + m + " น."
    }
    else {
      time["hr"] = Math.floor(Math.abs(m)/60);
      time["min"] = Math.abs(m)%60;
      if(time.hr>0)
        return "เต็มแล้ว เกินเวลา " + time.hr + ":" + ("0" + time.min).slice(-2) + " น."
      else
        return "เต็มแล้ว เกินเวลา " + time.min + " น."
    }
  },
  timeleft : function (m, ot, hd) {
    let textarr = [];
    const calName = ["Calendar","Sak","Krissana","Suthee"];
    const translate = ["ชัยพร", "เอกณัฏฐ์","กฤษณะ","สุธี"];
    if(ot || (hd && hd.length>0)) {
      if(hd && hd.length>0 && hd.some(h=>h.field("OutOfDuty"))) {
        let hde = hd.find(h=>h.field("OutOfDuty"));
        notification()
          .id(1)
          .title("ผลการประเมิน")
          .text("วันนี้ห้าม Set ติด '" + hde.field("Title") + "'")
          .bigText("วันนี้ห้าม Set ติด '" + hde.field("Title") + "'")
          .show();
        //message("วันนี้ห้าม Set ติด '" + hde.field("Title") + "'");
      }
      else {
        if(hd && hd.length>0 && hd.some(h=>h.field("Holiday"))) {
          let hde = hd.find(h=>h.field("Holiday"));
          textarr.push("วันหยุด" + hde.field("Title"));
        }
        if(ot) {
          textarr.push("วันหยุดเสาร์-อาทิตย์");
        }
        if(hd && hd.length>0 && hd.some(h=>h.field("Title")=="ORนอกเวลา") ) {
          let hde = hd.find(h=>h.field("Title")=="ORนอกเวลา");
          textarr.push("ORนอกเวลา"+translate[calName.indexOf(hde.field("Calendar"))]);
        }
          
        notification()
          .id(1)
          .title("ผลการประเมิน")
          .text(textarr.join() + " " +  this.timeanswer(420-m))
          .bigText(textarr.join() + " " +  this.timeanswer(420-m))
          .show();
        //message(textarr.join() + " " +  this.timeanswer(420-m));
      }
    }
    else {
      notification()
          .id(1)
          .title("ผลการประเมิน")
          .text(timeanswer(360-m))
          .bigText(timeanswer(360-m))
          .show();
      //message(timeanswer(360-m));
    }
  },
  checkholiday : function(date) {
    let hd = libByName("Holidays");
    let hds = hd.entries();
    
    return hds.filter(e=>{
      if(my.dateIsValid(e.field("Date")) && my.dateIsValid(date)) {
        return e.field("Date").toDateString()==date.toDateString();
      }
      else {
        return false;
      }
    });
  },
  checkopdate : function (e, lb) {
    let all = lb.entries();
    let opdate = my.gdate(my.date(e.field("Date")));
    
    let holiday = this.checkholiday(e.field("Date"));
    
    let result = all.filter(a=>my.gdate(a.field("Date"))==opdate && a.field("Status")!="Not");
    let optime;
    let wd = my.gday(e.field("Date"));
    if(wd==0 || wd==6) {
      optime = result.reduce((t,a)=>{
        if(a.field("ORType")=="GA")
          t+=a.field("OpLength")+600000;
        else
          t+=a.field("OpLength")+300000;
        return t;
      },0);
    }
    else {
      optime = result.reduce((t,a)=>{
        if(a.field("ORType")=="GA")
          t+=a.field("OpLength")+1200000;
        else
          t+=a.field("OpLength")+900000;
        return t;
      },0);
    }
    let optimemin = Math.floor(optime/60000);
    this.timeleft(optimemin, wd==0||wd==6, holiday);
  }
}
