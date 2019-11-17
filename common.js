var e = entry()​;
var links = e.field("Patient")​;

var my = {
  d : null, 
  nd : 0,
  date : function (value)  {
    if (value != null) {
      this.d = new Date(value.getFullYear(), value.getMonth(),value.getDate(), 7) ;
      return this.d;
    }
    else {
      this.d = null;
      return this.d;
    }
  },
  dateadd : function (value, add)  {
    if (value != null) {
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
    if (value != null) {
      this.d = new Date(value.getTime() -​ (minus*86400000))​;
      this.d = this.date(this.d) ;
      return this.d;
    }
    else {
      this.d = null;
      return this.d;
    }
  }, 
  ndate : function (value) {
    if (value != null) {
      this.d = this.date(value);
      this.nd = this.d.getTime()​;
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.nd;
    }​
  }, 
  ndateadd : function (value, add)  {
    if (value != null) {
      this.d = this.dateadd(value,add);
      this.nd = this.d.getTime()​;
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.nd;
    }
  },
  ndateminus : function (value, minus)  {
    if (value != null) {
      this.d = this.dateminus(value,minus);
      this.nd = this.d.getTime();
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.nd;
    }
  }
}​;​
var ntoday = my.ndate(new Date()​);​
var today = my.date(new Date())​;
