var pt = libByName("Patient") ;​
var or = libByName("UroBase") ;​
var cs = libByName("Consult") ;

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
  }, 
  gday : function (value)  {
    if (value != null) {
      this.nd = value.getDay() ;
      return this.nd;
    }
    else {
      this.nd = 0;
      return this.d;
    }
  }
}​;​
var today = my.date(new Date())​;
var ntoday = my.gdate(today);​
var old = {
  a : [],​
  getstart : function (e)​ {
    this.a = e.field("Previous").split(",");
  },
  store : function (e)​ {
    this.a = [] ;​
    let links = e.field("Patient");
    if (links.length>0) ​{
      if (lib().title=="UroBase")​ {
        this.a.push(e.field("Date")​)​;	       //0
        this.a.push(links​[0].title);             //​1
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
      }​
      else { //Consult 
        this.a.push(e.field("ConsultDate"));     //0
        this.a.push(links[0].title);             //​1
        this.a.push(e.field("VisitType"));       //​2
        this.a.push(e.field("Ward"));            //​3
        this.a.push(e.field("VisitDate"));       //​4
        this.a.push(e.field("DischargeDate"));   //​5
        this.a.push(e.field("EntryMx"));         //​6
        this.a.push(e.field("AppointDate"));     //​7
        this.a.push(e.field("Dx"));              //​8
        this.a.push(e.field("Rx"));              //​9
        this.a.push(e.field("Note"));           //​10
        this.a.push(e.field("Track"));          //​11
      }​
      e.set("Previous", this.a.join());
    }​
  },
  get opdate() {
    if (this.a[0]!​="" )​ return new Date(this.a[0])​;
    else return null;
  }​,
  get csdate() {
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
    if (lib().title=="UroBase")​
      return this.a[4] ;
    else
      return this.a[2] ;
  }​,
  get ward() {
    if (lib().title=="UroBase")​
      return this.a[5] ;
    else
      return this.a[3] ;
  }​,
  get vsdate() {
    if (lib().title=="UroBase")​ {
      if (this.a[6]!​="" )​ return new Date(this.a[6])​ ;
      else return null;​
    }​
    else {
      if (this.a[4]!​="" )​ return new Date(this.a[4])​ ;
      else return null;​
    }​
  }​,
  get dcdate() {
    if (lib().title=="UroBase")​ {
      if (this.a[7]!​="" )​ return new Date(this.a[7])​ ;
      else return null;​
    }​
    else {
      if (this.a[5]!​="" )​ return new Date(this.a[5])​ ;
      else return null;​
    }​
  }​,
  get emx() {
    if (lib().title=="UroBase")​ 
      return this.a[8] ;
    else
      return this.a[6] ;
  }​,
  get apdate() {
    if (lib().title=="UroBase")​ {
      if (this.a[9]!​="" )​ return new Date(this.a[9])​ ;
      else return null;​
    }​
    else {
      if (this.a[7]!​="" )​ return new Date(this.a[7])​ ;
      else return null;​
    }​
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
    if (lib().title=="UroBase")​ {
      return this.a[15] ;
    }​
    else {
      return this.a[8] ;
    }​
  }​,
  get rx() {
    return this.a[9] ;
  }​,
  get note() {
    return this.a[10] ;
  }​,
  get op() {
    return this.a[16] ;
  }​,
  get result() {
    return this.a[17] ;
  }, 
  get track() {
    if (lib().title=="UroBase")​ {
      return this.a[18] ;
    }​
    else {
      return this.a[11] ;
    }​
  }​
};

