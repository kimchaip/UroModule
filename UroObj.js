var pt = libByName("Patient") ;​
var or = libByName("UroBase") ;​
var cs = libByName("Consult") ;
var bu = libByName("Backup") ;
var rp = libByName("Report")​;
var os = libByName("OpUroSx");

var old = {
    d : {}, 
    load : function (e) {
      //get Previous to Obj
      this.d = JSON.parse(e.field("Previous"), function (key, value) {
        if (value) {
          if (typeof value == "string" && value.match(/\d+\-\d+\-\d+T\d+/)) {
            return new Date(value);
          }
          else {
            return value;
          }
        }
        else {
          if (value==false || value==0 || value=="") {
            return value;
          }
          else {
            return null;
          }
        }
      });
    },
    save : function (e) {
      //save field value to Obj and set to Previous
      if(lib().title=="Patient") {
        this.d["PtName"] = e.field("PtName"); 
        this.d["Age"] = e.field("Age");
        this.d["YY"] = e.field("YY");
        this.d["MM"] = e.field("MM");
        this.d["DD"] = e.field("DD"); 
        this.d["Birthday"] = e.field("Birthday");
        this.d["HN"] = e.field("HN");
        this.d["HNBar"] = e.field("HNBar");
        this.d["Underlying"] = e.field("Underlying");
        this.d["VIP"] = e.field("VIP");
        this.d["Allergies"] = e.field("Allergies");
        this.d["DJstent"] = e.field("DJstent");
        this.d["DJStamp"] = e.field("DJStamp");
        this.d["Status"] = e.field("Status");
        this.d["Done"] = e.field("Done");
        this.d["Ward"] = e.field("Ward");
        this.d["WardStamp"] = e.field("WardStamp");
        this.d["Address"] = e.field("Address");
        this.d["Phone"] = e.field("Phone");
        this.d["Contact"] = e.field("Contact");
        this.d["Descript"] = e.field("Descript");
      }
      else {
        this.d["Patient"] = e.field("Patient").length? e.field("Patient")​[0].title: ""; 
        this.d["PastHx"] = e.field("PastHx");
        this.d["InvResult"] = e.field("InvResult");
        this.d["Dx"] = e.field("Dx");
        this.d["VisitType"] = e.field("VisitType");
        this.d["VisitDate"] = e.field("VisitDate");
        this.d["Ward"] = e.field("Ward");
        this.d["Merge"] = e.field("Merge");
        this.d["EntryMx"] = e.field("EntryMx");
        this.d["AppointDate"] = e.field("AppointDate");
        this.d["Operation"] = e.field("Operation");
        this.d["Color"] = e.field("Color");
        this.d["MergeID"] = e.field("MergeID");
        this.d["Photo"] = e.field("Photo"); 
        this.d["DischargeDate"] = e.field("DischargeDate");
        this.d["LOS"] = e.field("LOS");
        this.d["Summary"] = e.field("Summary");
        this.d["Track"] = e.field("Track");
      }
      if(lib().title=="UroBase" || lib().title=="Backup") {
        this.d["Date"] = e.field("Date")​;
        this.d["DxAutoFill"] = e.field("DxAutoFill").length? e.field("DxAutoFill")[0].title: "";
        this.d["Op"] = e.field("Op");
        this.d["OperationList"] = e.field("OperationList").length? e.field("OperationList")​[0].title: "";
        this.d["AutoOpExtra"] = e.field("AutoOpExtra");
        this.d["OpExtra"] = e.field("OpExtra");
        this.d["x1.5"] = e.field("x1.5");
        this.d["Bonus"] = e.field("Bonus");
        this.d["ORType"] = e.field("ORType");
        this.d["Que"] = e.field("Que");
        this.d["Dr"] = e.field("Dr");
        this.d["RecordDate"] = e.field("RecordDate");
        this.d["Future"] = e.field("Future");
        this.d["Status"] = e.field("Status");
        this.d["OpResult"] = e.field("OpResult");
        this.d["DJstent"] = e.field("DJstent");
        this.d["TimeIn"] = e.field("TimeIn");
        this.d["TimeOut"] = e.field("TimeOut");
        this.d["OpDateCal"] = e.field("OpDateCal");
        this.d["OpLength"] = e.field("OpLength");
      }
      else if(lib().title=="Consult") {
        this.d["ConsultDate"] = e.field("ConsultDate");
        this.d["Rx"] = e.field("Rx");
        this.d["Note"] = e.field("Note");
      }
      
      e.set("Previous", JSON.stringify(this.d));
    },
    field : function (fieldname) {
      //get data by field
      if(fieldname in this.d)
        return this.d[fieldname];
      
    }
};

