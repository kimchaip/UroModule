//Common
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
  gdate : function (value)  {
    if (value != null) {
      this.nd = value.getTime()​;
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.nd;
    }
  }
}​;​
var today = my.date(new Date())​;
var ntoday = my.gdate(today);​

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
      if (orlinks[i].field("VisitType")=="Admit" && orlinks[i].field("VisitDate") > last && my.gdate(​orlinks[i].field("VisitDate"))​ <= my.gdate(​date)​) {
        last = orlinks[i].field("VisitDate");
        r=i;
      }
    }
    for (let i in cslinks) {
      if (cslinks[i].field("VisitType")=="Admit" && cslinks[i].field("VisitDate") > last && my.gdate(​cslinks[i].field("VisitDate"))​ <= my.gdate(​date) ) {
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
    if(my.gdate(old.vsdate) != my.gdate(e.field("VisitDate"))) {
      changeother(mpos["pos"]​, mpos["mar"]​, "VisitDate" ) ;
    }
    if(old.ward != e.field("Ward") ) {
      changeother(mpos["pos"], mpos["mar"], "Ward" ) ;
    } 
    if(my.gdate(old.dcdate) != my.gdate(e.field("DischargeDate")) ) {
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
      let lib ="", id=0 ;
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

      let lib =null, id=0 ;

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
          toent.set("Merge", false)​;
          if(i!=0 &​& mid[i]["lib"]=="or"​)​ toent.set("VisitDate" , my.dateminus(toent.field("Date"), 1))​;
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
        if (my.gdate(entlinks[i].field(field1))​ == my.gdate(e.field("AppointDate")))​ {
          found = true;
          break ;
        }
      }
    } 

    if (!found) {
      let ent​ = new Object();
      ent​[field1] = my.date(e.field("AppointDate")​);
      ent​["PastHx"] = e.field("PastHx")​;
      ent​["Inv"] = e.field("Inv").join()​;
      ent​["InvResult"] = e.field("InvResult");
      ent​["Dx"] = e.field("Dx")​;

      if (libto == "uro" &​& libfrom == "uro") {
        ent​["Op"] = e.field("Operation")​;
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
	ent​["Op"] = e.field("Operation")​;
        ent["Photo"] = e.field("Photo").join()​;
      }​
      else if (libto == "consult" &​& libfrom == "consult") {​
        ent["VisitType"]​ = "OPD" ;
        ent["VisitDate"]​ = my.date(e.field("AppointDate"));
      }​

      lib.create(ent);
      let last = lib.entries()[0];
      last.link("Patient",links[0]);
      alert(last, libto) ;
      message("successfully created new Entry") ;
    }​
  }​
  e.set("EntryMx", defau) ;
}​;​
function alert(ent, libcode)​ {
  let linke = ent.field("Patient");
  if(libcode=="uro") {
    if(ent.field("Status")=="Not") {
      ent.set("Color", "#5B5B5B")​;
    } 
    else if(ent.field("Status")=="Plan") {
      if (linke[0].field("Status")=="Active" || (ent.field("VisitType")=="OPD" &​& my.gdate(ent.field("VisitDate"))​== ntoday)​)​{
        if (ent.field("VisitType")=="OPD") {
          ent.set("Color", "#A7FF87"); 
        } 
        else { // Admit
          ent.set("Color",​ "#5CD3FF"); 
        } 
      } 
      else { // no Active
        if (ent.field("VisitType")=="OPD")​{
          ent.set("Color", "#ABC39A");
        }​
        else { // Admit
          ent.set("Color", "#66B2FF");
        } 
      } 
    }
    else if(ent.field("Status")=="Done") {
      if (linke[0].field("Status")=="Active" || (ent.field("VisitType")=="OPD" &​& my.gdate(ent.field("VisitDate"))​== ntoday)​)​{
        if (ent.field("VisitType")=="OPD") {
          ent.set("Color", "#6EB73D"); 
        } 
        else { // Admit
          ent.set("Color",​ "#00B0F0"); 
        } 
      } 
      else { // no Active
        if (ent.field("VisitType")=="OPD")​{
          ent.set("Color", "#577244");
        }​
        else { // Admit
          ent.set("Color", "#3974AA");
        } 
      } 
    }
  }

  else if(libcode=="consult") {
    if(ent.field("EntryMx")=="Not") {
      ent.set("Color", "#5B5B5B")​;
    } 
    else if(linke[0].field("Status")=="Active" || (ent.field("VisitType")=="OPD" &​& my.gdate(ent.field("VisitDate"))​== ntoday)​) {
      if (ent.field("VisitType")=="OPD")​{
        ent.set("Color", "#6EB73D");
      }​
      else { // Admit
        ent.set("Color", "#00B0F0");
      } 
    } 
    else { // not Active
      if (ent.field("VisitType")=="OPD")​{
        ent.set("Color", "#577244");
      }​
      else { // Admit
        ent.set("Color", "#3974AA");
      } 
    }
  }​
}​;

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
  if (t || my.gdate(old.csdate) != my.gdate(​e.field("ConsultDate"))​​) {
    e.set("ConsultDate", my.date(e.field("ConsultDate")));
  }​
  if (t || my.gdate(​old.vsdate) != my.gdate(​e.field("VisitDate"))​) {
    e.set("VisitDate", my.date(e.field("VisitDate")));
  }​
  if (t || my.gdate(​old.dcdate) != my.gdate(​e.field("DischargeDate"))​) {
    e.set("DischargeDate", my.date(e.field("DischargeDate")));
  }​
  if (t || my.gdate(​old.apdate) != my.gdate(​e.field("AppointDate"))​) {
    e.set("AppointDate", my.date(e.field("AppointDate")));
  }​
} ;​
function setvisitdate()​ {
  if (e.field("EntryMx")​ == "Pending" &​& e.field("VisitDate") == null) {
    if (e.field("VisitType") == "Admit") {
      e.set("VisitDate", my.dateminus(e.field("ConsultDate"), 1));
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
  if ((links[0].field("WardStamp")​ == null || my.gdate(e.field("VisitDate")) >= my.gdate(links[0].field("WardStamp")​)) && 
(links[0].field("Status")​ == "Still" || links[0].field("Status") ​== "Active")​​ &​&
e.field("EntryMx") != "Not")​ {
    if (e.field("VisitType") ​== "Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate")) ​> ntoday) ) {//Admit
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
    else if (e.field("VisitType")​ == "Admit" && my.gdate(e.field("VisitDate")) <= ntoday && my.gdate(e.field("DischargeDate"))​ <= ntoday​​ ) { // D/C
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
      if (e.field("Note")!="")​ {
        if (str!="")
          str += " -​> " ;
        str += e.field("Note");
      }​
       
      links[0].set("Descript", str);
    }​
    else if ((m == null)​ || (m.field("DischargeDate") != null && my.gdate(m.field("DischargeDate"))​ <= ntoday)​ ) {//if future check last admit if never admit or already D/C of last visit: still 
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
