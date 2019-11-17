var e = entry();
var links = e.field("Patient")​;
var all = lib().entries();

var old = {
  a : [],​
  getstart : function ()​ {
    a = e.field("Previous").split(",");
  }, 
  get opdate() {
    if (a[0]!​="" )​ return new Date(a[0])​;
    else return null;
  }​,
  get patient() {
    return a[1] ;
  }​, 
  get optype() {
    return a[2] ;
  }​,​
  get que() {
    return a[3] ;
  }​,
  get vstype() {
    return a[4] ;
  }​,
  get ward() {
    return a[5] ;
  }​,
  get vsdate() {
    if (a[6]!​="" )​ return new Date(a[6])​ ;
    else return null;​
  }​,
  get dcdate() {
    if (a[7]!​="" )​ return new Date(a[7])​ ;
    else return null;​
  }​,
  get emx() {
    return a[8] ;
  }​,
  get apdate() {
    if (a[9]!​="" )​ return new Date(a[9])​ ;
    else return null;​
  }​,
  get status() {
    return a[10] ;
  }​,
  get dj() {
    return a[11] ;
  }​,
  get opext() {
    return a[12] ;
  }​,
  get bonus() {
    return a[13] ;
  }, 
  get rcdate() {
    if (a[14]!​="" )​ return new Date(a[14])​ ;
    else return null;​
  }​,
  get dx() {
    return a[15] ;
  }​,
  get op() {
    return a[16] ;
  }​,
  get result() {
    return a[17] ;
  }​
} ;​
var my = {
  date : function (value)  {
    if (value != null) {
      return new Date(value.getFullYear(), value.getMonth(),value.getDate(), 7) ;
    }
 
   else {
      return null;
    }
  },
 
 dateadd : function (value, add)  {

    if (value != null) {
      let d = new Date(value.getTime() + (add*86400000))​;
      return new Date(d.getFullYear(),  d.getMonth(), d.getDate(), 7) ;
    }
    else {
      return null;
    }
 
 },
  dateminus : function (value, minus)  {

    if (value != null) {
      let d = new Date(value.getTime() -​ (minus*86400000))​;

      return new Date(d.getFullYear(),  d.getMonth(), d.getDate(), 7) ;
    }
    else {
      return null;

    }
  }, 
  ndate : function (value) {
    if (value != null) {
      let d = this.date(value);
      return d.getTime()​ ;

    }
 
   else {
      return null;
    }​
  }, 
 
 ndateadd : function (value, add)  {

    if (value != null) {
      let d = this.dateadd(value,add) ;
      return d.getTime()​ ;
    }
    else {
      return null;
    }
 
 },
  ndateminus : function (value, minus)  {

    if (value != null) {
      let d = this.dateminus(value,minus) 

      return d.getTime() ;
    }
    else {
      return null;

    }
  }
}​;​
function setnewdate(lib, trig) {
  let t = false, l = false, f = ""​;
  if (trig=="update")​ t = false;
  else t = true;
  if (lib=="uro")​ {
    l = true;
    f = "Date" ;
  }​
  else {
    l = false;
    f = "ConsultDate" ;
  }​

  //---if Date change : set new date
  if (t || my.ndate(old.opdate)!=my.ndate(​e.field(f))​) {
    e.set(f, my.date(e.field(f)));
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
  if (l &​& (t || my.ndate(​old.rcdate)!=my.ndate(​e.field("RecordDate")))​) {
    e.set("RecordDate", my.date(e.field("RecordDate")));
  }​
} ;
function setvisitdate(lib)​ {
  let value1="", str1="" , str2=""​, 
      field1=""​;
    if (lib=="uro")​{
      value1 = "<Default>" ;
      str1 = e.field("ORType") == "GA" ;
      str2 = e.field("VisitType") == "OPD" ;
      field1 = "Date";
    }​
    else {
      value1 = "Pending" ;
      str1 = e.field("VisitType") == "Admit";
      str2 = false ;
      field1 = "ConsultDate" ;
    }​

    if (e.field("EntryMx")​== value1 &​& e.field("VisitDate") == null) {
      if (str1) {
        if (str2)​
          e.set("VisitType", "Admit")​;
        e.set("VisitDate", my.dateminus(e.field(field1),1));
      }​
      else ​{
        e.set("VisitDate", my.date(e.field(field1)))​;
      }​
    }
}​;
function lastadmit(date)  {
  let pt = libByName("Patient") ;
  let or = libByName("UroBase") ;
  let cs = libByName("Consult") ;
  let ptent = pt.findById(links[0].id) ;
  let orlinks = or.linksTo(ptent) ;
  let cslinks = cs.linksTo(ptent) ;
  let o = new Object()​ ;
  if (orlinks.length+cslinks.length>0) {
    let last = null, s=null, r=null;
    for (let i in orlinks) {
      if (orlinks[i].field("VisitType")=="Admit" && orlinks[i].field("VisitDate") > last && my.ndate(​orlinks[i].field("VisitDate"))​<= my.ndate(​date)​) {
        last = orlinks[i].field("VisitDate");
        r=i;
      }
    }
    for (let i in cslinks) {
      if (cslinks[i].field("VisitType")=="Admit" && cslinks[i].field("VisitDate") > last && my.ndate(​cslinks[i].field("VisitDate"))​<= my.ndate(​date) ) {
        last = cslinks[i].field("VisitDate");
        s=i;
      }
    }
    if (last != null)
      if (s==null) {
        o["lib"] = "or" ;
        o["ent"] = orlinks[r] ;
      }

      else {
        o["lib"] = "cs" ;
        o["ent"] = cslinks[s] ;
      }
  }
  return o ;
};​
function getmergeid(ent) {
  let raw = [], result = []​;
  if (ent.field("MergeID") != "")​ {
    raw = ent.field("MergeID").split(",") ;
  }​
  if (raw.length>0)​{
    for(let i=0; i<raw.length;) {
      let o = new Object()​ ;
      o["lib"] = raw[i++] ;
      o["id"] = raw[i++] ;
      result.push(o) ;
    }​
  }
  return result;
}​;
function mergelastadmit(thislib)  {
  let mid = getmergeid(e) ;

  if (mid.length == 0) {
    let lao = lastadmit(my.dateminus(e.field("VisitDate"),1));
    let l = lao["lib"], m = lao["ent"] ;

    if(m != null) {
      let str = "" ;
      e.set("VisitDate", m.field("VisitDate"))​ ;
      e.set("Ward", m.field("Ward")) ;
      if (m.field("MergeID") == "") {
        str = l + "," + m.id + "," + thislib + "," + e.id;
      }
      else {
        str = m.field("MergeID") + "," + thislib + "," + e.id;

      }
      m.set("Merge", true)​;
      e.set("MergeID", str) ;
      mid = getmergeid(e)​;
      let k = mid.length-1;
      changeother(k, mid, "MergeID")​;
      if (e.field("DischargeDate") !=null)​
        changeother(k, mid, "DischargeDate")​;
      return true;
    }
    else {
      message("not found last admit, can't merge");
      e.set("Merge", false) ;
      return false;
    }
  }
  return false;
} ;​
function mlacancel() {
  let mid = getmergeid(e)​;
  if(mid.length>0)​{
    for (let i in mid) {

      let lib =null, id="" ;

      if (mid[i]["lib"]=="or") {
        lib = libByName("UroBase")​ ;
        id = mid[i]["id"] ;

      }

      else if (mid[i]["lib"]=="cs" ) {
        lib = libByName("Consult")​ ;
        id = mid[i]["id"] ;

      }

      if (lib != null)​ {
        let toent = libByName(lib).findById(id) ;
        if (toent != null) {
          toent.set("MergeID" , "") ;
          if(i!=0)​ toent.set("VisitDate" , null)​;
        }​

      }
    }​
  } 
} ;

function mergeeffect()  {
  let mid = getmergeid(e) ;

  if (mid.length>0) {
    let found = false, k = 0;
    let thislib = lib().title ;
    let thisid = e.id ;

    for(let i in mid) {
      let lib ="", id="" ;
      if (mid[i]​["lib"]=="or") {
        lib = "UroBase" ;
        id = mid[i]["id"] ;
      }
      else if (mid[i]​["lib"]=="cs") {
        lib = "Consult" ;
        id = mid[i]["id"] ;
      }

      if ((lib==thislib)​&&(id==thisid)​) {
        found = true ;
        k = i ;
        break;
      }
    }

    if(found == true ) { //parent or child
      if(my.ndate(old.vsdate) != my.ndate(e.field("VisitDate"))) {
        changeother(k, mid, "VisitDate" ) ;
      }
      if(old.ward != e.field("Ward") ) {
        changeother(k, mid, "Ward" ) ;
      } 
      if(my.ndate(old.dcdate) != my.ndate(e.field("DischargeDate")) ) {
        changeother(k, mid, "DischargeDate" ) ;
      }
      if(old.vstype != e.field("VisitType") ) {
        e.set("VisitType", old.vstype);
      } 
    }
  } 
} ;​
function changeother(pos, mla, field) {
  for (let i in mla) {
    if(i != pos) {
      let lib ="", id="" ;
      if (mla[i]["lib"] == "or") {

        lib = "UroBase" ;

        id = mla[i]["id"] ;
      }
      else if (mla[i]["lib"] == "cs") {
        lib = "Consult" ;
        id = mla[i]["id"] ;
      }
      let toent = libByName(lib).findById(id) ;
      if (toent != null) {
        toent.set(field, e.field(field)) ;
        
      }
    } 
  } 
} ;​
function lastDJStamp(date)  {
  let pt = libByName("Patient") ;
  let or = libByName("UroBase") ;
  let ptent = pt.findById(links[0].id) ;
  let orlinks = or.linksTo(ptent) ;
  let o = null ;
  if (orlinks.length>0) {
    let last = null, r=null;
    for (let i in orlinks) {
      if ((orlinks[i].field("DJstent")=="on DJ" || orlinks[i].field("DJstent")=="change DJ" || orlinks[i].field("DJstent")=="off DJ")​ && orlinks[i].field("Date") > last && orlinks[i].field("Date").getTime() <= date.getTime()) {
        last = orlinks[i].field("Date");
        r=i;
      }
    }
    if (last != null &​& orlinks[i].field("DJstent")!="off DJ") {
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
  else if (e.field("Date") > links[0].field("DJStamp") && e.field("Date") <= today) { // DJStamp not null 
    if (e.field("DJstent") == "on DJ")​
       e.set("DJstent", "<none>")​ ;
  }​
  else if (e.field("Date") < links[0].field("DJStamp"))​  {// the past
    e.set("DJstent", old.dj) ;
  }​
  else if (e.field("Date") == links[0].field("DJStamp"))​ {// entry update DJStamp
    let d = lastDJStamp(my.dateminus(e.field("Date"), 1)) ;
    if (d == null) { // off -​> none, on
	     if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ") 
	       e.set("DJstent" , "<none>") ;
	   }
	   else { // on,change -> none,change,off
	     if(e.field("DJstent") == "on DJ") 
	       e.set("DJstent", "<none>") ;
	   } 
  }​
}​;
var today = my.date(new Date())​;​

var ntoday = my.ndate(new Date()​);​
