
var more = 1;
var less = -1;
var equal = 0;
var my = {
  d : null, 
  nd : 0,
  isDate : function(value) {
    return value instanceof Date && !isNaN(value)
  },
  isDateStr : function(value) {
    return typeof value == "string" && new Date(value) instanceof Date
  },
  dateIsValid : function(value) {
    return value instanceof Date && !isNaN(value) && value.getTime()>86400000;
  },
  timeIsValid : function(value) {
    return value instanceof Date && !isNaN(value) && value.getTime()<86400000;
  },
  date : function (value)  {
    if (value) {
      if (this.dateIsValid(value)) {
        this.d = value;
      }  
      else {
        this.d = new Date(value);
      }
    }
    else {
      this.d = null;
    }
    if(this.d && this.d.getTime()>86400000)
        this.d = new Date(this.d.getFullYear(), this.d.getMonth(),this.d.getDate(), 7) ;
    return this.d;
  },
  dateadd : function (value, add)  {
    value = this.date(value);
    if (value) {
      this.d = new Date(value.getFullYear(), value.getMonth(), value.getDate() + add, value.getHours())​;
    }
    else {
      this.d = null;
    }
    return this.d;
  },
  gdate : function (value)  {
    if (value) {
      this.nd = value.getTime()​;
    }
    else {
      this.nd = 0;
    }
    return this.nd;
  }, 
  gday : function (value)  {
    if (value) {
      return value.getDay() ;
    }
    else {
      return 0;
    }
  },
  wkname : function (wd) {
    let wname = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    if(wd>=0 && wd<7) {
      return wname[wd];
    }
    else {
      return "";
    }
  },
  monthname : function(mnum) {
    let mname = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    if(mnum>=0 && mnum<12) {
      return mname[mnum];
    }
    else {
      return "";
    }
  },
  compDate : function(date1, date2) {
    if (this.isDate(date1) && this.isDate(date2)) {
      if (date1.getFullYear() < date2.getFullYear())
        return less;
      else if (date1.getFullYear() > date2.getFullYear()) 
        return more;
      else if (date1.getMonth() < date2.getMonth())
        return less;
      else if (date1.getMonth() > date2.getMonth())
        return more;
      else if (date1.getDate() < date2.getDate())
        return less;
      else if (date1.getDate() > date2.getDate())
        return more;
      else
        return equal;
    }
    return undefined;
  },
  function diffDate(d1, d2) {
    const ms = d2 > d1 ? d2 - d1 : d1 - d2;                     // difference in milliseconds
    const sec = ms / 1000;
    const min = sec / 60;
    const hr  = min / 60;
    const day = hr / 24;
  
    return { ms, sec, min, hr, day };
  }
}​;

var today = my.date(new Date())​;
var ntoday = my.gdate(today);​
var hour = new Date().getHours();
