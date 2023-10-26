var my = {
  d : null, 
  nd : 0,
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
      else if (isNaN(value) && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        this.d = new Date(value);
      }
      else if(!isNaN(value)){
        this.d = new Date(value);
      }
      else {
        this.d = null;
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
    let wdt = "" ;
    if (wd==0)​ wdt = "Sun" ;
    else if (wd==1)​ wdt = "Mon" ;
    else if (wd==2)​ wdt = "Tue" ;
    else if (wd==3)​ wdt = "Wed" ;
    else if (wd==4)​ wdt = "Thu" ;
    else if (wd==5)​ wdt = "Fri" ;
    else if (wd==6)​ wdt = "Sat" ;
    return wdt;
  }
}​;

var today = my.date(new Date())​;
var ntoday = my.gdate(today);​
var hour = new Date().getHours();