var mer = {
  m: [],
  l: null,
  load: function(e) {
    let marr = JSON.parse(e.field("MergeID"));
    this.m = marr.map(o=>{
      o.e = libByName(o.lib).findById(o.e.id);
    });
  },
  save: function(e, mergeobj) {
    let m = mergeobj.map(v=>{
      if(v) {
        v.e = v.e.id;
      }
      return v;
    });
    
    e.set("MergeID", JSON.stringify(m));
  },
  findInx: function(e) {
    if(this.m.length>0)
      return this.m.findIndex(v=>v.e.id==e.id);
    else
      return -1;
  },
  append: function(lib, e) {
    let o = new Object();
    o["lib"] = lib;
    o["e"] = e;
    
    this.m.push(o);
  },
  newmergeid: function(e) {
    let o = [{"lib":lib().title, "e":e.id}];
    e.set("MergeID", JSON.stringify(o));
  },
  sort: function(e) {
    this.m = this.m.sort((a,b)=>{
      let q1, q2;
      if (a.lib!="UroBase") 
        q1 = my.gdate(a.e.field("Date"));
      else
        q1 = my.gdate(a.e.field("ConsultDate"));
        
      if (b.lib!="UroBase") 
        q2 = my.gdate(b.e.field("Date"));
      else
        q2 = my.gdate(b.e.field("ConsultDate"));
      
      if (q1==q2)
        return my.qdate(a.e.creationTime)-my.qdate(b.e.creationTime);
      else
        return q1-q2;
    });
  },
  setall: function(key, value) {
    this.m.forEach(o=>{
      o.e.set(key, value);
    });
  },
  colorall: function(e) {
    this.m.forEach(o=>fill.color(o.e, o.lib));
  },
  fieldall: function(e) {
    let range = ["VisitDate","PastHx","InvResult","VisitType","Ward","DischargeDate","Track","Summary","Underlying"];
    for(let i = 0; i<range.length; i++) {
      let inx = this.findInx(e);
      if(range[i].indexOf("Date")>-1) {
        if(my.gdate(e.field(range[i]))!=my.gdate(old.field(range[i])))
          this.setall(range[i],  e.field(range[i]));
      }
      else if (range[i] == "VisitType") {
        if(e.field(range[i])!="Admit")
          e.set(range[i], "Admit");
      }
      else {
        if(e.field(range[i])!=old.field(range[i]))
          this.setall(range[i],  e.field(range[i]));
      }         
    }
  },
  findLast: function(e) {
    if (e.field("Patient").length>0) {
      let ptent = pt.findById(e.field("Patient")[0].id);
      let date = e.field("VisitDate");
      return pto.findLast(ptent, date, e.id);
    }
    return null;
  },
  run: function(e) {
    this.load(e);
    let mergeobj = this.findLast(e);
    if (mergeobj) {
      this.append(mergeobj.lib, mergeobj.e);
      this.sort(e);
      this.save(e, this.m);
      this.setall("MergeID", e.field("MergeID"));
    }
    else {
      message("Can't find Last Admit!");
    }
  },
  cancel: function(e) {
    this.load(e);
    this.sort(e);
    let inx = this.findInx(e);
    let mergeobj = null;
    if (inx>-1 && this.m.length>1) {
      mergeobj = this.m.splice(inx, 1);
      if (inx==0) {  // cancel parent
        this.save(e, mergeobj);
        // other child.VSDate, MergeID is changed
        let o = this.m[0].e;
        if (this.m[0].lib!="Consult")
          this.setall("VisitDate", my.dateminus(o.field("Date"), 1));
        else
          this.setall("VisitDate", my.dateminus(o.field("ConsultDate"), 1));
        
        this.save(o, this.m);
        this.setall("MergeID", o.field("MergeID"));
      }
      else {  // inx>0: cancel child
        if (lib().title!="Consult")
          e.set("VisitDate", my.dateminus(e.field("Date"), 1));
        else
          e.set("VisitDate", my.dateminus(e.field("ConsultDate"), 1));
        if (my.gdate(e.field("VisitDate"))>ntoday) {
          e.field("Ward", "Uro");
          e.field("DischargeDate", null);
          e.field("Track", 0);
          e.field("Summary", false);
        }
        this.save(e, mergeobj);
        // other mergeobj.MergeID is changed
        let o = this.m[0].e;  // parent
        this.save(o, this.m);
        this.setall("MergeID", o.field("MergeID"));
      }
    }
  },
  merge: function(e) {
    if (e.field("Merge")​!=old.field("Merge")​)​ {
      if (e.field("Merge")​) {
        this.run(e)​;
      }
      else {
        this.cancel(e);
      }
    }
  },
  effect: function(e) {
    this.load(e);
    this.fieldall(e);
    this.colorall(e);
  }
};
var que = {
  q: [],​
  load: function(e) {  // load entry to q
    all = lib().entries();
    q = all.filter(v=>my.gdate(v.field("Date"))==my.gdate(e.field("Date")) && v.field("ORType")=="GA" && v.field("Status")!="Not");
  },
  save: function(e) {
    // reorder by TimeIn
    this.sorttime();
    // set new que to every entry
    q.forEach((v,i)=>{
      v.set("Que", ("0"+(i+1)).slice(-2));
      this.oldsave(v);
    }, this);
  },
  oldsave: function (e) {
    // get que data
    let qstr = '"Que":"' + e.field("Que") + '"';
    // replace to "que":"xx" in previous
    let previous = e.field("Previous").replace(/"Que":"\d\d"/, qstr);
    // set new previous
    e.set("Previous", previous);
  },
  sortque: function(e) {
    // order q by que asc except this entry use old que
    q = q.sort((a,b)=>a.field("Que")-b.field("Que"));
  },
  sorttime: function(e) {
    // order q by TimeIn asc (if any is null, TimeIn is max)
    q = q.sort((a,b)=>{
      let q1 = a.field("TimeIn")? my.gdate(a.field("TimeIn")): 86400000;
      let q2 = b.field("TimeIn")? my.gdate(b.field("TimeIn")): 86400000;
      return q1-q2;
    });
  },
  findInx: function(e) {
    //q.findIndex by this entry.id
    if(q.length>0)
      return q.findIndex(v=>v.id==e.id);
    else
      return -1;
  },
  insert: function(e) {
    // remove this entry from q if found
    this.remove(e);
    // get this que
    let thisq = Number(e.field("Que"));
    if (thisq>0)  // thisq > 0
      // insert this entry to position by que
      q.splice(thisq-1, 0, e);
    else  // thisq <= 0
      // append this entry to q
      q.push(e);
  },
  remove: function(e) {
    // findInx and remove this entry from q
    let inx = this.findInx(e);
    if(inx>-1)
      q.splice(inx, 1);
    
  },
  run: function (e) {
    if (my.gdate(e.field("TimeIn")) != my.gdate(old.field("TimeIn")) || e.field("Que") != old.field("Que") || e.field("Status") != old.field("Status") || e.field("ORType") != old.field("ORType")) {
      // load old entry to q
      this.load(e);
      // remove old e or insert new e
      if (e.field("Status") == "Not" || e.field("ORType")​ == "LA") {  // change Status -> Not or ORType -> LA
        this.remove(e);
        e.set("Que", "00");
      }
      else {  // change Status -> !Not and ORType -> GA
        this.insert(e);
      }
      // sort q by que
      this.sortque(e);
      // update when Que change and !Not and GA
      if (e.field("Que") != old.field("Que") && e.field("Status") != "Not" && e.field("ORType")​ == "GA") {
        // insert this entry to q at position que
        this.insert(e);
      }
      //reorder by TimeIn -> set new que to every entry
      this.save(e);
    }
  }
};
var emx = {
  createnew : function  (e, libto)​ {
    let ob = {}​;
    let libname = "", field1 = "";
    let libfrom = lib().title;
    let min = 0,​ defau = "" ;
    if (libto == "UroBase" &​& libfrom == "UroBase") {
      libname = "UroBase";
      field1 = "Date" ;
      min = 1;
      defau = "<Default>";
    }​
    else if (libto == "Consult" &​& libfrom == "UroBase")​ {​
      libname = "Consult";
      field1 = "ConsultDate" ;
      min = 0;
      defau = "<Default>";
    }​
    else if (libto == "UroBase" &​& libfrom == "Backup") {
      libname = "UroBase";
      field1 = "Date" ;
      min = 0;
      defau = "<Default>";
    }​
    else if (libto == "Consult" &​& libfrom == "Backup")​ {​
      libname = "Consult";
      field1 = "ConsultDate" ;
      min = 0;
      defau = "<Default>";
    }​
    else if (libto == "UroBase" &​& libfrom == "Consult" ) {​
      libname = "UroBase";
      field1 = "Date" ;
      min = 0;
      defau = "Pending";
    }​
    else if (libto == "Consult" &​& libfrom == "Consult") {​
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
        ent​["InvResult"] = e.field("InvResult");
        if (libto == "UroBase" &​& libfrom == "UroBase") {
          ent​["Op"] = e.field("Operation")​;
          let newdx = fill.mostdxbyop(e.field("Operation"));
          ent["Dx"] = newdx?newdx:e.field("Dx")​;
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
        else if (libto == "Consult" &​& libfrom == "UroBase") {
          ent​["Dx"] = e.field("Dx")​;
          ent​["VisitType"] = "OPD";
          ent​["VisitDate"] = my.date(e.field("AppointDate")​);
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
        }​
        else if (libto == "UroBase" &​& libfrom == "Backup") {
          ent​["Op"] = e.field("Operation")​;
          let newdx = fill.mostdxbyop(e.field("Operation"));
          ent["Dx"] = newdx?newdx:e.field("Dx")​;
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
        else if (libto == "Consult" &​& libfrom == "Backup") {
          ent​["Dx"] = e.field("Dx")​;
          ent​["VisitType"] = "OPD";
          ent​["VisitDate"] = my.date(e.field("AppointDate")​);
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
        }​
        else if (libto == "UroBase" &​& libfrom == "Consult" ) {​
          ent​["VisitDate"] = my.dateminus(e.field("AppointDate"), 1)​;
          ent​["RecordDate"] = today​;
	  ent​["Op"] = e.field("Operation")​;
          let newdx = fill.mostdxbyop(e.field("Operation"));
          ent["Dx"] = newdx?newdx:e.field("Dx")​;
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
          if(my.gdate(ent​[field1])​>=ntoday​)​
            ent​["Future"] = ​Math.floor((my.gdate(ent​[field1])​-ntoday)​/86400000);
          else
            ent​["Future"] = null;
        }​
        else if (libto == "Consult" &​& libfrom == "Consult") {​
          ent​["Dx"] = e.field("Dx")​;
          ent["VisitType"]​ = "OPD" ;
          ent["VisitDate"]​ = my.date(e.field("AppointDate"));
          if (e.field("Photo").length>0)​
            ent["Photo"] = e.field("Photo").join()​;
        }​
        let last = lib.create(ent);
        last.link("Patient", links[0]);
        fill.pasthx(last, libto);
        fill.track(last, libto)​;
        fill.underlying(last)​;
        fill.color(last, libto) ;
        mer.newmergeid(last)​;
        message("successfully created new Entry") ;
        if (libto == "UroBase") ​{
          uro.setopextra(last);
          let dxe = uro.createautofill​(last)​;
          uro.setx15(last)​;
          let ope = uro.createoplist(last)​;
          if(dxe!=undefined)​
            uro.updatedxop​(last, "dx", dxe)​;
          if(ope!=undefined)​
            uro.updatedxop​(last, "op", ope)​;
          rpo.createnew(last)​;
          opu.createOp(last);
          ob=last​;
        }​
      }​
    }​
    e.set("EntryMx", defau) ;
    return ob;
  }, 
  flu : function (e)​ {
    if (e.field("EntryMx")​== "F/U" &&  e.field("AppointDate")) {
      this.createnew(e, "Consult")​.show();
    }​
    else if (e.field("EntryMx")​=="F/U")​ {
      message("Appoint date must not leave blank")​;
      e.set("EntryMx", "<Default>")​;
    }​
  }, 
  setor : function (e)​ {
    if (e.field("EntryMx")​== "set OR" &&  e.field("AppointDate")) {
      this.createnew(e, "UroBase").show()​;
    }​
    else if (e.field("EntryMx")​=="set OR")​ {
      message("Appoint date must not leave blank")​;
      e.set("EntryMx", "<Default>")​;
    }​
  }​
}​;
var fill = {
  sumpasthx : function (e, date) {
    let orlinks = e.linksFrom("UroBase", "Patient");
    let bulinks = e.linksFrom("Backup", "Patient");
    let list = [] ;
    let str = "";
    if (orlinks.length>0) {
      for (let i in orlinks) {
        if (orlinks[i].field("Status")=="Done" && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)) {
          list.push(orlinks[i]);
        }
      }
    }​
    if (bulinks.length>0)​ {
      for (let i in bulinks) {
        if (bulinks[i].field("Status")=="Done"  && my.gdate(bulinks[i].field("Date")) <= my.gdate(date)) {
          list.push(bulinks[i]);
        }
      }
    }​
    list = list.sort((a, b) => {
      if(a.field("Date")<b.field("Date"))
        return -1;
      else if(a.field("Date")>b.field("Date"))
        return 1;
      else
        return 0;
    });
    for(let i in list){
      if(str) str += "\n";
      str += list[i].field("Dx") + " > " + list[i].field("Op") + " " + list[i].field("Date").toDateString().replace(/mon|tue|wed|thu|fri|sat|sun/ig,"");
    }
    return str;
  },
  pasthx : function(e, lib) {
    let links = e.field("Patient");
    let date;
    if(lib=="Consult")
      date = e.field("ConsultDate")
    else
      date = e.field("Date")

    if(links.length && !e.field("PastHx")){
      let ptent = pt.findById(links[0].id) ;
      e.set("PastHx", this.sumpasthx(ptent, my.dateminus(date, 1)));
    }
  },
  mostdxbyop : function (op) {
    let dx = libByName("DxAutoFill");
    let dxs = dx.entries();
    let list = dxs.filter((e)=>e.field("Op")==op);
    if(list.length){
      results = list.sort((a, b) => {
        if(a.field("count")>b.field("count"))
          return -1;
        else if(a.field("count")<b.field("count"))
          return 1;
        else
          return 0;
      });
      return results[0].field("Dx");
    }
    return "";
  },
  track​ : function (e, lib) {
    let field1 = "" ;
    if(lib=="UroBase" || lib=="Backup") {
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
  opdatecal : function (e) {
    if(e.field("Date")) {
      let time = e.field("Timein");
      let opdate = e.field("Date");
      let hs = Number(e.field("Que"))+8;
      let mm = 0;
      let ss = 0;
      if(time) {
        hs = time.getHours();
        mm = time.getMinutes();
        ss = time.getSeconds();
      }
      e.set("OpDateCal", new Date(opdate.getFullYear(), opdate.getMonth(), opdate.getDate(), hs, mm, ss));
    }
  },
  oplength : function (e) {
    if (e.field("TimeOut") > e.field("TimeIn"))​ {
      e.set("OpLength", e.field("TimeOut")-e.field("TimeIn"))​;
    }​
    else if (e.field("TimeIn") > e.field("TimeOut"))​ {
      e.set("OpLength", 86400000-(e.field("TimeIn")-e.field("TimeOut"))​);
    }​
    else {
      e.set("OpLength", null)​;
    }
  },
  ptstatus : function (e) {
    let links = e.field("Patient")​;
    let field1 = "" ;
    if (links.length>0) {
      let ptent = pt.findById(links[0].id);
        
      let o = pto.findLast(ptent, today);
      if (o != null)​{
        links[0].set("WardStamp", o.e.field("VisitDate")​);
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
          dead = dead?dead.length​:0;
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
        else if ((o == null)​ || (o.e.field("DischargeDate") != null && my.gdate(o.e.field("DischargeDate"))​ <= ntoday)​ ) {//if future, check last admit :never admit or already D/C of last visit: still
          links[0].set("Status" ,"Still");
          links[0].set("Ward", "");
        }​
      }​
    }​
  }, 
  color : function (e, lib)​ {
    if(lib!="Consult") {
      if(e.field("Status")=="Not") {
        if(e.field("Color")​!="#5B5B5B") e.set("Color", "#5B5B5B")​;
      } 
      else if(e.field("Status")=="Plan") {
        if ((e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday)) || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
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
        if ((e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday)) || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
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
    else { // lib == Consult
      if(e.field("EntryMx")=="Not") {
        if(e.field("Color")​!="#5B5B5B") e.set("Color", "#5B5B5B")​;
      } 
      else if ((e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday)) || (e.field("VisitType")=="OPD" &​& my.gdate(e.field("VisitDate"))​== ntoday)​)​{
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
  }​,
  deletept : function (e){
    //Pt
    let ptlks = e.field("Patient");
    if (ptlks.length>0) {
      let ptent = pt.findById(ptlks[0].id) ;
      let orlinks = ptent.linksFrom("UroBase", "Patient") ;
      let bulinks = ptent.linksFrom("Backup", "Patient") ;
      let cslinks = ptent.linksFrom("Consult", "Patient") ;
      if(orlinks.length+bulinks.length+cslinks.length==0){
        ptent.trash();
      }
    }
  }
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
    if (e.field("YY") && !e.field("Birthday")​)​ {
      let month = e.field("MM")?e.field("MM"):0;
      let day = e.field("DD")?e.field("DD"):0;
      d = Math.round(e.field("YY")*365.2425 + month*30.4375 + day);
      e.set("Birthday", my.dateminus(today, d)​);
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
    if (!e.field("DJstent"))​ {
      e.set("DJStamp", null);
    }
  }, 
  donesettrack : function (e)​ {
    let o = this.findLast(e, today);
    if (o)​ {
      let toEnt = o.e ;
      let statusf;
      if (o.lib!="Consult")​
        statusf = "Status";
      else
        statusf = "EntryMx";
      if (e.field("Done") == true &​& toEnt.field("Track") == 1) {
        if (toEnt.field(statusf​) != "Not" && toEnt.field("VisitType") == "Admit" && (toEnt.field("DischargeDate") == null || my.gdate(toEnt.field("DischargeDate"))​ > ntoday)​)​ { // Admit
          mer.load(toEnt);
          mer.setall("Track", 2)​;
          mer.colorall(toEnt)​;
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
  },
  findLast: function(ptent, date, eid) {
    eid = eid? eid: 0;
    if (ptent) {
      let orlinks = ptent.linksFrom("UroBase", "Patient") ;
      let bulinks = ptent.linksFrom("Backup", "Patient") ;
      let cslinks = ptent.linksFrom("Consult", "Patient") ;
      let last = null, s=null, r=null, u=null​;​
      if (orlinks.length>0) {
        for (let i in orlinks) {
          if (orlinks[i].field("VisitType")=="Admit" && my.gdate(​orlinks[i].field("VisitDate")) > my.gdate(​last) && my.gdate(​orlinks[i].field("VisitDate"))​ <= my.gdate(​date)​ && orlinks[i].id != eid) {
            last = orlinks[i].field("VisitDate");
            r=i;
          }
        }
      }​
      if (bulinks.length​>0) {
        for (let i in bulinks) {
          if (bulinks[i].field("VisitType")=="Admit" && my.gdate(​bulinks[i].field("VisitDate"))​ > my.gdate(​last​) && my.gdate(​bulinks[i].field("VisitDate"))​ <= my.gdate(​date)​ && bulinks[i].id != eid) {
            last = bulinks[i].field("VisitDate");
            u=i;
          }
        }
      }​
      if (cslinks.length>0) {
        for (let i in cslinks) {
          if (cslinks[i].field("VisitType")=="Admit" && my.gdate(​cslinks[i].field("VisitDate")​) > my.gdate(​last) && my.gdate(​cslinks[i].field("VisitDate"))​ <= my.gdate(​date) && cslinks[i].id != eid) {
            last = cslinks[i].field("VisitDate");
            s=i;
          }
        }
      }​
      let o = new Object();
      if (last != null) {
        if (r!=null &​& u==null &​& s==null) {
          o["lib"] = "UroBase";
        }
        else if (u!=null &​& s==​null)​ {
          o["lib"] = "Backup";
        }
        else if (s!=null) {​
          o["lib"] = "Consult";
        }
        o["e"] = last;
        return o;
      }
    }
    return null;
  }
}​;
var uro = {
  checkdx : function (value)​ {
    return value.field("Dx") == this.field("Dx") &​& value.field("Op") ​== this.field("Op");
  }, ​
  checkop : function (value)​ {
    return value.field("OpFill") == this.field("Op");
  }, ​
  setnewdate : function (e) {
    //---if Date change : set new date
    if (my.gdate(old.field("Date")) != my.gdate(my.date(​e.field("Date"))​)) {
      e.set("Date", my.date(e.field("Date")));
    }​
    if (my.gdate(​old.field("VisitDate")) != my.gdate(​my.date(e.field("VisitDate")))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }​
    if (my.gdate(​old.field("DischargeDate")) != my.gdate(​my.date(e.field("DischargeDate"))​)) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }​
    if (my.gdate(​old.field("AppointDate")) != my.gdate(​my.date(e.field("AppointDate")))) {
      e.set("AppointDate", my.date(e.field("AppointDate")));
    }​
    if (my.gdate(​old.field("RecordDate")) != my.gdate(my.date(​e.field("RecordDate"))​)) {
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
    if(e.field("AutoOpExtra")){
      if (holiday || timeout || my.gday(e.field("Date"))==6 || my.gday(e.field("Date"))==0) {
        e.set("OpExtra", true);
      }​
      else {
        e.set("OpExtra", false);
      }
    }
  }, 
  setvisitdate ​: function (e)​ {
    if(e.field("Merge")​){
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
      else if(old.field("ORType")!=e.field("ORType") || my.gdate(old.field("Date"))!=my.gdate(e.field("Date"))){
        if(e.field("ORType") == "GA" &​& my.gdate(e.field("VisitDate")) > my.gdate(my.dateminus(e.field("Date"), 1))){
          if (e.field("VisitType") == "OPD")​
            e.set("VisitType", "Admit")​;
          e.set("VisitDate", my.dateminus(e.field("Date"), 1));
        }
        else if(e.field("ORType") == "LA" &​& my.gdate(e.field("VisitDate")) > my.gdate(e.field("Date"))){
          e.set("VisitDate", my.date(e.field("Date")))​;
        }
      }
    }
    else {
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
      else if(old.field("ORType")!=e.field("ORType") || my.gdate(old.field("Date"))!=my.gdate(e.field("Date"))){
        if(e.field("ORType") == "GA" &​& my.gdate(e.field("VisitDate")) != my.gdate(my.dateminus(e.field("Date"), 1))){
          if (e.field("VisitType") == "OPD")​
            e.set("VisitType", "Admit")​;
          e.set("VisitDate", my.dateminus(e.field("Date"), 1));
        }
        else if(e.field("ORType") == "LA" &​& my.gdate(e.field("VisitDate")) != my.gdate(e.field("Date"))){
          e.set("VisitDate", my.date(e.field("Date")))​;
        }
      }
    }
  }, 
  opresulteffect : function(e) {
    let opresult = e.field("OpResult").replace(/ +/g, ' ').trim().replace(/\n +/g, '\n');
    e.set("OpResult", opresult);
    if(opresult && old.field("OpResult") != opresult ) {
      let ondj = opresult.match(/dj/i);
      ondj = ondj==null?0:ondj.length;
      let opon = e.field("Op").match(/dj/i);
      opon = opon==null?0:opon.length;
      let offdj = opresult.match(/((off)(\s+)[a-z]*(\s*)(dj))/ig);
      offdj = offdj==null?0:offdj.length;
      let opoff = e.field("Op").match(/((off)(\s+)[a-z]*(\s*)(dj))/ig);
      opoff = opoff==null?0:opoff.length;
      let changedj = opresult.match(/((change)(\s+)[a-z]*(\s*)(dj))/ig);
      changedj = changedj==null?0:changedj.length;
      let opchange = e.field("Op").match(/((change)(\s+)[a-z]*(\s*)(dj))/ig);
      opchange = opchange==null?0:opchange.length;
      let notonly = opresult.match(/งดเพราะ/ig);
      notonly = notonly==null?0:notonly.length;
      let notdone = opresult.match(/ไม่ทำเพราะ/ig);
      notdone = notdone==null?0:notdone.length;

      if(notdone>0)​ {
        e.set("VisitType", "OPD")​;
        e.set("Status", "Not")​;
      }
      else if(notonly>0)​
        e.set("Status", "Not")​;
      else if(e.field("Status")!="Done")
        e.set("Status", "Done");

      if(changedj>0||opchange>0)
        e.set("DJstent", "change DJ");
      else if(offdj>0||opoff>0)
        e.set("DJstent", "off DJ");
      else if(ondj>0||opon>0)
        e.set("DJstent", "on DJ");
      else
        e.set("DJstent", null);
    }
    else if(old.field("OpResult") && opresult == ""){
      e.set("Status", "Plan");
      if (e.field("ORType") == "GA") {
        if (e.field("VisitType") == "OPD")​
          e.set("VisitType", "Admit")​;
      }​
    }
  }, 
  
  setDJstent : function (e) {
    let links = e.field("Patient")​;
    if (links.length>0) {
      if (links[0].field("DJStamp") == null) { // never ever DJStamp
        if(e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")​
          e.set("DJstent", null)​;
      }​
      else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) > ntoday) { // ever DJStamp, future entry
        if (e.field("DJstent"))​
          e.set("DJstent", null)​ ;
      }​
      else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) <= ntoday) { // ever DJStamp, after Stamp but not future entry
        if (!links[0].field("DJstent"))​ {// ever off DJ, get only on DJ
          if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")​
            e.set("DJstent", null)​ ;
        }​
        else { // ever on DJ or change DJ, get off or change DJ
          if (e.field("DJstent") == "on DJ")​
            e.set("DJstent", null)​ ;
        }​
      }​
      else if (e.field("Date") < links[0].field("DJStamp"))​  {// edit entry before last DJStamp, can't edit
        e.set("DJstent", old.field("DJstent"));
      }​
      else if (my.gdate(e.field("Date")) == my.gdate(links[0].field("DJStamp")))​ {// this entry is last DJStamp
        if (!links[0].field("DJstent"))​ {// this entry is off DJ, get only off or changeDJ​
          if (e.field("DJstent") == "on DJ") 
              e.set("DJstent", null) ;
        }​
        else { // this entry is on DJ, must check last DJStamp before
          let ptent = pt.findById(links[0].id) ;
          let d = this.lastDJStamp(ptent, my.dateminus(e.field("Date"), 1)) ;
          if (d != null &​& d.field("DJstent")​ != "off DJ"​) { // ever on or change DJ before -​> get only off or change DJ
            if (e.field("DJstent") == "on DJ") 
              e.set("DJstent", null) ;
          }​ 
          else { // never on DJ or ever off DJ before -​> get only on DJ
            if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ") 
              e.set("DJstent" , null) ;
          }​
        } 
      }​
    }​
  }, 
  lastDJStamp : function (ptent, date)  {
    let orlinks = ptent.linksFrom("UroBase", "Patient") ;
    let bulinks = ptent.linksFrom("Backup", "Patient") ;
    let o = null ;
    let last = null, r = null, u = null;
    if (orlinks.length>0) {
      for (let i in orlinks) {
        if (orlinks[i].field("DJstent") && gdate(orlinks[i].field("Date")) > gdate(last) && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)​) {
          last = orlinks[i].field("Date");
          r=i;
        }
      }
    }​
    if (bulinks.length>0)​ {
      for (let i in bulinks) {
        if (bulinks[i].field("DJstent") && gdate(bulinks[i].field("Date")) > gdate(last) && my.gdate(bulinks[i].field("Date")) <= my.gdate(date)​) {
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
    if(old.field("Dx")!=e.field("Dx")&&e.field("Dx")!=''​)
      e.set("Dx", e.field("Dx").replace(/-|#/g, '').replace(/\s+/g, ' ').trim()​);
    if(old.field("Op")!=e.field("Op")&&e.field("Op")!=''​)​
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
      if((old.field("Dx") != e.field("Dx")​ &​& old.field("Dx"))​ || 
          (old.field("Op") != e.field("Op")​ &​& old.field("Op"))​)​ { //update old dx in dxautofill
        let dx = libByName("DxAutoFill");
        let dxs = dx.find(old.field("Dx"))​;
        let find = undefined;
        if (dxs.length > 0) {
          for(let i in dxs)​{
            if(dxs[i]​.field("Dx")​==old.field("Dx") ​&& dxs[i]​.field("Op")​==old.field("Op")​)​
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
      if(old.field("Op") != e.field("Op")​ &​& old.field("Op"))​ { //update old op in oplist
        let op = libByName("OperationList")​;
        let ops = op.find(old.field("Op"))​;
        let find = undefined;
        if (ops.length > 0) {
          for(let i in ops)​{
            if(ops[i]​.field("OpFill")​==old.field("Op")​)​
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
  updateDJStamp : function (e) {
    let links = e.field("Patient")​;
    if (links.length>0) {
      let ptent = pt.findById(links​[0].id) ;
      let d = this.lastDJStamp(ptent, today) ;
      if (!d) { // not found
        ptent.set("DJstent", null);
        ptent.set("DJStamp", null)​;
      } 
      else { // found off, on, change DJ before
        if (d.field("DJstent") == "off DJ") ​{
          ptent.set("DJstent", null);
          ptent.set("DJStamp", d.field("Date"));
        }​
        else ​{
          ptent.set("DJstent", "on DJ");
          ptent.set("DJStamp", d.field("Date"));
        }​
      }
    }
  }, 
  resetcolor : function(all) {
    let thislib = lib().title;
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
  setnewdate : function (e) {
    //---if Date change : set new date
    if (my.gdate(old.field("ConsultDate")) != my.gdate(​my.date(e.field("ConsultDate"))​)) {
      e.set("ConsultDate", my.date(e.field("ConsultDate")));
    }​
    if (my.gdate(​old.field("VisitDate")) != my.gdate(​my.date(e.field("VisitDate")))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }​
    if (my.gdate(​old.field("DischargeDate")) != my.gdate(my.date(​e.field("DischargeDate")))​) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }​
    if (my.gdate(​old.field("AppointDate")) != my.gdate(my.date(​e.field("AppointDate")))) {
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
        fill.color(all[i]​, "Consult")​;
      }
    } 
  }​
}​;
var rpo = {
  createnew : function (e) {
    if(e.field("Status") != "Not"){
      let ent = new Object();
      //---Date, Patient, Dx, Op, ORType, Extra, LOS
      ent["OpDate"] = e.field("Date");
      ent["Dx"]​ = e.field("Dx");
      ent["Op"]​ = e.field("Op");
      ent["ORType"] = e.field("ORType");
      ent["Extra"]​ = e.field("OpExtra");
      ent["LOS"]​ = e.field("LOS");
      ent["OpDateCal"] = e.field("OpDateCal");
      ent["OpLength"] = e.field("OpLength");

      //---OpGroup, Organ
      if (e.field("OperationList").length>0)​{
        ent["OpGroup"] = e.field("OperationList")[0].field("OpList");
        ent["Organ"]​ = e.field("OperationList")[0].field("OpGroup").join(" ")​;
      }​
      
      //---WeekDay
      ent["WeekDay"]​ =  my.wkname(my.gday(e.field("Date")​))​ ;
      
      //---Dead
      if(e.field("Patient").length>0 && e.field("Patient")​[0].field("Status")=="Dead")
        ent["Dead"]​ = "Dead";
      else
        ent["Dead"]​ = "Alive";
        
      let rplast = rp.create(ent);
      if(e.field("Patient").length>0){
        rplast.link("Patient", e.field("Patient")​[0]);
      }​
    }
  },
  updatenew : function (e) {
    if(old.field("Status") != "Not" && e.field("Status") != "Not"){
      //update
      let ptlks = pt.find(old.field("Patient"))​;
      if (ptlks.length>0) {
        let ptent = pt.findById(ptlks[0].id);
        let rps = ptent.linksFrom("Report", "Patient")​;
        if (rps.length>0) {
          for (let r in rps)​{
            if (my.gdate(my.date(rps[r].field("OpDate"))​) == my.gdate(my.date(old.field("Date"))​) && rps[r].field("ORType") ==​ old.field("ORType") &​& rps[r].field("Dx") ==​ old.field("Dx") &​& rps[r].field("Op") ==​ old.field("Op"))​{
              let rpt = rps[r]​;
              //---Date, Patient, Dx, Op, ORType, Extra, LOS
              rpt.set("OpDate", e.field("Date"));
              rpt.set("Dx", e.field("Dx"));
              rpt.set("Op", e.field("Op"));
              rpt.set("ORType", e.field("ORType"));
              rpt.set("Extra", e.field("OpExtra"));
              rpt.set("LOS", e.field("LOS"));
              rpt.set("OpDateCal", e.field("OpDateCal"));
              rpt.set("OpLength", e.field("OpLength"));

              //---OpGroup, Organ
              if (e.field("OperationList").length>0)​{
                rpt.set("OpGroup", e.field("OperationList")[0].field("OpList"));
                rpt.set("Organ", e.field("OperationList")[0].field("OpGroup").join(" ")​);
              }​
      ​
              //---WeekDay
              rpt.set("WeekDay", my.wkname(my.gday(e.field("Date")​)​ ))​;
              //---Dead
              if(e.field("Patient").length>0 && e.field("Patient")​[0].field("Status")=="Dead")
                rpt.set("Dead","Dead");
              else
                rpt.set("Dead","Alive");
                
              break;
            }
          }​
        }​
      }​
    }
    else if(old.field("Status") == "Not" && e.field("Status") != "Not" ){
      //create
      this.createnew(e);
    }
    else if(old.field("Status") != "Not" && e.field("Status") == "Not" ){
      //delete
      this.deleteold(e);
    }​
  }, 
  deleteold : function (e) {
    if(old.field("Status") != "Not"){
      let ptlks = pt.find(old.field("Patient"))​;
      if (ptlks.length>0) {
        let ptent = pt.findById(ptlks[0].id);
        let rps = ptent.linksFrom("Report", "Patient")​;
        if (rps.length>0) {
          for (let r in rps)​{
            if (my.gdate(rps[r].field("OpDate"))​ == my.gdate(old.field("Date"))​ &​& rps[r].field("Dx") ==​ old.field("Dx") &​& rps[r].field("Op") ==​ old.field("Op"))​{
              rps[r].trash();
              break;
            }​
          }​
        }​
      }
    }​
  }​
}​;
var opu = {
  setnewdate : function (e) {
    e.set("OpDate", my.date(e.field("OpDate")));
  }, 
  splitPtName : function (ptName) {
    let arr = [];
    let inx = ptName.search(/\d+/); // search for number
    if(inx>-1){
      arr[0] = ptName.slice(0,inx).trim(); // alphabet
      ptName = ptName.slice(inx).trim(); // number +/- alphabet
    }
    else {
      arr[0] = ptName.trim();
      arr[1] = '';
      arr[2] = '';
    }
    inx = ptName.search(/\D/); // search for alphabet
    if(inx>-1){
      let num = ptName.slice(0,inx).trim(); // number
      ptName = ptName.slice(inx); // alphabet +/- number
      inx = ptName.search(/\d/); // search for number
      if(inx>-1){
        arr[1] = num + ' ' + ptName.slice(0,inx).trim(); // alphabet
        arr[2] = ptName.slice(inx);  // number
      }
      else {
        arr[1] = num + ' ' + ptName;
        arr[2] = '';
      }
    }
    else {
      inx = ptName.search(/\s/); // search for space
      if(inx>-1){
        arr[1] = ptName.slice(0,inx);
        arr[2] = ptName.slice(inx).trim();
      }
      else {
        if(Number(ptName)<120){
          arr[1] = ptName.trim();
          arr[2] = '';
        }
        else{
          arr[1] = '';
          arr[2] = ptName.trim();
        }
      }
    }
    return arr;
  },
  createOp : function (e) {
    if(e.field("OpExtra") && e.field("Status") != "Not"){
      let ent = new Object()​ ;
      let links = e.field("Patient");
      if(links.length>0){
        let link = links[0];
        ent["OpDate"] = my.date(e.field("Date")) ;
        ent["Dr"] =  e.field("Dr");
        ent["OpType"] =  e.field("ORType")​;
        ent["PtName"] =  link.field("PtName");
        ent["Age"] =  Number(link.field("Age").replace(/\s*ปี/,""));
        ent["HN"] =  link.field("HN");
        ent["Dx"] =  e.field("Dx")​;
        ent["Op"] = e.field("Op")​;
        ent["Note"] =  link.field("Underlying").join();
        ent["CreationTime"] =  e.creationTime;
        ent["ModifiedTime"] =  e.lastModifiedTime;
        os.create(ent);
        //message("create OpUroSx!");
      }
    }
  },
  updateOp : function (e) {
    if(old.field("OpExtra") == true && old.field("Status") != "Not" && e.field("OpExtra") == true && e.field("Status") != "Not"){
      //update
      let oss = os.entries();
      let links = e.field("Patient");
      if(links.length>0 && oss.length>0){
        let link = links[0];
        let parr = this.splitPtName(old.field("Patient"));
        for (let s in oss)​{
          if (my.gdate(my.date(oss[s].field("OpDate")))​ == my.gdate(my.date(old.field("Date")))​ && oss[s].field("Dr") ==​ old.field("Dr") &​& oss[s].field("OpType") ==​ old.field("ORType") &​& oss[s].field("PtName") ==​ parr[0] && oss[s].field("HN") ==​ Number(parr[2]) &​& oss[s].field("Dx") ==​ old.field("Dx") &​& oss[s].field("Op") ==​ old.field("Op"))​{
            oss[s].set("OpDate", my.date(e.field("Date")));
            oss[s].set("Dr", e.field("Dr"));
            oss[s].set("OpType", e.field("ORType")​);
            oss[s].set("PtName", link.field("PtName"));
            oss[s].set("Age", Number(link.field("Age").replace(/\s*ปี/,"")));
            oss[s].set("HN", link.field("HN"));
            oss[s].set("Dx", e.field("Dx")​);
            oss[s].set("Op", e.field("Op")​);
            oss[s].set("Note", link.field("Underlying").join());
            if(!oss[s].field("CreationTime"))
              oss[s].set("CreationTime", e.creationTime);
            if(my.gdate(oss[s].field("ModifiedTime"))<my.gdate(e.lastModifiedTime))
              oss[s].set("ModifiedTime", e.lastModifiedTime);
            //message("update OpUroSx!");
            break;
          }
        }​
      }​
    }
    else if(old.field("OpExtra") == false && e.field("OpExtra") == true && e.field("Status") != "Not" || old.field("Status") == "Not" && e.field("Status") != "Not" && e.field("OpExtra") == true){
      //create
      this.createOp(e);
    }
    else if(old.field("OpExtra") == true && e.field("OpExtra") == false && old.field("Status") != "Not" || old.field("Status") != "Not" && e.field("Status") == "Not" && old.field("OpExtra") == true){
      //delete
      this.deleteOp(e);
    }
  },
  deleteOp : function (e) {
    if(old.field("OpExtra") && old.field("Status") != "Not"){
      let oss = os.entries();
      if(oss.length>0){
        let parr = this.splitPtName(old.field("Patient"));
        for (let s in oss)​{
          if (my.gdate(my.date(oss[s].field("OpDate")))​ == my.gdate(my.date(old.field("Date")))​ &​& oss[s].field("Dr") ==​ old.field("Dr") &​& oss[s].field("OpType") ==​ old.field("ORType") &​& oss[s].field("PtName") ==​ parr[0] && oss[s].field("HN") ==​ Number(parr[2]) &​& oss[s].field("Dx") ==​ old.field("Dx") &​& oss[s].field("Op") ==​ old.field("Op"))​{
            oss[s].trash();
            //message("delete OpUroSx!");
            break;
          }
        }​
      }​
    }
  },
  ptTrigOpuro : function (e) {
    if(old.field("PtName") != e.field("PtName") || old.field("YY") != e.field("YY") || old.field("MM") != e.field("MM")  || old.field("DD") != e.field("DD") || my.gdate(my.date(old.field("Birthday"))) != my.gdate(my.date(e.field("Birthday"))) || old.field("HN") != e.field("HN") ){
      let orlinks = e.linksFrom("UroBase", "Patient");
      let bulinks = e.linksFrom("Backup", "Patient");
      let found = [];
      if(orlinks.length+bulinks.length>0) {
        for (let i in orlinks) {
          if (orlinks[i].field("OpExtra")==true) {
            found.push(orlinks[i]);
          }
        }
        for (let i in bulinks) {
          if (bulinks[i].field("OpExtra")==true) {
            found.push(bulinks[i]);
          }
        }
      }
      if(found.length>0) {
        //update OpUroSx
        let oss = os.entries();
        let count = 0;
        for(let i in oss) {
          if(old.field("PtName") == oss[i].field("PtName") && old.field("HN") == oss[i].field("HN")) {
            oss[i].set("PtName", e.field("PtName"));
            oss[i].set("Age", Number(e.field("Age").replace(/\s*ปี/,"")));
            oss[i].set("HN", e.field("HN"));
            count++;
          }
        }
        if(count) {
          message("Update related PtName in OpUroSx!");
        }
      }
    }
  }
};
var trig = {
  PatientOpenEdit : function(e) {
    old.save(e);
  },
  PatientBeforeEdit : function (e, value)​ {
    pto.rearrangename(e);
    old.load(e);
    if (value=="create")
      pto.uniqueHN(e, true)​;
    else if (value=="update")​
      pto.uniqueHN(e, false)​;
    pto.age(e)​;
    pto.status(e)​;
    pto.dj(e)​;
  }, 
  PatientAfterEdit : function (e, value) {
    old.load(e)​;
    if (value=="update")​
      opu.ptTrigOpuro(e);
    old.save(e)​;
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
    pto.age(e)​;
  }, 
  UroOpenEdit : function (e)​ {
    old.save(e)​;
  }, 
  UroBeforeEdit : function (e, value)​ {
    old.load(e)​;
    uro.setnewdate(e)​;​
    uro.setdxop​(e)​;
    uro.opresulteffect(e);
    uro.setfuture(e)​;
    uro.setopextra(e)​;
    uro.setvisitdate(e)​;
    fill.pasthx(e, "UroBase");
    fill.track​(e, "UroBase")​;
    if (value=="create")
      mer.newmergeid(e)​;
    mer.merge(e)​;
    uro.setDJstent(e)​;
    let dxe = uro.createautofill​(e)​;
    uro.setx15(e)​;
    let ope = uro.createoplist(e)​;
    if(dxe!=undefined)​
      uro.updatedxop​(e, "dx", dxe)​;
    if(ope!=undefined)​
      uro.updatedxop​(e, "op", ope)​;
    que.run(e)​;
    fill.underlying(e)​;
    fill.los(e)​;
    fill.opdatecal(e);
    fill.oplength(e);
    fill.ptstatus(e)​;
    mer.effect(e)​;
  }, 
  UroAfterEdit : function (e, value) {
    old.load(e)​;
    emx.flu(e)​;
    emx.setor(e)​;
    uro.updateDJStamp(e)​;
    if (value=="create") {
      rpo.createnew(e);
      opu.createOp(e)​;
    }
    else if (value=="update")​ {
      rpo.updatenew(e);
      opu.updateOp(e)​;
    }
    old.save(e)​;
  }, 
  UroBeforeViewCard ​: function (e) {​
    old.save(e)​;
  }, 
  UroBeforeOpenLib : function (all) {
    uro.resetcolor(all)​;
  }, 
  UroBeforeUpdatingField : function (e) {
    old.load(e)​;
    uro.setnewdate(e)​;
    uro.setvisitdate(e)​;
    fill.track​(e, "UroBase")​;
    mer.merge(e)​;
    que.run(e)​​;
    fill.ptstatus(e)​;
    mer.effect(e)​;
  }, 
  UroAfterUpdatingField : function (e) {
    old.save(e)​;
  }, 
  UroBeforeDelete : function (e)​ {
    old.load(e)​;
    if (e.field("Merge")​==true)​ {
      e.set("Merge", false)​
      mer.merge(e)​;
    }
  }, 
  UroAfterDelete : function (e)​ {
    old.load(e);
    uro.deletedxop(e)​;
    rpo.deleteold(e)​;
    opu.deleteOp(e);
    fill.deletept(e)​;
  }, 
  BackupOpenEdit : function (e)​ {
    old.save(e)​;
  }, 
  BackupBeforeEdit : function (e, value)​ {
    old.load(e)​;
    uro.setnewdate(e)​;​
    uro.setdxop​(e)​;
    uro.opresulteffect(e);
    uro.setfuture(e)​;
    uro.setopextra(e)​;
    uro.setvisitdate(e)​;
    fill.pasthx(e, "Backup");
    fill.track​(e, "Backup")​;
    if (value=="create")
      mer.newmergeid(e)​;
    mer.merge(e)​;
    uro.setDJstent(e)​;
    let dxe = uro.createautofill​(e)​;
    uro.setx15(e)​;
    let ope = uro.createoplist(e)​;
    if(dxe!=undefined)​
      uro.updatedxop​(e, "dx", dxe)​;
    if(ope!=undefined)​
      uro.updatedxop​(e, "op", ope)​;
    que.run(e)​​;
    fill.underlying(e)​;
    fill.los(e)​;
    fill.opdatecal(e);
    fill.oplength(e);
    fill.ptstatus(e)​;
    mer.effect(e)​;
  }, 
  BackupAfterEdit : function (e, value) {
    old.load(e)​;
    emx.flu(e)​;
    emx.setor(e)​;
    uro.updateDJStamp(e)​;
    if (value=="create") {
      rpo.createnew(e);
    }
    else if (value=="update")​ {
      rpo.updatenew(e);
    }
    old.save(e)​;
  }, 
  BackupBeforeViewCard ​: function (e) {​
    old.save(e)​;
  }, 
  BackupBeforeOpenLib : function (all) {
    uro.resetcolor(all)​;
  }, 
  BackupBeforeUpdatingField : function (e) {
    old.load(e)​;
    uro.setnewdate(e)​;
    uro.setvisitdate(e)​;
    fill.track​(e, "Backup")​;
    mer.merge(e)​;
    que.run(e)​​;
    fill.ptstatus(e)​;
    mer.effect(e)​;
  }, 
  BackupAfterUpdatingField : function (e) {
    old.save(e)​;
  }, 
  BackupBeforeDelete : function (e)​ {
    old.load(e)​;
    if (e.field("Merge")​==true)​ {
      e.set("Merge", false)​
      mer.merge(e)​;
    }
  }, 
  BackupAfterDelete : function (e)​ {
    old.load(e);
    uro.deletedxop(e)​;
    rpo.deleteold(e)​;
    fill.deletept(e)​;
  }, 
  ConsultOpenEdit : function (e)​ {
    old.save(e)​;
  }, 
  ConsultBeforeEdit : function (e, value)​ {
    old.load(e)​;
    cso.setnewdate(e)​;​
    cso.setvisitdate(e)​;
    fill.pasthx(e, "Consult");
    fill.track​(e, "Consult")​;
    if (value=="create")
      mer.newmergeid(e)​;
    mer.merge(e)​;
    fill.underlying(e)​;
    fill.los(e)​;
    fill.ptstatus(e)​;
    mer.effect(e)​;
  },
  ConsultAfterEdit : function (e, value) {
    old.load(e)​;
    emx.flu(e)​;
    emx.setor(e)​;
    old.save(e)​;
  }, 
  ConsultBeforeViewCard ​: function (e) {​
    old.save(e)​;
  }, 
  ConsultBeforeOpenLib : function (all) {
    cso.resetcolor(all)​;
  }, 
  ConsultBeforeUpdatingField : function (e) {  
    old.load(e)​;
    cso.setnewdate(e)​;
    cso.setvisitdate(e)​;
    fill.track​(e, "Consult")​;
    mer.merge(e)​;
    fill.ptstatus(e)​;
    mer.effect(e)​;
  }, 
  ConsultAfterUpdatingField : function (e) {
    old.save(e)​;
  }, 
  ConsultBeforeDelete : function (e)​ {
    old.load(e)​;
    if (e.field("Merge")​==true)​ {
      e.set("Merge", false)​
      mer.merge(e)​;
    }
  }, 
  ConsultAfterDelete : function (e)​ {
    fill.deletept(e);
  },
  OpUroBeforeEdit : function (e) {
    opu.setnewdate(e)​;
  }, 
  OpUroAfterEdit : function (e) {
    
  }
}​;
