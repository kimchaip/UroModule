var my = {
  d : null, 
  nd : 0,
  date : function (value)  {
    if (value) {
      value = new Date(value);
      this.d = new Date(value.getFullYear(), value.getMonth(),value.getDate(), 7) ;
      return this.d;
    }
    else {
      this.d = null;
      return this.d;
    }
  },
  dateadd : function (value, add)  {
    if (value) {
      this.d = new Date(value.getTime() + (add*86400000))​;
      this.d = this.date(this.d) ;
      return this.d;
    }
    else {
      this.d = null;
      return this.d;
    }
  },
  dateminus : function (value, minus)  {
    if (value) {
      this.d = new Date(value.getTime() -​ (minus*86400000))​;
      this.d = this.date(this.d) ;
      return this.d;
    }
    else {
      this.d = null;
      return this.d;
    }
  }, 
  gdate : function (value)  {
    if (value) {
      this.nd = value.getTime()​;
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.nd;
    }
  }, 
  gday : function (value)  {
    if (value) {
      this.nd = value.getDay() ;
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.d;
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
}​;​

var today = my.date(new Date())​;
var ntoday = my.gdate(today);​
var hour = new Date().getHour();
