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
    if(old.track != e.field("Track") ) {
      changeother(mpos["pos"], mpos["mar"], "Track" ) ;
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
  let mpos = posinmerge()​;
  if(mpos["found"]​==true)​{
    let k = mpos["pos"];
    let mid = mpos["mar"];

    if (mid.length>2)​ {
      let tid=[]​;
      for(let i=mid.length-1; i>k; i--)​ {
        let o = new Object()​;
        o["lib"]​=mid[i]["lib"];
        o["id"]​=mid[i]["id"];​
        tid.push(​o)​;
        mid.pop();​
      }​
      mid.pop()​;
      for(let i=tid.length-1; i>=0; i-​-)​ {
        let o = new Object()​;
        o["lib"]​=tid[i]["lib"];
        o["id"]​=tid[i]["id"];​
        mid.push(o​)​;
        tid.pop();
      }​
      let str = "" ;​
      for(let i=0; i<mid.length; i++)​ {
        str+=mid[i]​["lib"]​;
        str+=",";
        str+=mid[i]​["id"]​;
        if (i<mid.length-1)
          str+=",";
      }​
      e.set("MergeID", str)​;​
      changeother(mid.length, mid, "MergeID")​;
      e.set("MergeID", "");
      if (k>0) {
        e.set("VisitDate", my.dateminus(e.field("Date"), 1)​)​;​
        e.set("Ward", "Uro" ​)​ ;
      }​
    }​
    else if (mid.length>1) {
      e.set("MergeID", "")​;​
      changeother(k, mid, "Merge")​;
      changeother(k, mid, "MergeID")​;
      if (k>0) {
        e.set("VisitDate", my.dateminus(e.field("Date"), 1)​)​;​
        e.set("Ward", "Uro" ​)​ ;
      }​
      else { //this entry is parent -​> change child as usual
        let lib ="", id="" ;​
        if (mid[1]["lib"] == "or") {
          lib = "UroBase" ;
          id = mid[1]["id"] ;
        }
        else if (mid[1]["lib"] == "cs") {
          lib = "Consult" ;
          id = mid[1]["id"] ;
        }
        let toent = libByName(lib).findById(id) ;
        if (toent != null) {
          if(lib=="UroBase")​
            toent.set("VisitDate", my.dateminus(toent.field("Date"), 1)​)​ ;
          else if(lib=="Consult")​
            toent.set("VisitDate", my.dateminus(toent.field("ConsultDate"), 1)​)​ ;

          toent.set("Ward", "Uro")​;
        }​
      }​
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

//UroBase
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
    this.a.push(e.field("Track"));          //​18
  
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
  get track() {
    return this.a[18] ;
  }​
} ;
var que = {
  q : [],​
  fq : 0, 
  string : function (value)​ {
    if(typeof (value)​ == "number")​ {
      if(value>9) 
        return String(value) ;
      else 
        return "0" + String(value);
    }
    else if(typeof (value)​ == "string" )​ {
      if(value.length>1) 
        return  value;
      else 
        return "0" + value ;
    } 
  }, 
  getstart : function()​ {
    let uro = lib().entries();
    this.q = [] ;
    for (let i in uro)​ {
      if (my.gdate(uro[i].field("Date")​) == my.gdate(e.field("Date"))  &​& uro[i].field("ORType") == "GA" &​& uro[i].field("Status")​ != "Not")​ {
        this.q.push(uro[i]​)​;
      }​
    }​
  }, 
  max : function()​ {
    let maxq = 0;
    for(let i in this.q) {
      if(Number(this.q[i]​.field("Que"))​ > maxq) {
        maxq = Number(this.q[i]​.field("Que"))​;
      }​
    }​
    return maxq;
  }, 
  checkque : function (value)​ {
    return Number(value.field("Que")​) == this.fq;
  }, 
  checkid : function (value)​ {
    return value.id == e.id;
  }, 
  checkdup : function (value)​ {
    return value.id != this.id &​& value.field("Que") == this.field("Que");
  }, 
  findque : function (value)​ {
    this.fq = value;
    return this.q.find(this.checkque, this);
  }, 
  findme : function()​ {
    return this.q.find(this.checkid);
  }, 
  finddup : function (entry)​ {
    return this.q.find(this.checkdup, entry);
  }, 
  findhole : function ()​ {
    let m = this.max()+1;
    for (let i = 1; i<m;  i++) {
      let found = false;
      for (let j in this.q) {
        let nq = Number(this.q[j]​.field("Que"​))​;
        if (nq==i)​ {
          found = true;
          break;
        }​
      }​
      if (found==false)​ {
        return i;
      }​
    }​
    return 0;
  }, 
  sort : function()​ {
    if(this.q.length > 0) {
      this.q.sort(function(a, b) {
        let diff = a.field("Que")-b.field("Que");
        if (diff<0) return -​1;
        else if (diff>0) return 1;
        else return 0;
      })​;
    }​
  }, 
  reorder : function(from, to, diff) {
    e.set("Que", this.string(from))​;
    this.sort()​;
    if (from < to )​ { //Rt shift
      for (let i = to; i>from; i--)​ { 
        this​.q[diff+i-1].set("Que", this.q[diff+i-2].field("Que"));
      }​
    }​
    else { // from​ > to : Lt shift
      for (let i = to; i<from​; i++)​ { 
        this​.q[diff+i-1].set("Que", this.q[diff+i].field("Que"));
      }​
    }​
    e.set("Que", this​.string(to​))​;
  }
}​;
function setnewdate(trig) {
  let t = false ;
  if (trig=="update")​ 
    t = false;
  else 
    t = true;

  //---if Date change : set new date
  if (t || my.gdate(old.opdate) != my.gdate(​e.field("Date"))​) {
    e.set("Date", my.date(e.field("Date")));
  }​
  if (t || my.gdate(​old.vsdate) != my.gdate(​e.field("VisitDate"))) {
    e.set("VisitDate", my.date(e.field("VisitDate")));
  }​
  if (t || my.gdate(​old.dcdate) != my.gdate(​e.field("DischargeDate"))​) {
    e.set("DischargeDate", my.date(e.field("DischargeDate")));
  }​
  if (t || my.gdate(​old.apdate) != my.gdate(​e.field("AppointDate"))) {
    e.set("AppointDate", my.date(e.field("AppointDate")));
  }​
  if (t || my.gdate(​old.rcdate) != my.gdate(​e.field("RecordDate"))​) {
    e.set("RecordDate", my.date(e.field("RecordDate")));
  }​
} ;
function setvisitdate()​ {
  if (e.field("EntryMx")​== "<Default>" &​& e.field("VisitDate") == null) {
    if (e.field("ORType") == "GA") {
      if (e.field("VisitType") == "OPD")​
        e.set("VisitType", "Admit")​;
      e.set("VisitDate", my.dateminus(e.field("Date"), 1));
    }​
    else ​{
      e.set("VisitDate", my.date(e.field("Date")))​;
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
      if (orlinks[i].field("DJstent") != "<none>"​ && orlinks[i].field("Date") > last && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)​) {
        last = orlinks[i].field("Date");
        r=i;
      }
    }
    if (last != null &​& orlinks[r].field("DJstent") != "off DJ") {
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
  else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) <= ntoday) { // DJStamp not null 
    if (e.field("DJstent") == "on DJ")​
       e.set("DJstent", "<none>")​ ;
  }​
  else if (e.field("Date") < links[0].field("DJStamp"))​  {// the past
    if (old.dj != null)​
      e.set("DJstent", old.dj) ;
  }​
  else if (my.gdate(e.field("Date")) == my.gdate(links[0].field("DJStamp")))​ {// entry update DJStamp
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
  if ((links[0].field("WardStamp")​ == null || my.gdate(e.field("VisitDate")​) >= my.gdate(links[0].field("WardStamp"))​) && 
(links[0].field("Status")​ == "Still" || links[0].field("Status")​ == "Active")​​ &​&
e.field("Status") != "Not")​ {
    if (e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday) ) {//Admit
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
    else if (e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && my.gdate(e.field("DischargeDate"))​ <= ntoday​​ ) { // D/C
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
    else if ((m == null)​ || (m.field("DischargeDate") != null && my.gdate(m.field("DischargeDate"))​ <= ntoday)​ ) {//if future, check last admit :never admit or already D/C of last visit: still
      links[0].set("Status" ,"Still");
      links[0].set("Ward", "");
    }​
  }​
  else if (e.field("Status") == "Not")​ {
    links[0].set("Status" ,"Still");
    links[0].set("Ward", "");
    links[0].set("WardStamp", e.field("VisitDate")​)​;
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
}​;
