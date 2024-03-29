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
        return "ยังเหลือเวลาอยู่ " + time.hr + ":" + ("0" + time.min).slice(-2) + " น."
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
    let tl;
    if(ot || hd) {
      if(hd && hd.field("OutOfDuty"))
        message("วันนี้ห้าม Set ติด '" + hd.field("Title") + "'");
      else if(hd && hd.field("Holiday"))
        message("วันหยุด" + hd.field("Title") + " " +  this.timeanswer(420-m));
      else
        message("วันหยุดเสาร์อาทิตย์ " +  this.timeanswer(420-m));
    }
    else {
      message(this.timeanswer(360-m));
    }
  },
  checkholiday : function(date) {
    let hd = libByName("Holidays");
    let hds = hd.entries();
    let hdent = null;
    let gdate = my.gdate(my.date(date))
    
    for(let i=0; i<hds.length; i++) {
      if(my.gdate(my.date(hds[i].field("Date")))==gdate){
        hdent = hds[i];
        break;
      }
    }
    return hdent;
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
