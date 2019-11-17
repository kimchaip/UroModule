var old = {
  a : [], 
  getstart : function ()​ {
    this.a= e.field("Previous").split(",");
  }, 
  store : function ()​ {
    this.a= [];
    this.a.push(e.field("ConsultDate"));	    //0
    this.a.push(e.field("Patient")[0].title);//​1
    this.a.push(e.field("VisitType"));       //​2
    this.a.push(e.field("Ward"));            //​3
    this.a.push(e.field("VisitDate"));       //​4
    this.a.push(e.field("DischargeDate"));   //​5
    this.a.push(e.field("EntryMx"));         //​6
    this.a.push(e.field("AppointDate"));     //​7
    this.a.push(e.field("Dx"));              //​8
    this.a.push(e.field("Rx"));              //​9
    this.a.push(e.field("Note"));           //​10
  
    e.set("Previous", this.a.join());
  }, 
  get csdate() {
    if (this.a[0]!​="" )​ return new Date(this.a[0])​;
    else return null;
  }​,
  get patient() {
    return this.a[1] ;
  }​, 
  get vstype() {
    return this.a[2] ;
  }​,​
  get ward() {
    return this.a[3] ;
  }​,
  get vsdate() {
    if (this.a[4]!​="" )​ return new Date(this.a[4])​ ;
    else return null;​
  }​,
  get dcdate() {
    if (this.a[5]!​="" )​ return new Date(this.a[5])​ ;
    else return null;​
  }​,
  get emx() {
    return this.a[6] ;
  }​,
  get apdate() {
    if (this.a[7]!​="" )​ return new Date(this.a[7])​ ;
    else return null;​
  }​,
  get dx() {
    return this.a[8] ;
  }​,
  get rx() {
    return this.a[9] ;
  }​,
  get note() {
    return this.a[10] ;
  }​
} ;
function setnewdate(trig) {
  let t = false;
  if (trig=="update")​ 
    t = false;
  else 
    t = true;

  //---if Date change : set new date
  if (t || my.ndate(old.csdate)!=my.ndate(​e.field("ConsultDate"))​​) {
    e.set("ConsultDate", my.date(e.field("ConsultDate")));
  }​
  if (t || my.ndate(​old.vsdate)!=my.ndate(​e.field("VisitDate"))​) {
    e.set("VisitDate", my.date(e.field("VisitDate")));
  }​
  if (t || my.ndate(​old.dcdate)!=my.ndate(​e.field("DischargeDate"))​) {
    e.set("DischargeDate", my.date(e.field("DischargeDate")));
  }​
  if (t || my.ndate(​old.apdate)!=my.ndate(​e.field("AppointDate"))​) {
    e.set("AppointDate", my.date(e.field("AppointDate")));
  }​
} ;​
function setvisitdate()​ {
    if (e.field("EntryMx")​ == "Pending" &​& e.field("VisitDate") == null) {
      if (e.field("VisitType") == "Admit") {
        e.set("VisitDate", e.field("ConsultDate")-86400000);
      }​
      else ​{
        e.set("VisitDate", e.field("ConsultDate")​)​;
      }​
    }
}​;​
function setptstatus()​ {
  //--update WardStamp
  let m = lastadmit(today)​["ent"];
  if (m != null)​{
    links[0].set("WardStamp", m.field("VisitDate")​);
  }
  else {
    links[0].set("WardStamp",null);
  }​

  //--set pt.status, pt.ward, wardStamp and Description
  if ((links[0].field("WardStamp")​ == null || my.ndate(e.field("VisitDate")) >= my.ndate(links[0].field("WardStamp")​)) && 
(links[0].field("Status")​ == "Still" || links[0].field("Status") ​== "Active")​​ &​&
e.field("EntryMx") != "Not")​ {
    if (e.field("VisitType") ​== "Admit" && my.ndate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.ndate(e.field("DischargeDate")) ​> ntoday) ) {//Admit
      links[0].set("Status" ,"Active");
      links[0].set("Ward", e.field("Ward"));
      links[0].set("WardStamp", e.field("VisitDate")​)​;
      let str = "" ;
      if (e.field("Dx")!="")​
        str = e.field("Dx");
      if (e.field("Rx")!="")​ {
        if (str!="" )
          str += " -​> " ;
        str += e.field("Rx");
      }​
       
      links[0].set("Descript", str);
    }
    else if (e.field("VisitType")​ == "Admit" && my.ndate(e.field("VisitDate")) <= ntoday && my.ndate(e.field("DischargeDate"))​ <= ntoday​​ ) { // D/C
      links[0].set("Status" ,"Still");
      links[0].set("Ward", "");
      let str = "" ;
      if (e.field("Dx")!="")​
        str = e.field("Dx");
      if (e.field("Rx")!="")​ {
        if (str!="")
          str += " -​> " ;
        str += e.field("Rx");
      }​
      if (e.field(note)!="")​ {
        if (str!="")
          str += " -​> " ;
        str += e.field("Note");
      }​
       
      links[0].set("Descript", str);
    }​
    else if ((m == null)​ || (m.field("DischargeDate") != null && my.ndate(m.field("DischargeDate"))​<=ntoday)​ ) {//D/C of last visit: still
      links[0].set("Status" ,"Still");
      links[0].set("Ward", "");
    }​
  }​
  else if (e.field("EntryMx") == "Not")​ {
    links[0].set("Status" ,"Still");
    links[0].set("Ward", "");
    links[0].set("WardStamp", e.field("VisitDate"));
    let str = "" ;
    if (e.field("Dx")!="")​
      str = e.field("Dx");
    if (e.field("Rx")!="")​ {
      if (str!="")
        str += " -​> " ;
      str += e.field("Rx");
    }​
    if (e.field("Note")!="")​ {
      if (str!="")
        str += " -​> " ;
      str += e.field("Note");
    }​
       
    links[0].set("Descript", str);
  }​
 }​
}​;​
