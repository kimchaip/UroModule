// Common
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
}​;​
function mergelastadmit(thislib)  {
  let mid = getmergeid(e) ;

  if (mid.length == 0) {
    let lao = lastadmit(my.dateminus(e.field("VisitDate"), 1));
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

      let mpos = posinmerge()​;
      let k = mpos["pos"];
      mid = mpos["mar"];
      changeother(k, mid, "MergeID")​;
      if (e.field("DischargeDate") != null)​
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
function posinmerge()​{
  let mid = getmergeid(e) ;
  let o = new Object()​;
  o["found"]​= false;

  if (mid.length>0) {
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
        o["found"] = true ;
        o["pos"]​ = i ;
        o["mar"] ​= mid;
        break;
      }
    }
  }​
  return o;
}​ ;
function mergeeffect()  {
  let mpos = posinmerge()​;

  if(mpos["found"]​ == true ) { //parent or child
    if(my.ndate(old.vsdate) != my.ndate(e.field("VisitDate"))) {
      changeother(mpos["pos"]​, mpos["mar"]​, "VisitDate" ) ;
    }
    if(old.ward != e.field("Ward") ) {
      changeother(mpos["pos"], mpos["mar"], "Ward" ) ;
    } 
    if(my.ndate(old.dcdate) != my.ndate(e.field("DischargeDate")) ) {
      changeother(mpos["pos"], mpos["mar"], "DischargeDate" ) ;
    }
    if(old.vstype != e.field("VisitType") ) {
      e.set("VisitType", old.vstype);
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
} ;​
function createnew (libto, libfrom)​ {
  let libname = "", field1 = "";
  let min = 0,​ defau = "" ;
  if (libto == "uro" &​& libfrom == "uro") {
    libname = "UroBase";
    field1 = "Date" ;
    min = 1;
    defau = "<Default>";
  }​
  else if (libto == "consult" &​& libfrom == "uro")​ {​
    libname = "Consult";
    field1 = "ConsultDate" ;
    min = 0;
    defau = "<Default>";
  }​
  else if (libto == "uro" &​& libfrom == "consult" ) {​
    libname = "UroBase";
    field1 = "Date" ;
    min = 0;
    defau = "Pending";
  }​
  else if (libto == "consult" &​& libfrom == "consult") {​
    libname = "Consult";
    field1 = "ConsultDate" ;
    min = 1;
    defau = "Pending";
  }​

  if (links.length > 0) {
    let lib = libByName(libname)​;
    let pt = libByName("Patient")​;
    let ptent = pt.findById(links[0].id);
    let entlinks = lib.linksTo(ptent);
    let found = false;

    if (entlinks.length > min) {
      for (let i in entlinks) {
        if (entlinks[i].field(field1).getTime() == my.ndate(e.field("AppointDate")))​ {
          found = true;
          break ;
        }
      }
    } 

    if (!found) {
      let ent​ = new Object();
      ent​[field1] = my.date(e.field("AppointDate")​);
      ent​["Patient"]​ = links[0].title;
      ent​["PastHx"] = e.field("PastHx")​;
      ent​["Inv"] = e.field("Inv").join()​;
      ent​["InvResult"] = e.field("InvResult");
      ent​["Dx"] = e.field("Dx")​;

      if (libto == "uro" &​& libfrom == "uro") {
        ent​["Op"] = e.field("Op")​;
        ent​["ORType"] = e.field("ORType")​;
        ent​["VisitType"] = e.field("VisitType")​;
        if (e.field("VisitType")​== "Admit")​
          ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
        else  
          ent​["VisitDate"] = my.date(e.field("AppointDate"))​;
          ent​["RecordDate"] = today​;
      }​
      else if (libto == "consult" &​& libfrom == "uro") {
        ent​["Ward"] = e.field("Ward")​;
        ent​["VisitType"] = "OPD";
        ent​["VisitDate"] = my.date(e.field("AppointDate")​);
      }​
      else if (libto == "uro" &​& libfrom == "consult" ) {​
        ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
        ent​["RecordDate"] = today​;
        ent["Photo"] = e.field("Photo").join()​;
      }​
      else if (libto == "consult" &​& libfrom == "consult") {​
        ent["VisitType"]​ = "OPD" ;
        ent["VisitDate"]​ = my.date(e.field("AppointDate"));
      }​

      lib.create(ent);
      message("successfully created new Entry") ;
    }​
  }​
  e.set("EntryMx", defau) ;
}​;​
// Consult​
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
}​;​
