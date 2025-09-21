var my = {
  d : null, 
  nd : 0,
  isDate : function(value) {
    return value instanceof Date && !isNaN(value)
  },
  isDateStr : function(value) {
    return typeof value == "string" && new Date(date) instanceof Date
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
      this.d = new Date(value.getTime() + (add*86400000))​;
    }
    else {
      this.d = null;
    }
    return this.d;
  },
  dateminus : function (value, minus)  {
    value = this.date(value);
    if (value) {
      this.d = new Date(value.getTime() -​ (minus*86400000))​;
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
  }
}​;

var today = my.date(new Date())​;
var ntoday = my.gdate(today);​
var hour = new Date().getHours();