var mer = {
  lastadmit : function (e, date)  {
    let orlinks = e.linksFrom("UroBase", "Patient") ;
    let cslinks = e.linksFrom("Consult", "Patient") ;
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
  }, 
  linklastadmit : function (e, date)  {
    let links = e.field("Patient")​;
    if (links.length>0) {
      let ptent = pt.findById(links[0].id) ;
      return this.lastadmit(ptent, date)​;
    }​
  }, 
  getmergeid : function (e) {
    let raw = [], result = []​;
    if (e.field("MergeID") != "")​ {
      raw = e.field("MergeID").split(",") ;
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
  }, 
  mergelastadmit : function (e)  {
    let mid = this.getmergeid(e) ;
    if (mid.length == 0) {
      let thislib​="" ;
      if (lib().title=="UroBase") thislib = "or" ;
      else  thislib = "cs" ;
      let lao = this.linklastadmit(e, my.dateminus(e.field("VisitDate"), 1));
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
        let mpos = this.posinmerge(e)​;
        let k = mpos["pos"];
        mid = mpos["mar"];
        this.changeother(e, k, mid, "MergeID")​;
        if (e.field("DischargeDate") != null)​
          this.changeother(e, k, mid, "DischargeDate")​;
        return true;
      }
      else {
        message("not found last admit, can't merge");
        e.set("Merge", false) ;
        return false;
      }
    }
    return false;
  }, 
  posinmerge : function (e) {
    let mid = this.getmergeid(e) ;
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
  }​, 
  mergeeffect : function (e)  {
    let mpos = this.posinmerge(e)​;
    if(mpos["found"]​ == true ) { //parent or child
      if(my.gdate(old.vsdate) != my.gdate(e.field("VisitDate"))) {
        this.changeother(e, mpos["pos"]​, mpos["mar"]​, "VisitDate" ) ;
      }
      if(old.ward != e.field("Ward") ) {
        this.changeother(e, mpos["pos"], mpos["mar"], "Ward" ) ;
      } 
      if(my.gdate(old.dcdate) != my.gdate(e.field("DischargeDate")) ) {
        this.changeother(e, mpos["pos"], mpos["mar"], "DischargeDate" ) ;
      }
      if (old.vstype == undefined || e.field("VisitType") == undefined) {
        e.set("VisitType", "Admit");
        this.changeother(e, mpos["pos"], mpos["mar"], "VisitType" ) ;
      }​
      else if(old.vstype != e.field("VisitType") ) {
        e.set("VisitType", old.vstype);
      }
      this.changeother(e, mpos["pos"], mpos["mar"], "Summary" ) ;
      this.changeother(e, mpos["pos"], mpos["mar"], "Track" ) ;
    } 
  }, 
  changeother : function (e, pos, mla, field) {
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
  }, 
  mlacancel : function (e) {
    let mpos = this.posinmerge(e)​;
    if(mpos["found"]​==true)​{
      let k = mpos["pos"];
      let mid = mpos["mar"];
      if (mid.length>2)​ {
        let tid=[]​;
        if (lib().title=="UroBase") {
          field1 = "Date" ;
        }​
        else {
          field1 = "ConsultDate" ;
        }​
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
        this.changeother(e, mid.length, mid, "MergeID")​;
        e.set("MergeID", "");
        if (k>0) {
          e.set("VisitDate", my.dateminus(e.field(field1), 1)​)​;​
          e.set("Ward", "Uro" ​)​ ;
        }​
      }​
      else if (mid.length>1) {
        e.set("MergeID", "")​;​
        this.changeother(e, k, mid, "Merge")​;
        this.changeother(e, k, mid, "MergeID")​;
        if (k>0) {
          e.set("VisitDate", my.dateminus(e.field(field1), 1)​)​;​
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
  }, 
  merge​ : function (e, value) {​
    let mergedone = false;
    if (e.field("Merge")​==true)​ {
      mergedone = mer.mergelastadmit(e)​;
    }
    else if (value)​ {
      mer.mlacancel(e)​;
    }​
    if (mergedone==false &​& value)​ {
      mer.mergeeffect(e)​;
    }​
  }
}​;
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
  getstart : function(e)​ {
    let all = lib().entries();
    this.q = [] ;
    for (let i in all)​ {
      if (my.gdate(all[i].field("Date")​) == my.gdate(e.field("Date"))  &​& all[i].field("ORType") == "GA" &​& all[i].field("Status")​ != "Not")​ {
        this.q.push(all[i]​)​;
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
    return value.id == this.id;
  }, 
  checkdup : function (value)​ {
    return value.id != this.id &​& value.field("Que") == this.field("Que");
  }, 
  findque : function (value)​ {
    this.fq = value;
    return this.q.find(this.checkque, this);
  }, 
  findme : function(entry)​ {
    return this.q.find(this.checkid, entry);
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
  reorder : function(e, from, to, diff) {
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
var emx = {
  createnew : function  (e, libto)​ {
    let libname = "", field1 = "";
    let libfrom = lib().title;
    let min = 0,​ defau = "" ;
    if (libto == "uro" &​& libfrom == "UroBase") {
      libname = "UroBase";
      field1 = "Date" ;
      min = 1;
      defau = "<Default>";
    }​
    else if (libto == "consult" &​& libfrom == "UroBase")​ {​
      libname = "Consult";
      field1 = "ConsultDate" ;
      min = 0;
      defau = "<Default>";
    }​
    else if (libto == "uro" &​& libfrom == "Consult" ) {​
      libname = "UroBase";
      field1 = "Date" ;
      min = 0;
      defau = "Pending";
    }​
    else if (libto == "consult" &​& libfrom == "Consult") {​
      libname = "Consult";
      field1 = "ConsultDate" ;
      min = 1;
      defau = "Pending";
    }​
    let links = e.field("Patient")​;
    if (links.length > 0) {
      let lib = libByName(libname)​;
      let ptent = pt.findById(links[0].id);
      let entlinks = ptent.linksFrom(libname, "Patient");
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
        if (libto == "uro" &​& libfrom == "UroBase") {
          ent​["Op"] = e.field("Operation")​;
          ent​["ORType"] = e.field("ORType")​;
          ent​["VisitType"] = e.field("VisitType")​;
          if (e.field("VisitType")​== "Admit")​
            ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
          else  
            ent​["VisitDate"] = my.date(e.field("AppointDate"))​;
            ent​["RecordDate"] = today​;
        }​
        else if (libto == "consult" &​& libfrom == "UroBase") {
          ent​["Ward"] = e.field("Ward")​;
          ent​["VisitType"] = "OPD";
          ent​["VisitDate"] = my.date(e.field("AppointDate")​);
        }​
        else if (libto == "uro" &​& libfrom == "Consult" ) {​
          ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
          ent​["RecordDate"] = today​;
	      ent​["Op"] = e.field("Operation")​;
          ent["Photo"] = e.field("Photo").join()​;
        }​
        else if (libto == "consult" &​& libfrom == "Consult") {​
          ent["VisitType"]​ = "OPD" ;
          ent["VisitDate"]​ = my.date(e.field("AppointDate"));
        }​
        lib.create(ent);
        let last = lib.entries()[0];
        last.link("Patient", links[0]);
        fill.color(last, libto) ;
        message("successfully created new Entry") ;
      }​
    }​
    e.set("EntryMx", defau) ;
  }, 
  flu : function (e)​ {
    if (e.field("EntryMx")​== "F/U" &&  e.field("AppointDate")!= null) {
      this.createnew(e, "consult")​;
    }​
    else if (e.field("EntryMx")​=="F/U")​ {
      message("Appoint date must not leave blank")​;
      e.set("EntryMx", "<Default>")​;
    }​
  }, 
  setor : function (e)​ {
    if (e.field("EntryMx")​== "set OR" &&  e.field("AppointDate")!= null) {
      this.createnew(e, "uro")​;
    }​
    else if (e.field("EntryMx")​=="set OR")​ {
      message("Appoint date must not leave blank")​;
      e.set("EntryMx", "<Default>")​;
    }​
  }​
}​;
var fill = {
  track​ : function (e) {
    if (lib().title=="UroBase") {
      field1 = "Status" ;
    }​
    else {
      field1 = "EntryMx" ;
    }​
    if (e.field("Summary") == true) {
      e.set("Track", 3);
    }​​
    else if (e.field(field1​) != "Not" && e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday) ) {//Admit
      if (e.field("Track") == 0) {
        e.set("Track", 1) ;
      }​
      else if (e.field("Track") == 3) {​
        e.set("Track", 2) ;
      }​
    }​
    else if (e.field(field1​) != "Not" &​& e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && my.gdate(e.field("DischargeDate"))​ <= ntoday​​ ) { // D/C
      if (e.field("Track") == 3) {​
        e.set("Track", 2) ;
      }​
      else if (e.field("Track") == 0) {​
        e.set("Track", 1) ;
      }​
    }​
    else if (my.gdate(e.field("VisitDate")​) > ntoday) {​
      e.set("Track", 0) ;
    }​
    else if (e.field(field1​) == "Not")​ {
      if (my.gdate(e.field("VisitDate")​) > ntoday) {​ // 
        if (e.field("Track") != 0) {​
          e.set("Track", 0) ;
        }
      }​
      else {
        if (e.field("DischargeDate")​ == null) {
          if (e.field("Track") != 0)
            e.set("Track", 0) ;
        }​
        else {
          if (e.field("Track") == 0)
            e.set("Track", 1) ;
        }​
      }​
    }​
  }, 
  underlying : function (e) {
    let links = e.field("patient")​;
    if (links.length>0) {
      if (links[0].field("Underlying").length>0) {
        e.set("Underlying", ":" + links[0].field("Underlying").join());
      }​
      else {
        e.set("Underlying", "" );
      }​
    }​
  }, 
  los : function (e) {
    if (e.field("VisitDate") != null &​& e.field("DischargeDate") != null) {
      let diff = Math.floor((my.gdate(e.field("DischargeDate"))-my.gdate(e.field("VisitDate")))/86400000);
      e.set("LOS", diff)​;
    }​
    else {
      e.set("LOS", undefined)​;
    }​
  }, 
  ptstatus : function (e) {
    let links = e.field("patient")​;
    if (links.length>0) {
      let m = mer.linklastadmit(e, today)​["ent"];
      if (m != null)​{
        links[0].set("WardStamp", m.field("VisitDate")​);
      }
      else {
        links[0].set("WardStamp",null);
      }​
      //--set pt.status, pt.ward, wardStamp and Description
      if (lib().title=="UroBase") {
        field1 = "Status" ;
        field2 = "Op" ;
        field3 = "OpResult" ;
      }​
      else {
        field1 = "EntryMx" ;
        field2 = "Rx" ;
        field3 = "Note" ;
      }​
      if ((links[0].field("WardStamp")​ == null || my.gdate(e.field("VisitDate")​) >= my.gdate(links[0].field("WardStamp"))​) && 
(links[0].field("Status")​ == "Still" || links[0].field("Status")​ == "Active")​​ &​&
e.field(field1​) != "Not")​ {
        if (e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday) ) {//Admit
          links[0].set("Status" ,"Active");
          links[0].set("Ward",e.field("Ward"));
          links[0].set("WardStamp", e.field("VisitDate")​)​;
          let str = "" ;
          if (e.field("Dx")!="")​
            str = e.field("Dx");
          if (e.field(field2)!="")​ {
            if (str!="" )
              str += " -​> " ;
            str += e.field(field2);
          }​      
          links[0].set("Descript", str);
        }
        else if (e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && my.gdate(e.field("DischargeDate"))​ <= ntoday​​ ) { // D/C
          links[0].set("Status" ,"Still");
          links[0].set("Ward", "");
          let str = "" ;
          if (e.field("Dx")!="")​
            str = e.field("Dx");
          if (e.field(field2)!="")​ {
            if (str!="")
              str += " -​> " ;
            str += e.field(field2);
          }​
          if (e.field(field3)!="")​ {
            if (str!="")
              str += " -​> " ;
            str += e.field(field3);
          }​       
          links[0].set("Descript", str);
        }​
        else if ((m == null)​ || (m.field("DischargeDate") != null && my.gdate(m.field("DischargeDate"))​ <= ntoday)​ ) {//if future, check last admit :never admit or already D/C of last visit: still
          links[0].set("Status" ,"Still");
          links[0].set("Ward", "");
        }​
      }​
      else if (e.field(field1​) == "Not")​ {
        links[0].set("Status" ,"Still");
        links[0].set("Ward", "");
        links[0].set("WardStamp", e.field("VisitDate")​)​;
        let str = "" ;
        if (e.field("Dx")!="")​
          str = e.field("Dx");
        if (e.field(field2)!="")​ {
          if (str!="")
            str += " -​> " ;
          str += e.field(field2);
        }​
        if (e.field(field3)!="")​ {
          if (str!="")
            str += " -​> " ;
          str += e.field(field3);
        }​       
        links[0].set("Descript", str);
      }​
    }​
  }, 
  color : function (e, lib)​ {
    let links = e.field("Patient");
    if (links.length>0) {
      if(lib=="uro") {
        if(e.field("Status")=="Not") {
          e.set("Color", "#5B5B5B")​;
        } 
        else if(e.field("Status")=="Plan") {
          if (links[0].field("Status")=="Active" || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
            if (e.field("VisitType")=="OPD") {
              e.set("Color", "#A7FF87"); 
            } 
            else { // Admit
              e.set("Color",​ "#5CD3FF"); 
            } 
          } 
          else { // no Active
            if (e.field("VisitType")=="OPD")​{
              e.set("Color", "#ABC39A");
            }​
            else { // Admit
              e.set("Color", "#66B2FF");
            } 
          } 
        }
        else if(e.field("Status")=="Done") {
          if (links[0].field("Status")=="Active" || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
            if (e.field("VisitType")=="OPD") {
              e.set("Color", "#6EB73D"); 
            } 
            else { // Admit
              e.set("Color",​ "#00B0F0"); 
            } 
          } 
          else { // no Active
            if (e.field("VisitType")=="OPD")​{
              e.set("Color", "#577244");
            }​
            else { // Admit
              e.set("Color", "#3974AA");
            } 
          } 
        }
      }
      else {
        if(e.field("EntryMx")=="Not") {
          e.set("Color", "#5B5B5B")​;
        } 
        else if(links[0].field("Status")=="Active" || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​) {
          if (e.field("VisitType")=="OPD")​{
            e.set("Color", "#6EB73D");
          }​
          else { // Admit
            e.set("Color", "#00B0F0");
          } 
        } 
        else { // not Active
          if (e.field("VisitType")=="OPD")​{
            e.set("Color", "#577244");
          }​
          else { // Admit
            e.set("Color", "#3974AA");
          } 
        }
      }​
    }​
  }​
}​;
var pto = {
  agetext : function (e, diff) {
    if (diff>365)​{
      e.set("Age", Math.floor(diff/365.2425) + " ปี")​;
    }​
    else if (diff>30)​{
      e.set("Age", Math.floor(diff/30) + " เดือน")​;
    }​
    else {
      e.set("Age" , diff + " วัน")​;
    }​
  }, 
  //un-duplicate HN
  uniqueHN : function (e, value)​ {
    let unique = true;
    let HN = e.field("HN")​;;
    if (HN != null) {
      let entries = pt.entries();​​
      for (let ent in entries) {
        if (entries[ent].field("HN") === HN)
          if (entries[ent].id != e.id || value) 
            unique = false;
      }
      if (!unique) {
        message("field 'HN' is not unique. Try again.");
        cancel();
      }
    }​
  }, 
  //Age
  age : function​ (e) {
    if (e.field("MM")​>12 || e.field("DD")​>30)​ {
      message("MM must <= 12, DD <= 30") ;
      cancel() ;
    }​
    else {
      let d = 0;
      if (e.field("Birthday") == null &​& e.field("YY") > 0)​ {
        d = Math.floor((e.field("YY")*365.2425 + e.field("MM")*30 + e.field("DD"))*86400000)​;
        e.set("Birthday", my.dateminus(today, d)​);
        e.set("Age", e.field("YY")​ + " ปี")​;
      }​
      else if (e.field("Birthday")​ != null)​ {
        d = (ntoday-my.gdate(e.field("Birthday"))​)/86400000;
        this.agetext(e, d)​;
      }​
    }​
  }, 
  //Status
  status : function (e) {
    if (e.field("Status")​ != "Active")
      e.set("Ward","");
  }, 
  //DJ stent
  dj : function (e) {
    if (e.field("DJstent")​ == "")​ {
      e.set("DJStamp", null);
    }
  }, 
  donesettrack : function (e)​ {
    let linkedFrom = mer.lastadmit(e, today);
    if (linkedFrom != null)​ {
      let toEnt = linkedFrom["ent"]​ ;
      let statusf;
      if (linkedFrom["lib"]=="or")​
        statusf = "Status";
      else
        statusf = "EntryMx";
      if (e.field("Done") == true &​& toEnt.field("Track") == 1) {
        if (toEnt.field(statusf​) != "Not" && toEnt.field("VisitType") == "Admit" && (toEnt.field("DischargeDate") == null || my.gdate(toEnt.field("DischargeDate"))​ > ntoday)​)​ { // Admit
          toEnt.set("Track", 2);
        }​
      }​
    }​
  }, 
  resetdone : function (all)​ {
    for (let i in all)​ {
      if (all[i].field("Done")==true) {
        if (all[i].field("Status") == "Active") {
          if (my.gdate(all[i]​.lastModifiedTime)​ < ntoday) {
            all[i].set("Done", false)​ ;
          }​
        }​
        else
          all[i].set("Done", false) ;
      }
    }
  }
}​;
var uro = {
  checkop : function (value)​ {
    return value.field("OpFill") == this.field("Op");
  }, ​
  findop : function (arr, entry)​ {
    return arr.find(this.checkop, entry) ;
  }, 
  setnewdate : function (e, value) {
    //---if Date change : set new date
    if (value || my.gdate(old.opdate) != my.gdate(​e.field("Date"))​) {
      e.set("Date", my.date(e.field("Date")));
    }​
    if (value || my.gdate(​old.vsdate) != my.gdate(​e.field("VisitDate"))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }​
    if (value || my.gdate(​old.dcdate) != my.gdate(​e.field("DischargeDate"))​) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }​
    if (value || my.gdate(​old.apdate) != my.gdate(​e.field("AppointDate"))) {
      e.set("AppointDate", my.date(e.field("AppointDate")));
    }​
    if (value || my.gdate(​old​.rcdate) != my.gdate(​e.field("RecordDate"))​) {
      e.set("RecordDate", my.date(e.field("RecordDate")));
    }​
  }, 
  setopextra : function (e) {
    if (my.gdate(old.opdate) != my.gdate(​e.field("Date"))) {
      if (my.gday(e.field("Date"))==6) {
        e.set("OpExtra", true);
      }​
      else {
        e.set("OpExtra", false);
      }
    }​
  }, 
  setvisitdate ​: function (e)​ {
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
  }, 
  setq : function (e) {
    if (e.field("Status") == "Not" || e.field("ORType")​ == "LA" ) {
      que.getstart(e);
      let maxq = ​que.max() ;
      let lenq = que.q.length;
      let diff = 0;
      if (maxq<lenq)​ {
        diff = lenq-maxq;
      }​
      let oldq = Number​(e.field("Que"))​;
      let newq = maxq;
      if (oldq > 0 &​& oldq < maxq)​ { // 0 < oldq < maxq
        que.reorder(e, oldq, newq, diff) ;
      }​
      e.set("Que", "00") ;
    }​
    else if (old.que == null )​ { //new create
      que.getstart(e)​;
      let lenq = que.q.length+1;
      let maxq = que.max()​+1;
      let diff = 0;
      if (maxq<lenq)​ {
        diff = lenq-maxq;
      }​
      let oldq = 0;
      let newq = Number​(e.field("Que")​)​ ;
      if (newq > maxq || newq == 0)​ {
        e.set("Que", que.string(maxq))​;
      }​
      else { // 0 < newq < maxq
        e.set("Que", que.string(maxq))​;
        que.q.push(e)​;
        oldq = maxq;
        que.reorder(e, oldq, newq, diff) ;
      }​
    }​ 
    else if (old.que == "00"  && e.field("Que")​ == "00")​ { //update, que 0->0
      que.getstart(e)​;
      let maxq = que.max()​+1;
      e.set("Que", que.string(maxq)​)​;
    }​ 
    else if (old.que == "00"  && e.field("Que")​ != "00")​ { //update, que 0->n
      que.getstart(e);
      let oldq = 0;
      let newq = Number​(e.field("Que")​)​ ;
      let lenq = que.q.length;
      let maxq = que.max()​+1;
      let diff = 0;
      if (maxq<lenq)​ {
        diff = lenq-maxq;
      }​
      if (newq > maxq)​ {
        newq = maxq;
        e.set("Que", que.string(newq))​;
      }​
      else if (newq < maxq)​ { // 0 < newq < maxq
        let q = que.findme(e)​; //find current entry in array 
        q.set("Que", que.string(maxq))​;
        oldq = maxq;
        que.reorder(e, oldq, newq, diff) ;
      }​
    }​
    else if (old.que != "00" &​& old.que != e.field("Que")​)​ { //update, que n->m
      que.getstart(e);
      let oldq = Number(old.que)​;
      let newq = Number(e.field("Que"))​;
      let lenq = que.q.length;
      let maxq = que.max()​;
      let diff = 0;
      if (maxq<lenq)​ {
        diff = lenq-maxq;
      }​
      if (newq > maxq)​ {
        newq = maxq;
      }​
      else if (newq == 0)​ {
        newq = 1;
      }​
      que.reorder(e, oldq, newq, diff);
    }​
  }, 
  runq : function (e) {
    que.getstart(e)​;
    let maxq = que.max()​;
    let lenq = que.q.length;
    let newq = 0;
    let eq = Number(e.field("Que")​)​;
    //---Status assign Que---//
    if (e.field("Status") == "Not" || e.field("ORType")​ == "LA" ) {
      e.set("Que", "00") ;
      let hole = que.findhole()​;
      let near = null;
      while ( hole != 0​)​ { // found hole
        maxq = que.max()+1;
        for (let i = hole+1 ; i<maxq; i++)​ {
          near = que.findque(i);
          if (near != null)​{
            near.set("Que", que.string(hole)​);
            break;
          }​
        }​
        hole = que.findhole();
      }​   
    }​
    else if (eq == 0)​ { //update, que 00
      let hole = que.findhole()​;
      maxq += 1;
      if (hole == 0)​ {
        newq = maxq;
      }​
      else {
        newq = hole;
      }​
      e.set("Que", que.string(newq)​)​;
    }​ 
    else if (eq <= maxq)​ { //update, que 0<nn<max
      let dup = que.finddup(e)​;
      let hole = que.findhole()​;
      let near = null;
      maxq += 1;
      if (dup != null &​& hole > 0) { //found dup, found hole
        let skip = 0;
        if (Number(dup.field("Que"))<hole)​ { //wave to right
          skip = 1;
        }​
        else {
          skip = -​1;
        }​
        while (dup != null)​ { //found duplicate
          let i = Number(dup.field("Que"))​+skip;
          near = que.findque(i);
          if (near != null)​{ //found next que
            dup.set("Que", near.field("Que"));
          }​
          else { //found hole
            dup.set("Que", que.string(i))​;
            break;
          }​
          dup = que.finddup(dup);
        }    
      }​
      else if (dup != null &​& hole == 0) { //found dup, no hole
        while (dup != null)​ {//found duplicate
          let i = Number(dup.field("Que"))​+1 ;
          near = que.findque(i);
          if (near != null)​{ //found next que
            dup.set("Que", near.field("Que"));
          }​
          else { //found maxq
            dup.set("Que", que.string(i))​;
            break;
          }​
          dup = que.finddup(dup);
        }    
      } 
      else if (dup == null &​& hole != 0)​ { // no dup, found hole
        e.set("Que", que.string(hole))​;
      }​
    }​
  }, 
  setDJstent : function (e) {
    let links = e.field("patient")​;
    if (links.length>0) {
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
        let ptent = pt.findById(links[0].id) ;
        let d = this.lastDJStamp(ptent, my.dateminus(e.field("Date"), 1)) ;
        if (d == null) { // off -​> none, on
          if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ") 
            e.set("DJstent" , "<none>") ;
        }
        else { // on,change -> none,change,off
          if (e.field("DJstent") == "on DJ") 
            e.set("DJstent", "<none>") ;
        } 
      }​
    }​
  }, 
  lastDJStamp : function (e, date)  {
    let orlinks = e.linksFrom("UroBase", "Patient") ;
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
  }, 
  createoplist : function (e) {
    if (e.field("Status")​ == "Not")​{ // Not set
      e.set("OpExtra",false)​;
      e.set("Bonus", 0)​;
    }​
    else if (e.field("OpExtra")​ == false)​{ // set regular op
      e.set("Bonus", 0)​;
    }​
    else if (e.field("Op") != "" &​& e.field("Op") != null)​ { // set extra op
      let oplib = libByName("OperationList")​;
      let finds = oplib.find(e.field("Op").trim());
      let find = null;
      if (finds.length > 0) {
        find = this.findop(finds, e) ;
      }​
      if (find == null)​ { // set extra op never ever before
        let op = new Object()​;
        op["OpFill"] = e.field("Op").trim()​;
        if (e.field("x1.5")​==true) {
          op["Rate"] = "Extra"​;
          op["Price"] = Math.floor(e.field("Bonus")/3*2)​;
          op["PriceExtra"] = e.field("Bonus")​;
          op["WRate"] = 0​;
        }​
        else {
          op["Rate"] = "Normal"​;
          op["Price"] = e.field("Bonus")​;
          op["PriceExtra"] = Math.floor(e.field("Bonus")/2*3)​;
          op["WRate"] = -​1;
        }​
        oplib.create(op);
        message("Create new OpList Successfully​")​;
      }
      else { // set extra op ever before​
        e.set("Op", find.field("OpFill")​)​;​
        if (e.field("x1.5")​==true) {
          e.set("Bonus", find.field("PriceExtra")​)​;
          find.set("WRate", find.field("WRate")+1​)​;​
        }​
        else {
          e.set("Bonus", find.field("Price")​)​;
          find.set("WRate", find.field("WRate")-1​)​;​
        }​
        find.set("Weight", find.field("Weight")+1​)​;​
        if (find.field("WRate")>=0)
          find.set("Rate", true)​;​
        else
          find.set("Rate", false)​;​
      }​
    }​
  }​,
  updateDJStamp : function (e) {
    let links = e.field("patient")​;
    if (links.length>0) {
      let ptent = pt.findById(links​[0].id) ;
      let d = this.lastDJStamp(ptent, today) ;
      if (d==null) { // not found
        links[0].set("DJStamp",null);
        links[0].set("DJstent","");
      } 
      else { // found
        links[0].set("DJStamp", d.field("Date")) ;
        links[0].set("DJstent","on DJ");
      }
    }
  }, 
  resetcolor : function(all) {
    for (let i in all)​ {
      let d=Math.floor((ntoday-my.gdate(all[i]​.lastModifiedTime))​/86400000​)
      if (d>=0 &​& d<3) {
        fill.color(all[i]​, "uro")​;
      }
    } 

  }​
}​;

var cso = {
  setnewdate : function (e, value) {
    //---if Date change : set new date
    if (value || my.gdate(old.csdate) != my.gdate(​e.field("ConsultDate"))​) {
      e.set("ConsultDate", my.date(e.field("ConsultDate")));
    }​
    if (value || my.gdate(​old.vsdate) != my.gdate(​e.field("VisitDate"))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }​
    if (value || my.gdate(​old.dcdate) != my.gdate(​e.field("DischargeDate"))​) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }​
    if (value || my.gdate(​old.apdate) != my.gdate(​e.field("AppointDate"))) {
      e.set("AppointDate", my.date(e.field("AppointDate")));
    }​
  }, 
  setvisitdate ​: function (e)​ {
    if (e.field("EntryMx")​== "Pending" &​& e.field("VisitDate") == null) {
      if (e.field("VisitType") == "Admit")​
        e.set("VisitDate", my.dateminus(e.field("ConsultDate"), 1));
    }​
    else ​{
      e.set("VisitDate", e.field("ConsultDate")​)​;
    }​
  }, 
  resetcolor : function(all) {
    for (let i in all)​ {
      let d=Math.floor((ntoday-my.gdate(all[i]​.lastModifiedTime))​/86400000​)
      if (d>=0 &​& d<3) {
        fill.color(all[i]​, "consult")​;
      }
    } 

  }​
}​;

var trig = {
  PatientBeforeEdit : function (e, value)​ {
    if (value=="create")
	  pto.uniqueHN(e, true)​;
	else if (value=="update")​
	  pto.uniqueHN(e, false)​;
	pto.age(e)​;
	pto.status(e)​;
	pto.dj(e)​;
  }, 
  PatientBeforeViewCard ​: function (e) {
    pto.donesettrack(e)​;
  }, 
  PatientBeforeOpenLib : function (all) {
    pto.resetdone(all)​;
  }, 
  UroOpenEdit : function (e)​ {
    old.store(e)​;
  }, 
  UroBeforeEdit : function (e, value)​ {
    if (value=="create")
      uro.setnewdate(e, true)​;
    else if (value=="update")​{
      old.getstart(e)​;
      uro.setnewdate(e, false)​;
    }​
    uro.setopextra(e)​;
    uro.setvisitdate(e)​;
    fill.track​(e)​;
    if (value=="create")
      mer.merge(e, false)​;
    else if (value=="update")​
      mer.merge(e, true)​;
    uro.setq(e)​;
    uro.setDJstent(e)​;
    uro.createoplist(e)​;
    fill.underlying(e)​;
    fill.los(e)​;
  }, 
  UroAfterEdit : function (e, value) {
    if (value=="update")​
      old.getstart(e)​;
    fill.ptstatus(e)​;
    fill.color(e, "uro")​;
    emx.flu(e)​;
    emx.setor(e)​;
    uro.updateDJStamp(e)​;
  }, 
  UroBeforeViewCard ​: function (e) {​
    fill.color(e, "uro")​;
    uro.runq(e)​;
  }, 
  UroBeforeOpenLib : function (all) {
    uro.resetcolor(all)​;
  }, 
  ConsultOpenEdit : function (e)​ {
    old.store(e)​;
  }, 
  ConsultBeforeEdit : function (e, value)​ {
    if (value=="create")
      cso.setnewdate(e, true)​;
    else if (value=="update")​ {
      old.getstart(e)​;
      cso.setnewdate(e, false)​;
    }​
    cso.setvisitdate(e)​;
    fill.track​(e)​;
    if (value=="create")
      mer.merge(e, false)​;
    else if (value=="update")​
      mer.merge(e, true)​;
    fill.underlying(e)​;
    fill.los(e)​;
  }, 
  ConsultAfterEdit : function (e, value) {
    if (value=="update")​
      old.getstart(e)​;
    fill.ptstatus(e)​;
    fill.color(e, "consult")​;
    emx.flu(e)​;
    emx.setor(e)​;
  }, 
  ConsultBeforeViewCard ​: function (e) {​
    fill.color(e, "consult")​;
  }, 
  ConsultBeforeOpenLib : function (all) {
    cso.resetcolor(all)​;
  }, 
}​;