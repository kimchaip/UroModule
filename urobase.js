var old = {
  a : [],​
  getstart : function ()​ {
    this.a = e.field("Previous").split(",");
  },
  store : function ()​ {
    this.a = [] ;
    this.a.push(e.field("Date"));	        //0
    this.a.push(links[0].title);             //​1
    this.a.push(e.field("ORType"));          //​2
    this.a.push(e.field("Que"));             //​3
    this.a.push(e.field("VisitType"));       //​4
    this.a.push(e.field("Ward"));            //​5
    this.a.push(e.field("VisitDate"));       //​6
    this.a.push(e.field("DischargeDate"));   //​7
    this.a.push(e.field("EntryMx"));         //​8
    this.a.push(e.field("AppointDate"));     //​9
    this.a.push(e.field("Status"));         //​10 
    this.a.push(e.field("DJstent"));        //​11
    this.a.push(e.field("OpExtra"));        //​12
    this.a.push(e.field("Bonus"));          //​13
    this.a.push(e.field("RecordDate"));     //​14
    this.a.push(e.field("Dx"));             //​15
    this.a.push(e.field("Op"));             //​16
    this.a.push(e.field("OpResult"));       //​17
  
    e.set("Previous", this.a.join());
  }, 
  get opdate() {
    if (this.a[0]!​="" )​ return new Date(this.a[0])​;
    else return null;
  }​,
  get patient() {
    return this.a[1] ;
  }​, 
  get optype() {
    return this.a[2] ;
  }​,​
  get que() {
    return this.a[3] ;
  }​,
  get vstype() {
    return this.a[4] ;
  }​,
  get ward() {
    return this.a[5] ;
  }​,
  get vsdate() {
    if (this.a[6]!​="" )​ return new Date(this.a[6])​ ;
    else return null;​
  }​,
  get dcdate() {
    if (this.a[7]!​="" )​ return new Date(this.a[7])​ ;
    else return null;​
  }​,
  get emx() {
    return this.a[8] ;
  }​,
  get apdate() {
    if (this.a[9]!​="" )​ return new Date(this.a[9])​ ;
    else return null;​
  }​,
  get status() {
    return this.a[10] ;
  }​,
  get dj() {
    return this.a[11] ;
  }​,
  get opext() {
    return this.a[12] ;
  }​,
  get bonus() {
    return this.a[13] ;
  }, 
  get rcdate() {
    if (this.a[14]!​="" )​ return new Date(this.a[14])​ ;
    else return null;​
  }​,
  get dx() {
    return this.a[15] ;
  }​,
  get op() {
    return this.a[16] ;
  }​,
  get result() {
    return this.a[17] ;
  }​
} ;
function setnewdate(trig) {
  let t = false ;
  if (trig=="update")​ 
    t = false;
  else 
    t = true;

  //---if Date change : set new date
  if (t || my.ndate(old.opdate)!=my.ndate(​e.field("Date"))​) {
    e.set("Date", my.date(e.field("Date")));
  }​
  if (t || my.ndate(​old.vsdate)!=my.ndate(​e.field("VisitDate"))) {
    e.set("VisitDate", my.date(e.field("VisitDate")));
  }​
  if (t || my.ndate(​old.dcdate)!=my.ndate(​e.field("DischargeDate"))​) {
    e.set("DischargeDate", my.date(e.field("DischargeDate")));
  }​
  if (t || my.ndate(​old.apdate)!=my.ndate(​e.field("AppointDate"))) {
    e.set("AppointDate", my.date(e.field("AppointDate")));
  }​
  if (t || my.ndate(​old.rcdate)!=my.ndate(​e.field("RecordDate"))​) {
    e.set("RecordDate", my.date(e.field("RecordDate")));
  }​
} ;
function setvisitdate()​ {
  if (e.field("EntryMx")​== "<Default>" &​& e.field("VisitDate") == null) {
    if (e.field("ORType") == "GA") {
      if (e.field("VisitType") == "OPD")​
        e.set("VisitType", "Admit")​;
      e.set("VisitDate", e.field("Date")-86400000);
    }​
    else ​{
      e.set("VisitDate", e.field("Date"))​;
    }​
  }
}​;
function lastDJStamp(date)  {
  let pt = libByName("Patient") ;
  let or = libByName("UroBase") ;
  let ptent = pt.findById(links[0].id) ;
  let orlinks = or.linksTo(ptent) ;
  let o = null ;
  if (orlinks.length>0) {
    let last = null, r = null;
    for (let i in orlinks) {
      if (orlinks[i].field("DJstent") != "<none>"​ && orlinks[i].field("Date") > last && orlinks[i].field("Date").getTime() <= date.getTime()) {
        last = orlinks[i].field("Date");
        r=i;
      }
    }
    if (last != null &​& orlinks[i].field("DJstent") != "off DJ") {
      o = orlinks[r] ;
    }
  }
  return o ;
};​
function setDJstent() {
  if (links[0].field("DJStamp") == null) {
    if(e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")​
      e.set("DJstent", "<none>")​;
  }​
  else if (e.field("Date") > links[0].field("DJStamp") && my.ndate(e.field("Date")) <= ntoday) { // DJStamp not null 
    if (e.field("DJstent") == "on DJ")​
       e.set("DJstent", "<none>")​ ;
  }​
  else if (e.field("Date") < links[0].field("DJStamp"))​  {// the past
    if (old.dj != null)​
      e.set("DJstent", old.dj) ;
  }​
  else if (my.ndate(e.field("Date")) == my.ndate(links[0].field("DJStamp")))​ {// entry update DJStamp
    let d = lastDJStamp(my.dateminus(e.field("Date"), 1)) ;
    if (d == null) { // off -​> none, on
      if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ") 
        e.set("DJstent" , "<none>") ;
    }
    else { // on,change -> none,change,off
      if (e.field("DJstent") == "on DJ") 
        e.set("DJstent", "<none>") ;
    } 
  }​
}​;
function updateDJStamp() {
  let d = lastDJStamp(today) ;

  if (d==null) { // not found
    links[0].set("DJStamp",null);
    links[0].set("DJstent","");
  } 
  else { // found
    links[0].set("DJStamp", d.field("Date")) ;
    links[0].set("DJstent","on DJ");
  }
};
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
  if ((links[0].field("WardStamp")​==null || e.field("VisitDate")>=links[0].field("WardStamp")​) && 
(links[0].field("Status")​=="Still"||links[0].field("Status")​=="Active")​​ &​&
e.field("Status") != "Not")​ {
    if (e.field("VisitType")​=="Admit" && my.ndate(e.field("VisitDate"))<=ntoday && (e.field("DischargeDate")​==null || my.ndate(e.field("DischargeDate"))​>ntoday) ) {//Admit
      links[0].set("Status" ,"Active");
      links[0].set("Ward",e.field("Ward"));
      links[0].set("WardStamp", e.field("VisitDate")​)​;
      let str = "" ;
      if (e.field("Dx")!="")​
        str = e.field("Dx");
      if (e.field("Op")!="")​ {
        if (str!="" )
          str += " -​> " ;
        str += e.field("Op");
      }​
       
      links[0].set("Descript", str);
    }
    else if (e.field("VisitType")​=="Admit" && my.ndate(e.field("VisitDate"))<=ntoday && my.ndate(e.field("DischargeDate"))​<=ntoday​​ ) { // D/C
      links[0].set("Status" ,"Still");
      links[0].set("Ward", "");
      let str = "" ;
      if (e.field("Dx")!="")​
        str = e.field("Dx");
      if (e.field("Op")!="")​ {
        if (str!="")
          str += " -​> " ;
        str += e.field("Op");
      }​
      if (e.field("OpResult")!="")​ {
        if (str!="")
          str += " -​> " ;
        str += e.field("OpResult");
      }​
       
      links[0].set("Descript", str);
    }​
    else if ((m==null)​ || (m.field("DischargeDate") != null && my.ndate(m.field("DischargeDate"))​<=ntoday)​ ) {//D/C of last visit: still
      links[0].set("Status" ,"Still");
      links[0].set("Ward", "");
    }​
  }​
  else if (e.field("Status") == "Not")​ {
    links[0].set("Status" ,"Still");
    links[0].set("Ward", "");
    links[0].set("WardStamp", e.field("VisitDate"));
    let str = "" ;
    if (e.field("Dx")!="")​
      str = e.field("Dx");
    if (e.field("Op")!="")​ {
      if (str!="")
        str += " -​> " ;
      str += e.field("Op");
    }​
    if (e.field("OpResult")!="")​ {
      if (str!="")
        str += " -​> " ;
      str += e.field("OpResult");
    }​
       
    links[0].set("Descript", str);
  }​
 }​
}​;
