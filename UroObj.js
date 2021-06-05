var pt = libByName("Patient") ;​
var or = libByName("UroBase") ;​
var cs = libByName("Consult") ;
var bu = libByName("Backup") ;
var rp = libByName("Report")​;

var my = {
  d : null, 
  nd : 0,
  date : function (value)  {
    if (value) {
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
  }
}​;​
var today = my.date(new Date())​;
var ntoday = my.gdate(today);​

var oldUr = {
  a : [],​
  load : function (e)​ {
    this.a = e.field("Previous").split(",");
  },
  save : function (e)​ {
    this.a = [] ;​
    if(e) {
      let links = e.field("Patient"); 
      this.a.push(e.field("Date")!=null?e.field("Date").toDateString():null)​;	       //0
      if (links.length>0) 
        this.a.push(links​[0].title);               //​1
      this.a.push(e.field("ORType"));          //​2
      this.a.push(e.field("Que"));             //​3
      this.a.push(e.field("VisitType"));       //​4
      this.a.push(e.field("Ward"));            //​5
      this.a.push(e.field("VisitDate")!=null?e.field("VisitDate").toDateString():null);       //​6
      this.a.push(e.field("DischargeDate")!=null?e.field("DischargeDate").toDateString():null);   //​7     this.a.push(e.field("EntryMx"));         //​8
      this.a.push(e.field("AppointDate")!=null?e.field("AppointDate").toDateString():null​);     //​9
      this.a.push(e.field("Status"));         //​10 
      this.a.push(e.field("DJstent"));        //​11
      this.a.push(e.field("OpExtra"));        //​12
      this.a.push(e.field("Bonus"));          //​13
      this.a.push(e.field("RecordDate")!=null?e.field("RecordDate").toDateString():null);     //​14
      this.a.push(e.field("Dx"));             //​15
      this.a.push(e.field("Op"));             //​16
      this.a.push(e.field("OpResult"));       //​17
      this.a.push(e.field("Track"));          //​18
            
      e.set("Previous", this.a.join());
    }
  },
  get opdate() {
    if (this.a[0])​ return my.date(this.a[0])​;
    else return null;
  }​,
  get patient() {
    if (this.a[1])​ return this.a[1] ;
    else return null;
  }​, 
  get optype() {
    if (this.a[2])​ return this.a[2] ;
    else return null;
  }​,​
  get que() {
    if (this.a[3])​ return this.a[3] ;
    else return null;
  }​,
  get vstype() {
    if (this.a[4])​ return this.a[4] ;
    else return null;
  }​,
  get ward() {
    if (this.a[5])​ return this.a[5] ;
    else return null;
  }​,
  get vsdate() {
    if (this.a[6])​ return my.date(this.a[6])​ ;
    else return null;​
  }​,
  get dcdate() {
    if (this.a[7])​ return my.date(this.a[7])​ ;
    else return null;​
  }​,
  get emx() {
    if (this.a[8])​ return this.a[8] ;
    else return null;
  }​,
  get apdate() {
    if (this.a[9])​ return my.date(this.a[9])​ ;
    else return null;​
  }​,
  get status() {
    if (this.a[10])​ return this.a[10] ;
    else return null;​
  }​,
  get dj() {
    if (this.a[11])​ return this.a[11];
    else return null;​
  }​,
  get opext() {
    if (this.a[12])​ return this.a[12] ;
    else return null;​
  }​,
  get bonus() {
    if (this.a[13])​ return this.a[13] ;
    else return null;​
  }, 
  get rcdate() {
    if (this.a[14])​ return my.date(this.a[14])​ ;
    else return null;​
  }​,
  get dx() {
    if (this.a[15])​ return this.a[15] ;
    else return null ;
  }​,
  get op() {
    if (this.a[16])​ return this.a[16] ;
    else return null ;
  }​,
  get result() {
    if (this.a[17])​ return this.a[17] ;
    else return null ;
  }, 
  get track() {
    if (this.a[18])​ return this.a[18] ;
    else return null ;
  }​
};
var oldCs = {
  a : [],​
  load : function (e)​ {
    this.a = e.field("Previous").split(",");
  },
  save : function (e)​ {
    this.a = [] ;​
    if(e) {
      let links = e.field("Patient"); 
      this.a.push(e.field("ConsultDate")!=null?e.field("ConsultDate").toDateString():null)​;	       //0
      if (links.length>0) 
        this.a.push(links​[0].title);               //​1
      this.a.push(e.field("VisitType"));       //​2
      this.a.push(e.field("Ward"));            //​3
      this.a.push(e.field("VisitDate")!=null?e.field("VisitDate").toDateString():null);       //​4
      this.a.push(e.field("DischargeDate")!=null?e.field("DischargeDate").toDateString():null);   //​5
      this.a.push(e.field("EntryMx"));         //​6
      this.a.push(e.field("AppointDate")!=null?e.field("AppointDate").toDateString():null);     //​7
      this.a.push(e.field("Dx"));              //​8
      this.a.push(e.field("Rx"));              //​9
      this.a.push(e.field("Note"));           //​10
      this.a.push(e.field("Track"));          //​11
      
      e.set("Previous", this.a.join());
    }​
  },
  get csdate() {
    if (this.a[0])​ return my.date(this.a[0])​;
    else return null;
  }​,
  get patient() {
    if (this.a[1])​ return this.a[1] ;
    else return null;
  }​, 
  get vstype() {
    if (this.a[2])​ return this.a[2] ;
    else return null;
  }​,
  get ward() {
    if (this.a[3])​ return this.a[3] ;
    else return null;
  }​,
  get vsdate() {
    if (this.a[4])​ return my.date(this.a[4]) ;
    else return null;
  }​,
  get dcdate() {
    if (this.a[5])​ return my.date(this.a[5]) ;
    else return null;
  }​,
  get emx() {
    if (this.a[6])​ return this.a[6] ;
    else return null;
  }​,
  get apdate() {
    if (this.a[7])​ return my.date(this.a[7]) ;
    else return null;
  }​,
  get dx() {
    if (this.a[8])​ return this.a[8] ;
    else return null;
  }​,
  get rx() {
    if (this.a[9])​ return this.a[9] ;
    else return null;
  }​,
  get note() {
    if (this.a[10])​ return this.a[10] ;
    else return null;
  }​,
  get track() {
    if (this.a[11])​ return this.a[11] ;
    else return null;
  }​
};
var oldPt = {
  a : [],​
  load : function (e)​ {
    this.a = e.field("Previous").split(",");
  },
  save : function (e)​ {
    this.a = [] ;​
    if(e) {
      this.a.push(e.field("PtName"));              //​0
      this.a.push(e.field("YY"));                  //​1
      this.a.push(e.field("MM"));                  //​2
      this.a.push(e.field("DD"));                  //​3
      this.a.push(e.field("Birthday")?e.field("Birthday").toDateString():null)​;	       //4
      this.a.push(e.field("HN"));                  //​5
      this.a.push(e.field("Phone"));               //​6
      this.a.push(e.field("Contact"));             //​7

      e.set("Previous", this.a.join());
    }
  },
  get ptname() {
    if (this.a[0])​ return this.a[0]​;
    else return null;
  }​,
  get yy() {
    if (this.a[1])​ return this.a[1];
    else return null;
  }​,
  get mm() {
    if (this.a[2])​ return this.a[2];
    else return null;
  }​,
  get dd() {
    if (this.a[3])​ return this.a[3];
    else return null;
  }​,
  get birthday() {
    if (this.a[4])​ return my.date(this.a[4])​ ;
    else return null;​
  }​,
  get hn() {
    if (this.a[5])​ return this.a[5];
    else return null;
  }​,
  get phone() {
    if (this.a[6])​ return this.a[6];
    else return null;
  }​,
  get contact() {
    if (this.a[7])​ return this.a[7];
    else return null;
  }​​
};

var mer = {
  lastadmit : function (e, date)  {
    let orlinks = e.linksFrom("UroBase", "Patient") ;
    let bulinks = e.linksFrom("Backup", "Patient") ;
    let cslinks = e.linksFrom("Consult", "Patient") ;
    let o = new Object()​ ;
    let last = null, s=null, r=null, u=null​;​
    if (orlinks.length>0) {
      for (let i in orlinks) {
        if (orlinks[i].field("VisitType")=="Admit" && orlinks[i].field("VisitDate") > last && my.gdate(​orlinks[i].field("VisitDate"))​ <= my.gdate(​date)​) {
          last = orlinks[i].field("VisitDate");
          r=i;
        }
      }
    }​
    if (bulinks.length​>0) {
      for (let i in bulinks) {
        if (bulinks[i].field("VisitType")=="Admit" && bulinks[i].field("VisitDate")​ > last​ && my.gdate(​bulinks[i].field("VisitDate"))​ <= my.gdate(​date)​) {
          last = bulinks[i].field("VisitDate");
          u=i;
        }
      }
    }​
    if (cslinks.length>0) {
      for (let i in cslinks) {
        if (cslinks[i].field("VisitType")=="Admit" && cslinks[i].field("VisitDate")​ > last && my.gdate(​cslinks[i].field("VisitDate"))​ <= my.gdate(​date) ) {
          last = cslinks[i].field("VisitDate");
          s=i;
        }
      }
    }​
    if (last != null) {
      if (r!=null &​& u==null &​& s==null) {
        o["lib"] = "or" ;
        o["ent"] = orlinks[r] ;
      }
      else if (u!=null &​& s==​null)​ {
        o["lib"] = "bu" ;
        o["ent"] = bulinks[u] ;
      }
      else if (s!=null) {​
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
      else if (lib().title=="Backup") thislib = "bu";
      else thislib = "cs" ;
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
      let thisid = e.id ;
      for(let i in mid) {
        if (mid[i]["id"]==thisid) {
          o["found"] = true ;
          o["pos"]​ = i ;
          o["mar"] ​= mid;
          break;
        }
      }
    }​
    return o;
  }​, 
  effect : function (e)  {
    let old = (lib().title=="UroBase" || lib().title=="Backup") ? 
                   oldUr:oldCs;
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
    } 
  }, 
  other : function (e)  {
    let mpos = this.posinmerge(e)​;
    if(mpos["found"]​ == true ) { //parent or child
      this.changeother(e, mpos["pos"], mpos["mar"], "Summary" ) ;
      this.changeother(e, mpos["pos"], mpos["mar"], "Track" ) ;
      this.changeother(e, mpos["pos"], mpos["mar"], "Underlying" ) ;
      this.changeother(e, mpos["pos"], mpos["mar"], "LOS" ) ;
      this.changeother(e, mpos["pos"], mpos["mar"], "Color" ) ;
    } 
  }, 
  changeother : function (e, pos, mla, field) {
    for (let i in mla) {
      if(i != pos) {
        let lib ="", id="", libcolor="" ;
        if (mla[i]["lib"] == "or") {
          lib = "UroBase" ;
          id = mla[i]["id"] ;
          libcolor = "uro" ;
        }
        else if (mla[i]["lib"] == "bu") {
          lib = "Backup" ;
          id = mla[i]["id"] ;
          libcolor = "backup" ;
        }
        else if (mla[i]["lib"] == "cs") {
          lib = "Consult" ;
          id = mla[i]["id"] ;
          libcolor = "consult" ;
        }
        let toent = libByName(lib).findById(id) ;
        if (toent != null) {
          if (field=="Color")​{
            fill.color(toent, libcolor)​;
          }​
          else {
            toent.set(field, e.field(field)) ;
          }​ 
        }
      } 
    } 
  }, 
  mlacancel : function (e) {
    let mpos = this.posinmerge(e)​;
    if(mpos["found"]​==true)​{
      let k = mpos["pos"];
      let mid = mpos["mar"];
      let field1 = "" ;
      if (lib().title=="UroBase" || lib().title=="Backup") {
        field1 = "Date" ;
      }​
      else {
        field1 = "ConsultDate" ;
      }​
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
          else if (mid[1]["lib"] == "bu") {
            lib = "Backup" ;
            id = mid[1]["id"] ;
          }
          else if (mid[1]["lib"] == "cs") {
            lib = "Consult" ;
            id = mid[1]["id"] ;
          }
          let toent = libByName(lib).findById(id) ;
          if (toent != null) {
            if(lib=="UroBase" || lib=="Backup")​
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
      mer.effect(e)​;
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
  checkdup : function (value)​ {
    return value.id != this.id &​& value.field("Que") == this.field("Que");
  }, 
  findque : function (value)​ {
    this.fq = value;
    return this.q.find(this.checkque, this);
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
  }
}​;
var emx = {
  createnew : function  (e, libto)​ {
    let ob = {}​;
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
    else if (libto == "uro" &​& libfrom == "Backup") {
      libname = "UroBase";
      field1 = "Date" ;
      min = 0;
      defau = "<Default>";
    }​
    else if (libto == "consult" &​& libfrom == "Backup")​ {​
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
          if (my.gdate(entlinks[i].field(field1))​ == my.gdate(e.field("AppointDate")) &​& entlinks[i].id!=e.id)​{
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
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
          if(my.gdate(ent​[field1])​>=ntoday​)​
            ent​["Future"] = ​Math.floor((my.gdate(ent​[field1])​-ntoday)​/86400000);
          else
            ent​["Future"] = null;
        }​
        else if (libto == "consult" &​& libfrom == "UroBase") {
          ent​["VisitType"] = "OPD";
          ent​["VisitDate"] = my.date(e.field("AppointDate")​);
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
        }​
        else if (libto == "uro" &​& libfrom == "Backup") {
          ent​["Op"] = e.field("Operation")​;
          ent​["ORType"] = e.field("ORType")​;
          ent​["VisitType"] = e.field("VisitType")​;
          if (e.field("VisitType")​== "Admit")​
            ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
          else  
            ent​["VisitDate"] = my.date(e.field("AppointDate"))​;
          ent​["RecordDate"] = today​;
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
          if(my.gdate(ent​[field1])​>=ntoday​)​
            ent​["Future"] = ​Math.floor((my.gdate(ent​[field1])​-ntoday)​/86400000);
          else
            ent​["Future"] = null;
        }​
        else if (libto == "consult" &​& libfrom == "Backup") {
          ent​["VisitType"] = "OPD";
          ent​["VisitDate"] = my.date(e.field("AppointDate")​);
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
        }​
        else if (libto == "uro" &​& libfrom == "Consult" ) {​
          ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
          ent​["RecordDate"] = today​;
	  ent​["Op"] = e.field("Operation")​;
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
          if(my.gdate(ent​[field1])​>=ntoday​)​
            ent​["Future"] = ​Math.floor((my.gdate(ent​[field1])​-ntoday)​/86400000);
          else
            ent​["Future"] = null;
        }​
        else if (libto == "consult" &​& libfrom == "Consult") {​
          ent["VisitType"]​ = "OPD" ;
          ent["VisitDate"]​ = my.date(e.field("AppointDate"));
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
        }​
        lib.create(ent);
        let last = lib.entries()[0];
        last.link("Patient", links[0]);
        fill.track(last, libto)​;
        fill.underlying(last)​;
        fill.color(last, libto) ;
        message("successfully created new Entry") ;
        if (libto == "uro") ​{
          let dxe = uro.createautofill​(last)​;
          uro.setx15(last)​;
          let ope = uro.createoplist(last)​;
          if(dxe!=undefined)​
            uro.updatedxop​(last, "dx", dxe)​;
          if(ope!=undefined)​
            uro.updatedxop​(last, "op", ope)​;
          rpo.updatenew(last)​;
          ob=last​;
        }​
      }​
    }​
    e.set("EntryMx", defau) ;
    return ob;
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
      this.createnew(e, "uro").show()​;
    }​
    else if (e.field("EntryMx")​=="set OR")​ {
      message("Appoint date must not leave blank")​;
      e.set("EntryMx", "<Default>")​;
    }​
  }​
}​;
var fill = {
  track​ : function (e, lib) {
    let field1 = "" ;
    if(lib=="uro" || lib=="backup") {
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
    let links = e.field("Patient")​;
    if (links.length>0) {
      if (links[0].field("Underlying").length>0) {
        e.set("Underlying", links[0].field("Underlying").join());
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
    let links = e.field("Patient")​;
    let field1 = "" ;
    if (links.length>0) {
      let m = mer.linklastadmit(e, today)​["ent"];
      if (m != null)​{
        links[0].set("WardStamp", m.field("VisitDate")​);
      }
      else {
        links[0].set("WardStamp",null);
      }​
      //--set pt.status, pt.ward, wardStamp and Description
      if (lib().title=="UroBase" || lib().title=="Backup") {
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
(links[0].field("Status")​ == "Still" || links[0].field("Status")​ == "Active")​​)​ {
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
          let dead = e.field(field3).match(/dead|death/ig);
          dead = dead==null?0:dead.length​;
          if(dead>0){
            links[0].set("Status" ,"Dead");
          }
          else {
            links[0].set("Status" ,"Still");
          }
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
    }​
  }, 
  color : function (e, lib)​ {
    let links = e.field("Patient");
    if (links.length>0) {
      if(lib=="uro" || lib=="backup") {
        if(e.field("Status")=="Not") {
          if(e.field("Color")​!="#5B5B5B") e.set("Color", "#5B5B5B")​;
        } 
        else if(e.field("Status")=="Plan") {
          if (links[0].field("Status")=="Active" || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
            if (e.field("VisitType")=="OPD") {
              if(e.field("Color")​!="#A7FF87") e.set("Color", "#A7FF87"); 
            } 
            else { // Admit
              if(e.field("Color")​!="#5CD3FF") e.set("Color",​ "#5CD3FF"); 
            } 
          } 
          else { // no Active
            if (e.field("VisitType")=="OPD")​{
              if(e.field("Color")​!="#ABC39A") e.set("Color", "#ABC39A");
            }​
            else { // Admit
              if(e.field("Color")​!="#66B2FF") e.set("Color", "#66B2FF");
            } 
          } 
        }
        else if(e.field("Status")=="Done") {
          if (links[0].field("Status")=="Active" || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
            if (e.field("VisitType")=="OPD") {
              if(e.field("Color")​!="#6EB73D") e.set("Color", "#6EB73D"); 
            } 
            else { // Admit
              if(e.field("Color")​!="#00B0F0") e.set("Color",​ "#00B0F0"); 
            } 
          } 
          else { // no Active
            if (e.field("VisitType")=="OPD")​{
              if(e.field("Color")​!="#577244") e.set("Color", "#577244");
            }​
            else { // Admit
              if(e.field("Color")​!="#3974AA") e.set("Color", "#3974AA");
            } 
          } 
        }
      }
      else {
        if(e.field("EntryMx")=="Not") {
          if(e.field("Color")​!="#5B5B5B") e.set("Color", "#5B5B5B")​;
        } 
        else if(links[0].field("Status")=="Active" || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​) {
          if (e.field("VisitType")=="OPD")​{
            if(e.field("Color")​!="#6EB73D") e.set("Color", "#6EB73D");
          }​
          else { // Admit
            if(e.field("Color")​!="#00B0F0") e.set("Color", "#00B0F0");
          } 
        } 
        else { // not Active
          if (e.field("VisitType")=="OPD")​{
            if(e.field("Color")​!="#577244") e.set("Color", "#577244");
          }​
          else { // Admit
            if(e.field("Color")!="#3974AA") e.set("Color", "#3974AA");
          } 
        }
      }​
    }​
  }​
}​;
var pto = {
  rearrangename : function(e) {
    let newname = e.field("PtName").replace(/\s+/g, ' ').trim();
    e.set("PtName", newname);
    if(newname.search(/นาน/)==0){
      e.set("PtName", newname.replace(/นาน/, "นาย"));
    }
  }, 
  agetext : function (e, diff) {
    if (diff>365)​{
      e.set("Age", Math.floor(diff/365.2425) + " ปี")​;
    }​
    else if (diff>30)​{
      e.set("Age", Math.floor(diff/30.4375) + " เดือน")​;
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
    
    let d = 0;
    if (oldPt.yy != e.field("YY") && e.field("YY") ||
        oldPt.mm != e.field("MM") ||
        oldPt.dd != e.field("DD"))​ {
      let month = e.field("MM")?e.field("MM"):0;
      let day = e.field("DD")?e.field("DD"):0;
      d = Math.round(e.field("YY")*365.2425 + month*30.4375 + day);
      e.set("Birthday", my.dateminus(today, d)​);
      e.set("Age", e.field("YY")​ + " ปี")​;
    }​
    if (e.field("Birthday")​)​ {
      d = Math.floor((ntoday-my.gdate(e.field("Birthday"))​)/86400000);
      this.agetext(e, d)​;
    }​
  }, 
  //Status
  status : function (e) {
    if (e.field("Status")​ != "Active")
      e.set("Ward","");
  }, 
  //DJ stent
  dj : function (e) {
    if (e.field("DJstent") == "<none>")​ {
      e.set("DJStamp", null);
    }
  }, 
  donesettrack : function (e)​ {
    let linkedFrom = mer.lastadmit(e, today);
    if (linkedFrom != null)​ {
      let toEnt = linkedFrom["ent"]​ ;
      let statusf;
      if (linkedFrom["lib"]=="or"  || linkedFrom["lib"]​=="bu")​
        statusf = "Status";
      else
        statusf = "EntryMx";
      if (e.field("Done") == true &​& toEnt.field("Track") == 1) {
        if (toEnt.field(statusf​) != "Not" && toEnt.field("VisitType") == "Admit" && (toEnt.field("DischargeDate") == null || my.gdate(toEnt.field("DischargeDate"))​ > ntoday)​)​ { // Admit
          toEnt.set("Track", 2);
          mer.other(toEnt)​;
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
  checkdx : function (value)​ {
    return value.field("Dx") == this.field("Dx") &​& value.field("Op") ​== this.field("Op");
  }, ​
  checkop : function (value)​ {
    return value.field("OpFill") == this.field("Op");
  }, ​
  setnewdate : function (e, value) {
    //---if Date change : set new date
    if (value || my.gdate(oldUr.opdate) != my.gdate(​e.field("Date"))​) {
      e.set("Date", my.date(e.field("Date")));
    }​
    if (value || my.gdate(​oldUr.vsdate) != my.gdate(​e.field("VisitDate"))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }​
    if (value || my.gdate(​oldUr.dcdate) != my.gdate(​e.field("DischargeDate"))​) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }​
    if (value || my.gdate(​oldUr.apdate) != my.gdate(​e.field("AppointDate"))) {
      e.set("AppointDate", my.date(e.field("AppointDate")));
    }​
    if (value || my.gdate(​old​Ur.rcdate) != my.gdate(​e.field("RecordDate"))​) {
      e.set("RecordDate", my.date(e.field("RecordDate")));
    }​
  }, 
  setopextra : function (e) {
    let hd = libByName("Holidays")​;
    let hds = hd.entries()​;
    let holiday = false;
    let timeout = false;
    if(e.field("TimeIn")!=null)​
      if(e.field("TimeIn").getHours()<8 || e.field("TimeIn").getHours()>=16)​
        timeout = true;
    for(let i in hds)​ {
      if(my.gdate(hds[i].field("Date"))==my.gdate(e.field("Date"))​ &​& hds[i].field("Holiday") == true)​{
        holiday = true;
      }​
    }​
    if (holiday || timeout || my.gday(e.field("Date"))==6 || my.gday(e.field("Date"))==0) {
      e.set("OpExtra", true);
    }​
    else {
      e.set("OpExtra", false);
    }
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
    else if(oldUr.optype!=e.field("ORType")){
      if(e.field("ORType") == "GA" &​& my.gdate(e.field("VisitDate")) == my.gdate(e.field("Date"))){
        if (e.field("VisitType") == "OPD")​
          e.set("VisitType", "Admit")​;
        e.set("VisitDate", my.dateminus(e.field("Date"), 1));
      }
      else if(e.field("ORType") == "LA" &​& my.gdate(e.field("VisitDate")) == my.gdate(my.dateminus(e.field("Date"), 1))){
        e.set("VisitDate", my.date(e.field("Date")))​;
      }
    }
  }, 
  opresulteffect : function(e) {
    let opresult = e.field("OpResult").replace(/\s+/g, ' ').trim();
    e.set("OpResult", opresult);
    if(oldUr.result && opresult != "" && oldUr.result != opresult ) {
      let ondj = opresult.match(/dj/i);
      ondj = ondj==null?0:ondj.length;
      let opon = e.field("Op").match(/dj/i);
      opon = opon==null?0:opon.length;
      let offdj = opresult.match(/off|dj/ig);
      offdj = offdj==null?0:offdj.length;
      let opoff = e.field("Op").match(/off|dj/ig);
      opoff = opoff==null?0:opoff.length;
      let changedj = opresult.match(/change|dj/ig);
      changedj = changedj==null?0:changedj.length;
      let opchange = e.field("Op").match(/change|dj/ig);
      opchange = opchange==null?0:opchange.length;
      let notonly = opresult.match(/งดผ่า|งดเพราะ|งดcase/ig);
      notonly = notonly==null?0:notonly.length;
      let notdone = opresult.match(/ไม่มีคนเฝ้า|ผ่าแล้ว|ไม่พร้อม|นิ่วหลุด|ไม่มา|เลื่อน|ไม่อยาก|นัดผิด|ไม่ทำ|ไปผ่า/ig);
      notdone = notdone==null?0:notdone.length;

      if(notdone>0)​ {
        e.set("VisitType", "OPD")​;
        e.set("Status", "Not")​;
      }
      else if(notonly>0)​
        e.set("Status", "Not")​;
      else if(e.field("Status")!="Done")
        e.set("Status", "Done");

      if(changedj>1||opchange>1)
        e.set("DJstent", "change DJ");
      else if(offdj>1||opoff>1)
        e.set("DJstent", "off DJ");
      else if(ondj>0||opon>0)
        e.set("DJstent", "on DJ");
      else
        e.set("DJstent", "<none>");
    }
    else if(oldUr.result && opresult == "" &​& oldUr.result != opresult){
      e.set("Status", "Plan");
    }
  }, 
  runq : function (e) {
    que.getstart(e)​;
    let maxq = que.max()​;
    let lenq = que.q.length;
    let newq = 0;
    let eq = Number(e.field("Que")​)​;
    let qstr = "," + e.field("Que")​ + "," ;
    //---Status assign Que---//
    if (e.field("Status") == "Not" || e.field("ORType")​ == "LA" ) {
      e.set("Previous", e.field("Previous").replace(qstr, ",00,"))​;
      e.set("Que", "00") ;
      let near = que.findque(eq)​;
      if(near != undefined)​
        near.set("Que", "00")​;
      let hole = que.findhole()​;
      maxq += 1;​​
      while ( hole != 0​)​ { // found hole
        for (let i = hole+1 ; i<maxq; i++)​ {
          near = que.findque(i);
          if (near != undefined)​{
            qstr = "," + que.string(i) + "," ;
            near.set("Previous", near.field("Previous").replace(qstr, "," + que.string(hole) ​+ ","))​;
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
      e.set("Previous", e.field("Previous").replace(qstr, "," + que.string(newq) ​+ ","))​;
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
            qstr = "," + dup.field("Que")​+ "," ;
            dup.set("Previous", dup.field("Previous").replace(qstr, "," + near.field("Que") ​+ ","))​;
            dup.set("Que", near.field("Que"));
          }​
          else { //found hole
            qstr = "," + dup.field("Que") + "," ;
            dup.set("Previous", dup.field("Previous").replace(qstr, "," + que.string(i) ​+ ","))​;
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
            qstr = "," + dup.field("Que")​+ "," ;
            dup.set("Previous", dup.field("Previous").replace(qstr, "," + near.field("Que") ​+ ","))​;
            dup.set("Que", near.field("Que"));
          }​
          else { //found maxq
            qstr = "," + dup.field("Que")​+ "," ;
            dup.set("Previous", dup.field("Previous").replace(qstr, "," + que.string(i)​ ​+ ","))​;
            dup.set("Que", que.string(i))​;
            break;
          }​
          dup = que.finddup(dup);
        }    
      } 
      else if (dup == null &​& hole != 0)​ { // no dup, found hole
        e.set("Previous", e.field("Previous").replace(qstr, "," + que.string(hole)​ ​+ ","))​;
        e.set("Que", que.string(hole))​;
      }​
    }​
  }, 
  setDJstent : function (e) {
    let links = e.field("Patient")​;
    if (links.length>0) {
      if (links[0].field("DJStamp") == null) { // never ever DJStamp
        if(e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")​
          e.set("DJstent", "<none>")​;
      }​
      else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) > ntoday) { // ever DJStamp, future entry
        if (e.field("DJstent") != "<none>")​
          e.set("DJstent", "<none>")​ ;
      }​
      else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) <= ntoday) { // ever DJStamp, after Stamp but not future entry
        if (links[0].field("DJstent") == "<none>")​ {// ever off DJ, get only on DJ
          if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")​
            e.set("DJstent", "<none>")​ ;
        }​
        else { // ever on DJ or change DJ, get off or change DJ
          if (e.field("DJstent") == "on DJ")​
            e.set("DJstent", "<none>")​ ;
        }​
      }​
      else if (e.field("Date") < links[0].field("DJStamp"))​  {// edit entry before last DJStamp, can't edit
        if (oldUr.dj != null)​
          e.set("DJstent", oldUr.dj) ;
      }​
      else if (my.gdate(e.field("Date")) == my.gdate(links[0].field("DJStamp")))​ {// this entry is last DJStamp
        if (links[0].field("DJstent") == "<none>")​ {// this entry is off DJ, get only off or changeDJ​
        }​
        else { // this entry is on DJ, must check last DJStamp before
          let ptent = pt.findById(links[0].id) ;
          let d = this.lastDJStamp(ptent, my.dateminus(e.field("Date"), 1)) ;
          if (d != null &​& d.field("DJstent")​ != "off DJ"​) { // ever on or change DJ before -​> get only off or change DJ
            if (e.field("DJstent") == "on DJ") 
              e.set("DJstent", "<none>") ;
          }​ 
          else { // never on DJ or ever off DJ before -​> get only on DJ
            if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ") 
              e.set("DJstent" , "<none>") ;
          }​
        } 
      }​
    }​
  }, 
  lastDJStamp : function (e, date)  {
    let orlinks = e.linksFrom("UroBase", "Patient") ;
    let bulinks = e.linksFrom("Backup", "Patient") ;
    let o = null ;
    let last = null, r = null, u = null;
    if (orlinks.length>0) {
      for (let i in orlinks) {
        if (orlinks[i].field("DJstent") != "<none>"​ && orlinks[i].field("Date") > last && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)​) {
          last = orlinks[i].field("Date");
          r=i;
        }
      }
    }​
    if (bulinks.length>0)​ {
      for (let i in bulinks) {
        if (bulinks[i].field("DJstent") != "<none>"​ && bulinks[i].field("Date") > last && my.gdate(bulinks[i].field("Date")) <= my.gdate(date)​) {
          last = bulinks[i].field("Date");
          u=i;
        }
      }
    }​
    if (last != null)​{
      if (u==null)
        o ​= orlinks[r] ;
      else if (u!=null)​
        o = bulinks[u] ;
    }
    return o ;
  },
  setdxop : function(e){
    if(oldUr.dx!=e.field("Dx")&&e.field("Dx")!=''​)
      e.set("Dx", e.field("Dx").replace(/-|#/g, '').replace(/\s+/g, ' ').trim()​);
    if(oldUr.op!=e.field("Op")&&e.field("Op")!=''​)​
      e.set("Op", e.field("Op").replace(/-|#/g, '').replace(/\s+/g, ' ').trim()​);
  }, 
  createautofill : function (e) {
    if (e.field("Status")​ == "Not")​{ // Not set
      let dx = libByName("DxAutoFill")​;
      let dxlks = e.field("DxAutoFill");
      if(dxlks.length>0){
        let dxent = dx.findById(dxlks[0].id) ;
        
        e.set("DxAutoFill", null)​;
        let orlinks = dxent.linksFrom("UroBase", "DxAutoFill") ;
        let bulinks = dxent.linksFrom("Backup", "DxAutoFill") ;
        dxent.set("Count", orlinks.length+bulinks.length)​;​​​​
        if(orlinks.length+bulinks.length==0)​{
          dxent.trash()​;
        }​
      }​
    }​
    else if ( e.field("Dx").trim()​ != "" &​& e.field("Dx") != null
    &​& e.field("Op").trim() != "" &​& e.field("Op") != null)​ { // fill dx and op
      e.set("Dx", e.field("Dx"));
      e.set("Op", e.field("Op"));

      let dx = libByName("DxAutoFill");
      let dxs = dx.find(e.field("Dx"))​;
      let find = undefined;
      if (dxs.length > 0) {
        find = dxs.find(this.checkdx,e) ;
      }​
      if (find == undefined) { // dx and op never ever before
        let o = new Object()​;
        o["Dx"] = e.field("Dx");
        o["Op"] = e.field("Op")​;​
        dx.create(o);
        message("Create new AutoFill Successfully​")​;
        return dx.entries()[0];
      }
      else { // dx and op ever before​
        e.set("Dx", find.field("Dx")​)​;​
        e.set("Op", find.field("Op")​)​;​
        return find;
      }​
    }​
    return undefined;
  }​,​
  setx15 : function (e) {
    let str = e.field("Dx").toLowerCase​()​;
    let isstone = false;
    let isorextra = false;
    
    if ((str.indexOf("stone")!=-1 || str.indexOf("uc")!=-1​ || str.indexOf("rc")!=-1​ || str.indexOf("vc")!=-1 || str.indexOf("calculi")!=-1)​ &​& str.indexOf("orchi")==-1)  // match stone, not orchi
      isstone = true;
      
    if ((my.gday(e.field("Date")​)​==6 || my.gday(e.field("Date")​)​==0)​ )​
      isorextra = true;
    if (e.field("TimeIn") != null)​
      if (e.field("TimeIn").getHours() < 8 || e.field("TimeIn").getHours() >= 16)​
        isorextra = false;
   
    if(isstone &​& isorextra) {
      e.set("x1.5", true)​ ;
    }​
    else {
      e.set("x1.5", false)​ ;
    }​
  },
  createoplist : function (e) {
    if (e.field("Status")​ == "Not")​{ // Not set
      let op = libByName("OperationList")​;
      let oplks = e.field("OperationList");
      if(oplks.length>0){
        let opent = op.findById(oplks[0].id) ;
        
        e.set("OperationList", null)​;
        let orlinks = opent.linksFrom("UroBase", "OperationList") ;
        let bulinks = opent.linksFrom("Backup", "OperationList") ;
        opent.set("Count", orlinks.length+bulinks.length)​;​​​​
      }​
      e.set("Bonus", 0)​;
    }​
    else if (e.field("OpExtra")​ == false &​& e.field("Op").trim() != "" &​& e.field("Op") != null​){ // set regular op
      e.set("Op", e.field("Op"));
      e.set("Bonus", 0)​;
      let op = libByName("OperationList")​;
      let ops = op.find(e.field("Op")​);
      let find = undefined;
      if (ops.length > 0) {
        find = ops.find(this.checkop, e);
      }​
      if (find == undefined) { // set op never ever before
        let o = new Object()​;
        o["OpFill"] = e.field("Op");
        o["Price"] = e.field("Bonus")​;
        o["PriceExtra"] = Math.floor(e.field("Bonus")/2*3)​;
        
        op.create(o);
        message("Create new OpList Successfully​")​;
        return op.entries()[0];
      }
      else { // set op ever before​
        e.set("Op", find.field("OpFill")​)​;​
        return find;
      }​
    }​
    else if (e.field("Op").trim()​ != "" &​& e.field("Op") != null)​ { // set extra op
      e.set("Op", e.field("Op"));
      let op = libByName("OperationList")​;
      let ops = op.find(e.field("Op"));
      let find = undefined;
      if (ops.length > 0) {
        find = ops.find(this.checkop, e);
      }​
      if (find == undefined) { // set extra op never ever before
        let o = new Object()​;
        o["OpFill"] = e.field("Op")​; 
        if (e.field("x1.5")​==true) {
          o["Price"] = Math.floor(e.field("Bonus")/3*2)​;
          o["PriceExtra"] = e.field("Bonus")​;
        }​
        else {       
          o["Price"] = e.field("Bonus")​;
          o["PriceExtra"] = Math.floor(e.field("Bonus")/2*3)​;        
        }​

        op.create(o);
        message("Create new OpList Successfully​")​;
        return op.entries()[0];
      }
      else { // set extra op ever before​
        e.set("Op", find.field("OpFill")​)​;​
        if (e.field("x1.5")​==true) {
          e.set("Bonus", find.field("PriceExtra")​)​;
        }​
        else {
          e.set("Bonus", find.field("Price")​)​;
        }​
        return find;
      }​
    }​
    return undefined;
  }​,
  updatedxop : function (e, type, dxop)​ {​
    if (type=="dx")​{
      if(dxop!=undefined)​{
        e.set("DxAutoFill", dxop)​;
        
        let orlink = dxop.linksFrom("UroBase", "DxAutoFill");
        let bulink = dxop.linksFrom("Backup", "DxAutoFill");​
        dxop.set("Count", orlink.length+bulink.length)​;​​​​
      }​
      if((oldUr.dx != e.field("Dx")​ &​& oldUr.dx != "" &​& oldUr.dx)​ || 
          (oldUr.op != e.field("Op")​ &​& oldUr.op != "" &​& oldUr.opl)​)​ { //update old dx in dxautofill
        let dx = libByName("DxAutoFill");
        let dxs = dx.find(oldUr.dx)​;
        let find = undefined;
        if (dxs.length > 0) {
          for(let i in dxs)​{
            if(dxs[i]​.field("Dx")​==oldUr.dx ​&& dxs[i]​.field("Op")​==oldUr.op​)​
              find = dxs[i]​ ;​
          }​
        }​
        if (find != undefined)​ { // found old dx -​> update count in dxautofill
          let orlink = find.linksFrom("UroBase", "DxAutoFill");
          let bulink = find.linksFrom("Backup", "DxAutoFill");​
          find.set("Count", orlink.length+bulink.length)​;​​​​
          if(find.field("Count")​==0)​
            find.trash()​;
        }​
      }
    }​
    else { //type=="op"
      if(dxop!=undefined)​{
        e.set("OperationList", dxop)​;​
        
        let orlink = dxop.linksFrom("UroBase", "OperationList");
        let bulink = dxop.linksFrom("Backup", "OperationList");​
        dxop.set("Count", orlink.length+bulink.length)​;​​​​
      }​
      if(oldUr.op != e.field("Op")​ &​& oldUr.op != "" &​& oldUr.op)​ { //update old op in oplist
        let op = libByName("OperationList")​;
        let ops = op.find(oldUr.op)​;
        let find = undefined;
        if (ops.length > 0) {
          for(let i in ops)​{
            if(ops[i]​.field("OpFill")​==oldUr.op​)​
              find = ops[i]​ ;​
          }
        }​
        if (find != undefined)​ { // found old op -​> update count in oplist
          let orlink = find.linksFrom("UroBase", "OperationList");
          let bulink = find.linksFrom("Backup", "OperationList");​
          find.set("Count", orlink.length+bulink.length)​;​​​​
          if(find.field("Count")​==0)​
            find.trash()​;​
        }​
      }​
    }​
  }, 
  deletedxop : function (e)​{
    //Dx
    let dx = libByName("DxAutoFill")​;
    let dxlks = e.field("DxAutoFill")​;
    if (dxlks.length>0) {
      let dxent = dx.findById(dxlks[0].id) ;
      let orlinks = dxent.linksFrom("UroBase", "DxAutoFill") ;
      let bulinks = dxent.linksFrom("Backup", "DxAutoFill") ;
      dxent.set("Count", orlinks.length+bulinks.length)​;​​​​
      if(dxent.field("Count")​==0)​
            dxent.trash()​;
    }​
    //Op
    let op = libByName("OperationList")​;
    let oplks = e.field("OperationList")​;
    if (oplks.length>0) {
      let opent = op.findById(oplks[0].id) ;
      let orlinks = opent.linksFrom("UroBase", "OperationList") ;
      let bulinks = opent.linksFrom("Backup", "OperationList") ;
      opent.set("Count", orlinks.length+bulinks.length)​;​​​​
    }​
  }, 
  deletept : function (e)​{
    //Pt
    let ptlks = e.field("Patient");
    if (ptlks.length>0)​ {
      let ptent = pt.findById(ptlks[0].id) ;
      let orlinks = ptent.linksFrom("UroBase", "Patient") ;
      let bulinks = ptent.linksFrom("Backup", "Patient") ;
      let cslinks = ptent.linksFrom("Consult", "Patient") ;
      if(orlinks.length+bulinks.length+cslinks.length==0)​{
        ptent.trash()​;
      }​
    }
  }, 
  deleterp : function (e)​{
    //Report
    let ptlks = e.field("Patient");
    if (ptlks.length>0)​ {
      let ptent = pt.findById(ptlks[0].id) ;
      let rplinks = ptent.linksFrom("Report", "Patient") ;
      if(rplinks.length>0)​{
        for (let r in rplinks)​{
          if (my.gdate(rplinks[r].field("OpDate"))​ == my.gdate(e.field("Date"))​ &​& rplinks[r].field("Dx") ==​ e.field("Dx") &​& rplinks[r].field("Op") ==​ e.field("Op"))​{
            rplinks[r].trash();
            break;
          }​
        }​
      }​
    }
  }, 
  updateDJStamp : function (e) {
    let links = e.field("Patient")​;
    if (links.length>0) {
      let ptent = pt.findById(links​[0].id) ;
      let d = this.lastDJStamp(ptent, today) ;
      if (d==null) { // not found
        links[0].set("DJstent", "<none>");
        links[0].set("DJStamp", null)​;
      } 
      else { // found off, on, change DJ before
        if (d.field("DJstent") == "off DJ") ​{
          links[0].set("DJstent", "<none>");
          links[0].set("DJStamp", d.field("Date"));
        }​
        else ​{
          links[0].set("DJstent", "on DJ");
          links[0].set("DJStamp", d.field("Date"));
        }​
      }
    }
  }, 
  resetcolor : function(all) {
    let thislib = "" ;
    if (lib().title=="UroBase")
      thislib = "uro" ;
    else
      thislib = "backup" ;
    for (let i in all)​ {
      if (ntoday​>my.gdate(all[i]​.lastModifiedTime)) {
        fill.color(all[i]​, thislib)​;
        this.setfuture(all[i])​;​
      }
    } 
  }, 
  setfuture : function(e)​{
    if(my.gdate(e.field("Date"))>=ntoday​)​
      e.set("Future", Math.floor((my.gdate(e.field("Date")​)-ntoday)​/86400000))​;
    else
      e.set("Future", null)​;
  }​
}​;

var cso = {
  setnewdate : function (e, value) {
    //---if Date change : set new date
    if (value || my.gdate(oldCs.csdate) != my.gdate(​e.field("ConsultDate"))​) {
      e.set("ConsultDate", my.date(e.field("ConsultDate")));
    }​
    if (value || my.gdate(​oldCs.vsdate) != my.gdate(​e.field("VisitDate"))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }​
    if (value || my.gdate(​oldCs.dcdate) != my.gdate(​e.field("DischargeDate"))​) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }​
    if (value || my.gdate(​oldCs.apdate) != my.gdate(​e.field("AppointDate"))) {
      e.set("AppointDate", my.date(e.field("AppointDate")));
    }​
  }, 
  setvisitdate ​: function (e)​ {
    if (e.field("EntryMx")​== "Pending" &​& e.field("VisitDate") == null) {
      if (e.field("VisitType") == "Admit")​
        e.set("VisitDate", my.dateminus(e.field("ConsultDate"), 1));
      else
        e.set("VisitDate", e.field("ConsultDate")​)​;
    }​
  }, 
  resetcolor : function(all) {
    for (let i in all)​ {
      if (ntoday​>my.gdate(all[i]​.lastModifiedTime)) {
        fill.color(all[i]​, "consult")​;
      }
    } 
  }​
}​;
var rpo = {
  setreport : function (e) {
    if (e.field("Status") != oldUr.status) { //change status
      if (e.field("Status") != "Not") { //status <> "Not" 
        if (my.gdate(e.field("Date"))​ != my.gdate(oldUr.opdate)​ || (e.field("Patient").length>0 &​& e.field("Patient")[0].title != oldUr.patient)​ || e.field("Dx") != oldUr.dx || e.field("Op") != oldUr.op) { //change Date, Pt, Dx, Op
          this.updatenew(e)​;
          this.deleteold()​;
        }​
        else { //unchange Date, Pt, Dx, Op
          this.updatenew(e)​;
        }​
      }​
      else { //status == "Not" 
        this.deleteold()​;
      }​
    }​
    else { // unchange status
      if (e.field("Status") != "Not") { //status <> "Not" 
        if (my.gdate(e.field("Date"))​ != my.gdate(oldUr.opdate)​ || (e.field("Patient").length>0 &​& e.field("Patient")[0].title != oldUr.patient)​ || e.field("Dx") != oldUr.dx || e.field("Op") != oldUr.op) { //change Date, Pt, Dx, Op
          this.updatenew(e)​;
          this.deleteold()​;
        }​
      }​
    }​
  },
  updatenew : function (e) {
    let wd = my.gday(e.field("Date")​)​ ;
    let wdt = "" ;
    if (wd==0)​ wdt = "Sun" ;
    else if (wd==1)​ wdt = "Mon" ;
    else if (wd==2)​ wdt = "Tue" ;
    else if (wd==3)​ wdt = "Wed" ;
    else if (wd==4)​ wdt = "Thu" ;
    else if (wd==5)​ wdt = "Fri" ;
    else if (wd==6)​ wdt = "Sat" ;
    
    let found = false;​
    let rpt = undefined;
    let ptlks = e.field("Patient")​;
    if (ptlks.length>0) {
      let ptent = pt.findById(ptlks​[0].id) ;
      let rps = ptent.linksFrom("Report", "Patient")​;
      if (rps.length>0) {
        for (let r in rps)​{
          if (my.gdate(rps[r].field("OpDate"))​ == my.gdate(e.field("Date"))​ &​& rps[r].field("Dx") ==​ e.field("Dx") &​& rps[r].field("Op") ==​ e.field("Op"))​{
            found = true;
            rpt = rps[r]​;
            break;
          }​
        }​
      }​
    }​
    if(found)​{ //edit 
      //---Date, Patient, Dx, Op, ORType, Extra, LOS
      rpt.set("ORType", e.field("ORType"));
      rpt.set("Extra", e.field("OpExtra"));
      rpt.set("LOS", e.field("LOS"));
      //---OpGroup, Organ
      if (e.field("OperationList").length>0)​{
        rpt.set("OpGroup", e.field("OperationList")[0].field("OpList"));
        rpt.set("Organ", e.field("OperationList")[0].field("OpGroup").join(" ")​);
      }​
      //---OpLength
      if (e.field("TimeOut") > e.field("TimeIn"))​ {
        rpt.set("OpLength", e.field("TimeOut")-e.field("TimeIn"))​;
      }​
      else if (e.field("TimeIn") > e.field("TimeOut"))​ {
        rpt.set("OpLength", 86400000-(e.field("TimeIn")-e.field("TimeOut"))​);
      }​
      else {
        rpt.set("OpLength", null)​;
      }​
      //---WeekDay
      rpt.set("WeekDay", wdt)​;
      //---Dead
      if(e.field("Patient").length>0 && e.field("Patient")​[0].field("Status")=="Dead")
        rpt.set("Dead","Dead");
      else
        rpt.set("Dead","Alive");
    }​
    else { // not found, create new
      let ent = new Object();
      //---Date, Patient, Dx, Op, ORType, Extra, LOS
      ent["OpDate"] = e.field("Date");
      ent["Dx"]​ = e.field("Dx");
      ent["Op"]​ = e.field("Op");
      ent["ORType"] = e.field("ORType");
      ent["Extra"]​ = e.field("OpExtra");
      ent["LOS"]​ = e.field("LOS");
      //---OpGroup, Organ
      if (e.field("OperationList").length>0)​{
        ent["OpGroup"] = e.field("OperationList")[0].field("OpList");
        ent["Organ"]​ = e.field("OperationList")[0].field("OpGroup").join(" ")​;
      }​
      //---OpLength
      if (e.field("TimeOut") > e.field("TimeIn"))​ {
        ent["OpLength"]​ =  e.field("TimeOut")-e.field("TimeIn");
      }​
      else if (e.field("TimeIn") > e.field("TimeOut"))​ {
        ent["OpLength"]​ = 86400000-(e.field("TimeIn")-e.field("TimeOut"))​;
      }​
      else {
        ent["OpLength"]​ =  null;
      }​
      //---WeekDay
      ent["WeekDay"]​ =  wdt;
      //---Dead
      if(e.field("Patient").length>0 && e.field("Patient")​[0].field("Status")=="Dead")
        ent["Dead"]​ = "Dead";
      else
        ent["Dead"]​ = "Alive";
      rp.create(ent);
      let rplast = rp.entries()​[0];
      if(e.field("Patient").length>0){
        rplast.link("Patient", e.field("Patient")​[0]);
      }​
    }​
  }, 
  deleteold : function () {
    let ptlks = pt.find(oldUr.patient)​;
    if (ptlks.length>0) {
      let ptent = pt.findById(ptlks[0].id);
      let rps = ptent.linksFrom("Report", "Patient")​;
      if (rps.length>0) {
        for (let r in rps)​{
          if (my.gdate(rps[r].field("OpDate"))​ == my.gdate(oldUr.opdate)​ &​& rps[r].field("Dx") ==​ oldUr.dx &​& rps[r].field("Op") ==​ oldUr.op)​{
            rps[r].trash();
            break;
          }​
        }​
      }​
    }​
  }​
}​;
var trig = {
  PatientOpenEdit : function(e) {
    oldPt.save(e);
  },
  PatientBeforeEdit : function (e, value)​ {
    pto.rearrangename(e);
    oldPt.load(e);
    if (value=="create")
      pto.uniqueHN(e, true)​;
    else if (value=="update")​
      pto.uniqueHN(e, false)​;
    pto.age(e)​;
    pto.status(e)​;
    pto.dj(e)​;
  }, 
  PatientUpdatingField ​: function (all) {
    let e = entry()​;
    for(let i in all) {
      // update track
      if(all[i].id==e.id &​& all[i].field("Done")​==true) {
        pto.donesettrack(all[i])​;
        break;
      }​
    }​
  }, 
  PatientBeforeOpenLib : function (all) {
    pto.resetdone(all)​;
  }, 
  PatientBeforeLink : function (e)​ {
    oldPt.load(e);
    pto.age(e)​;
  }, 
  UroOpenEdit : function (e)​ {
    oldUr.save(e)​;
  }, 
  UroBeforeEdit : function (e, value)​ {
    oldUr.load(e)​;
    if (value=="create")
      uro.setnewdate(e, true)​;
    else if (value=="update")​{
      uro.setnewdate(e, false)​;
    }​
    uro.setdxop​(e)​;
    uro.opresulteffect(e);
    uro.setfuture(e)​;
    uro.setopextra(e)​;
    uro.setvisitdate(e)​;
    fill.track​(e, "uro")​;
    if (value=="create")
      mer.merge(e, false)​;
    else if (value=="update")​
      mer.merge(e, true)​;
    uro.setDJstent(e)​;
    let dxe = uro.createautofill​(e)​;
    uro.setx15(e)​;
    let ope = uro.createoplist(e)​;
    if(dxe!=undefined)​
      uro.updatedxop​(e, "dx", dxe)​;
    if(ope!=undefined)​
      uro.updatedxop​(e, "op", ope)​;
    uro.runq(e)​;
    fill.underlying(e)​;
    fill.los(e)​;
  }, 
  UroAfterEdit : function (e, value) {
    oldUr.load(e)​;
    fill.ptstatus(e)​;
    fill.color(e, "uro")​;
    mer.other(e)​;
    emx.flu(e)​;
    emx.setor(e)​;
    uro.updateDJStamp(e)​;
    rpo.setreport(e)​;
  }, 
  UroBeforeViewCard ​: function (e) {​
    fill.color(e, "uro")​;
  }, 
  UroBeforeOpenLib : function (all) {
    uro.resetcolor(all)​;
  }, 
  UroUpdatingField : function (all) {
    for(let i in all) {
      // update que
      oldUr.load(all[i]​)​;
      if(all[i].field("Que")​!=oldUr.que &​& all[i].field("ORType")​=="GA" &​& all[i].field("Status") != "Not" && oldUr.que) {
        all[i].set("Previous",  all[i].field("Previous").replace("," + oldUr.que + ",", "," + all[i].field("Que")​ + ","));
        uro.runq(all[i]​)​; 
        break;
      }​
    }
  }, 
  UroBeforeDelete : function (e)​ {
    if (e.field("Merge")​==true)​ {
      e.set("Merge", false)​
      mer.mlacancel(e)​;
    }
  }, 
  UroAfterDelete : function (e)​ {
    uro.deletedxop(e)​;
    uro.deleterp(e)​;
    uro.deletept(e)​;
  }, 
  BackupOpenEdit : function (e)​ {
    oldUr.save(e)​;
  }, 
  BackupBeforeEdit : function (e, value)​ {
    oldUr.load(e)​;
    if (value=="create")
      uro.setnewdate(e, true)​;
    else if (value=="update")​{
      uro.setnewdate(e, false)​;
    }​
    uro.setdxop​(e)​;
    uro.opresulteffect(e);
    uro.setfuture(e)​;
    uro.setopextra(e)​;
    uro.setvisitdate(e)​;
    fill.track​(e, "backup")​;
    if (value=="create")
      mer.merge(e, false)​;
    else if (value=="update")​
      mer.merge(e, true)​;
    uro.setDJstent(e)​;
    let dxe = uro.createautofill​(e)​;
    uro.setx15(e)​;
    let ope = uro.createoplist(e)​;
    if(dxe!=undefined)​
      uro.updatedxop​(e, "dx", dxe)​;
    if(ope!=undefined)​
      uro.updatedxop​(e, "op", ope)​;
    uro.runq(e)​;
    fill.underlying(e)​;
    fill.los(e)​;
  }, 
  BackupAfterEdit : function (e, value) {
    oldUr.load(e)​;
    fill.ptstatus(e)​;
    fill.color(e, "uro")​;
    mer.other(e)​;
    emx.flu(e)​;
    emx.setor(e)​;
    uro.updateDJStamp(e)​;
    rpo.setreport(e)​;
  }, 
  BackupBeforeViewCard ​: function (e) {​
    fill.color(e, "uro")​;
  }, 
  BackupBeforeOpenLib : function (all) {
    uro.resetcolor(all)​;
  }, 
  BackupUpdatingField : function (all) {
    for(let i in all) {
      // update que
      oldUr.load(all[i]​)​;
      if(all[i].field("Que")​!=oldUr.que &​& all[i].field("ORType")​=="GA" &​& all[i].field("Status") != "Not" && oldUr.que) {
        all[i].set("Previous",  all[i].field("Previous").replace("," + oldUr.que + ",", "," + all[i].field("Que")​ + ","));
        uro.runq(all[i]​)​; 
        break;
      }​
    }
  }, 
  BackupBeforeDelete : function (e)​ {
    if (e.field("Merge")​==true)​ {
      e.set("Merge", false)​
      mer.mlacancel(e)​;
    }
  }, 
  BackupAfterDelete : function (e)​ {
    uro.deletedxop(e)​;
    uro.deleterp(e)​;
    uro.deletept(e)​;
  }, 
  ConsultOpenEdit : function (e)​ {
    oldCs.save(e)​;
  }, 
  ConsultBeforeEdit : function (e, value)​ {
    oldCs.load(e)​;
    if (value=="create")
      cso.setnewdate(e, true)​;
    else if (value=="update")​ {
      cso.setnewdate(e, false)​;
    }​
    cso.setvisitdate(e)​;
    fill.track​(e, "consult")​;
    if (value=="create")
      mer.merge(e, false)​;
    else if (value=="update")​
      mer.merge(e, true)​;
    fill.underlying(e)​;
    fill.los(e)​;
  },
  ConsultAfterEdit : function (e, value) {
    oldCs.load(e)​;
    fill.ptstatus(e)​;
    fill.color(e, "consult")​;
    mer.other(e)​;
    emx.flu(e)​;
    emx.setor(e)​;
  }, 
  ConsultBeforeViewCard ​: function (e) {​
    fill.color(e, "consult")​;
  }, 
  ConsultBeforeOpenLib : function (all) {
    cso.resetcolor(all)​;
  }, 
  ConsultBeforeDelete : function (e)​ {
    if (e.field("Merge")​==true)​ {
      e.set("Merge", false)​
      mer.mlacancel(e)​;
    }
  }, 
  ConsultAfterDelete : function (e)​ {
    uro.deletept(e);
  }
}​;
