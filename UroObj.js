var pt = libByName("Patient") ;
var or = libByName("UroBase") ;
var cs = libByName("Consult") ;
var bu = libByName("Backup") ;
var dx = libByName("DxAutoFill") ;
var op = libByName("OperationList") ;
var rp = libByName("Report");
var hd = libByName("Holidays");
var wd = libByName("UroCRH");

var old = {
    d : {}, 
    load : function (e) {
      //get Previous to Obj
      this.d = JSON.parse(e.field("Previous"), function (key, value) {
        if (value) {
          if (typeof value == "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            return new Date(value);
          }
          else if (typeof value == "object" && (key == "Underlying" || key == "Allergies" || key == "Photo")) {
           return Object.keys(value).map(v=>value[v]);
          }
          else {
            return value;
          }
        }
        else {
          return value;
        }
      });
    },
    save : function (e) {
      //save field value to Obj and set to Previous
      old.d = {};
      let lb;
      if(this.lib == "Patient") lb = pt;
      else if(this.lib == "UroBase") lb = or;
      else if(this.lib == "Consult") lb = cs;
      else if(this.lib == "Backup") lb = bu;
      else if(this.lib == "DxAutoFill") lb = dx;
      else if(this.lib == "OperationList") lb = op;
      let fieldnames = lb.fields();
      for(let f of fieldnames) {
        if(f=="Previous") {
          let prev = e.field(f)?JSON.parse(e.field(f)):{};
          if("orsync" in prev) {
            old.d["orsync"] = prev.orsync;
          }
        }
        else if(f!= "OpDateCal" && f!= "Output") {
          if(my.dateIsValid(e.field(f)) || my.timeIsValid(e.field(f))) {
            old.d[f] = my.date(e.field(f));
          }
          else if(lb.lib!="Patient" && (f=="Patient" || f=="DxAutoFill" || f=="OperationList")) {
            old.d[f] = e.field(f).length>0? e.field(f)[0].title: ""; 
          }
          else {
            old.d[f] = e.field(f);
          }
        }
      }

      e.set("Previous", JSON.stringify(old.d));
    },
    field : function (fieldname) {
      //get data by field
      if(fieldname in this.d)
        return this.d[fieldname];
    },
    savesync : function (e, fieldname) {
      this.d[fieldname] = hour;
        
      e.set("Previous", JSON.stringify(this.d));
    }
};

var mer = {
  m: [],
  load: function(e) {
    let marr = JSON.parse(e.field("MergeID"));
    this.m = marr.map(o=>{
      let n = new Object();
      if(o.e == e.id) {
        n["lib"] = o.lib;
        n["e"] =  e;
      }
      else {
        n["lib"] = o.lib;
        n["e"] =  libByName(o.lib).findById(o.e);
      }
      return n;
    });
  },
  save : function(e, mergeobj) {
    let m = mergeobj.map(v=>{
      let n = new Object();
      if(v) {
        n["lib"] = v.lib;
        n["e"] =  v.e.id;
      }
      return n;
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
    let o = [{"lib":this.lib, "e":e.id}];
    e.set("MergeID", JSON.stringify(o));
  },
  sort: function(e) {
    this.m.sort((a,b)=>{
      let q1, q2;
      if (a.lib!="Consult") 
        q1 = my.gdate(a.e.field("Date"));
      else
        q1 = my.gdate(a.e.field("ConsultDate"));
        
      if (b.lib!="Consult") 
        q2 = my.gdate(b.e.field("Date"));
      else
        q2 = my.gdate(b.e.field("ConsultDate"));
      
      if (q1==q2) {
        if (a.lib==b.lib)
          return my.gdate(a.e.creationTime)-my.gdate(b.e.creationTime);
        else if (a.lib=="Consult")
          return -1;
        else if (a.lib!="Consult")
          return 1;
      }
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
    this.m.forEach(o=>{
      if(o.lib!="Consult")
        fill.color.call(uro, o.e);
      else
        fill.color.call(cso, o.e);
    });
  },
  fieldall: function(e) {
    let range = ["VisitDate","PastHx","InvResult","VisitType","Ward","DischargeDate","Track","Summary","Underlying","LOS","LOSDisp","Active"];
    for(let i = 0; i<range.length; i++) {
      let inx = this.findInx(e);
      if(range[i].indexOf("Date")>-1) {
        if(my.gdate(e.field(range[i]))!=my.gdate(old.field(range[i])))
          this.setall(range[i],  e.field(range[i]));
      }
      else if (range[i] == "VisitType") {
        if(this.m.length>1 && e.field(range[i])!="Admit")
          e.set(range[i], "Admit");
      }
      else {
        if(e.field(range[i])!=old.field(range[i]))
          this.setall(range[i],  e.field(range[i]));
      }         
    }
  },
  findLast : function(e) {
    if (e.field("Patient").length>0) {
      let ptent = pt.findById(e.field("Patient")[0].id);
      let date = e.field("VisitDate");
      return pto.findLast(false, false, ptent, date, e, this);
    }
    return [];
  },
  run : function(e) {
    let mergearr = mer.findLast.call(this, e);
    if (mergearr.length>0) {
      let mergeobj = mergearr[0];
      mer.load(mergeobj.e);
      mer.append(this.lib, e);
      mer.sort(e);
      mer.save(e, mer.m);
      mer.setall("MergeID", e.field("MergeID"));
      mer.setall("Merge", true);
      mer.setall("VisitDate", mergeobj.e.field("VisitDate"));
      mer.setall("PastHx", mergeobj.e.field("PastHx"));
      mer.setall("InvResult", mergeobj.e.field("InvResult"));
      mer.setall("VisitType", mergeobj.e.field("VisitType"))
      mer.setall("Ward", mergeobj.e.field("Ward"));
      if (mergeobj.e.field("DischargeDate"))
        mer.setall("DischargeDate", mergeobj.e.field("DischargeDate"));
      mer.setall("Track", mergeobj.e.field("Track"));
      mer.setall("Summary", mergeobj.e.field("Summary"));
      mer.setall("Underlying", mergeobj.e.field("Underlying"));
      mer.setall("LOS", mergeobj.e.field("LOS"));
      mer.setall("LOSDisp", mergeobj.e.field("LOSDisp"));
      mer.setall("Active", mergeobj.e.field("Active"));
      
      if (mer.m.length>0 && mer.m[0].lib=="Consult") {
        let mas = mer.m[0].e;
        if (!mas.field("Rx") && this.lib != "Consult" && e.field("Op")) {
          mas.set("Rx", "set " + e.field("Op"));
          mas.set("Status", "Done");
        }
        else if (mer.m.length>1 && mer.m[1].lib!="Consult" && mer.m[1].e.field("Op") && mer.m.some(m=>m.lib!="Consult" && mas.field("Rx")=="set "+m.e.field("Op"))) {
          mas.set("Rx", "set " + mer.m[1].e.field("Op"));
          mas.set("Status", "Done");
        }
      }
    }
    else {
      message("Can't find Last Admit!");
      e.set("Merge", false);
    }
  },
  cancel : function(e) {
    mer.load(e);
    mer.sort(e);
    let inx = mer.findInx(e);
    let mergeobj = null;
    if (inx>-1 && mer.m.length>0) {
      mergeobj = mer.m.splice(inx, 1);
      let o = mer.m[0].e;
      let l = mer.m[0].lib;
      if (inx==0) {  // cancel parent
        // Parent : e=normal, o=new parent
        message("This parent entry do not uncheck");
        e.set("Merge", true);
      }
      else {  // inx>0: cancel child
        if (this.lib!="Consult") {
          // Child : e=normal, o=old parent
          if (my.gdate(e.field("VisitDate"))<my.gdate(my.dateminus(e.field("Date"), 1)))
            e.set("VisitDate", my.dateminus(e.field("Date"), 1));
          // Parent+other child : e=normal, o=old parent
          if (l=="Consult" && o.field("Rx")=="set "+e.field("Op")) {
            if (mer.m.length>1 && mer.m[1].lib!="Consult" && mer.m[1].e.field("Op")) {
              o.set("Rx", "set "+mer.m[1].e.field("Op"));
              o.set("Status", "Done");
            }
            else if (mer.m.length==1) {
              o.set("Rx", "");
              o.set("Status", "Plan");
            }
          }
        }
        else {// Consult
          // Child : e=normal, o=old parent
          e.set("VisitDate", my.dateminus(e.field("ConsultDate"), 1));
        }
        if (my.gdate(e.field("VisitDate"))>ntoday) {
          e.set("Ward", e.field("VisitType")=="Admit"?"Uro":"OPD");
          e.set("DischargeDate", null);
          e.set("Track", 0);
          e.set("Summary", false);
          e.set("LOS", null);
        }
        mer.save(e, mergeobj);
        mer.save(o, mer.m);
        mer.setall("MergeID", o.field("MergeID"));
        if (mer.m.length==1) o.set("Merge", false);
      }
    }
  },
  merge : function(e) {
    if (e.field("Merge")!=old.field("Merge")) {
      if (e.field("Merge")) {
        mer.run.call(this, e);
      }
      else {
        mer.cancel.call(this, e);
      }
    }
  },
  effect: function(e) {
    mer.load(e);
    if (this.m.length>1) {
      this.fieldall(e);
      this.colorall(e);
    }
  }
};
var que = {
  o: [],
  q: [],
  load: function(e) {  // load entry to q
    let lib = this.lib=="UroBase"? or: bu;
    all = lib.entries();
    que.o = all.filter(v=>my.gdate(v.field("Date"))==my.gdate(old.field("Date")) && v.field("ORType")==old.field("ORType") && v.field("Status")!="Not");
    que.q = all.filter(v=>my.gdate(v.field("Date"))==my.gdate(e.field("Date")) && v.field("ORType")==e.field("ORType") && v.field("Status")!="Not");
  },
  save : function(arr) {
    // reorder by TimeIn
    this.sorttime(arr);
    // set new que to every entry
    arr.forEach((v,i)=>{
      v.set("Que", ("0"+(i+1)).slice(-2));
    });
  },
  sortque: function(arr) {
    // order array by que asc
    arr.sort((a,b)=>a.field("Que")-b.field("Que"));
  },
  sorttime: function(arr) {
    // order arr by TimeIn asc (if any is null, TimeIn is max)
    arr.sort((a,b)=>{
      let q1 = a.field("TimeIn")? my.gdate(a.field("TimeIn")): 86400000;
      let q2 = b.field("TimeIn")? my.gdate(b.field("TimeIn")): 86400000;
      return q1-q2;
    });
  },
  findInx: function(e, arr) {
    //q.findIndex by this entry.id
    if(arr.length>0)
      return arr.findIndex(v=>v.id==e.id);
    else
      return -1;
  },
  insert: function(e, arr) {
    // get this que
    let thisq = Number(e.field("Que"));
    if (thisq>0)  // thisq > 0
      // insert this entry to position by que
      arr.splice(thisq-1, 0, e);
    else  // thisq <= 0
      // append this entry to q
      arr.push(e);
  },
  remove: function(e, arr) {
    // findInx and remove this entry from q
    let inx = this.findInx(e, arr);
    if(inx>-1)
      arr.splice(inx, 1);
  },
  run : function (e) {
    if (my.gdate(e.field("TimeIn")) != my.gdate(old.field("TimeIn")) || e.field("Que") != old.field("Que") || e.field("Status") != old.field("Status") || e.field("ORType") != old.field("ORType") || my.gdate(e.field("Date")) != my.gdate(old.field("Date"))) {
      // load old entry to o, load  new entry to q
      que.load.call(this, e);
      que.sortque(que.o);
      que.sortque(que.q);
      // remove old and save old
      if (my.gdate(e.field("Date")) != my.gdate(old.field("Date")) || e.field("ORType") != old.field("ORType")) {
        que.remove(e, que.o);
        que.save(que.o);
        e.set("Que", "00");   // for append to q
      }
      // remove new or change new 
      if (e.field("Status") == "Not") {  // change Status -> Not
        que.remove(e, que.q);
        e.set("Que", "00");
      }
      else {  
        que.remove(e, que.q);
        que.insert(e, que.q);
      }
      //reorder by TimeIn -> set new que to every entry
      que.save(que.q);
    }
  },
  oldsave : function (arr) {
    arr.forEach(v=>{
      // get que data
      let qstr = '"Que":"' + v.field("Que") + '"';
      // replace to "que":"xx" in previous
      let previous = v.field("Previous").replace(/"Que":"\d\d"/, qstr);
      // set new previous
      v.set("Previous", previous);
    });
  },
  runeffect : function(e) { // when que.save -> every entry rearrange in que -> finally save que in previous
    if(e.field("ORType")!=old.field("ORType") || my.gdate(e.field("Date"))!=my.gdate(old.field("Date"))) {
      que.oldsave(que.o);
    }
    que.oldsave(que.q);
  }
};
var emx = {
  checkduplicate : function (e) {
    let found = false;
    let libfrom = lib().title;
    let min = this.lib==libfrom? 1: 0;
    let links = e.field("Patient");
    if (links.length>0) {
      let ptent = pt.findById(links[0].id);
      let entlinks = ptent.linksFrom(this.lib, "Patient");
      if (entlinks.length > min) {
        for (let i=0; i<entlinks.length; i++) {
          if (my.gdate(entlinks[i].field(this.opdate)) == my.gdate(e.field("AppointDate")) && entlinks[i].id!=e.id){
            found = true;
            break ;
          }
        }
      } 
    }
    return found;
  },
  createnew : function (e) {
    let last = null;
    let links = e.field("Patient");
    if (links.length>0 && links[0].field("Status")!="Dead") {
      let lib = this.lib!="Consult"? or: cs;
      
      if (true) {
        let ent = new Object();
        last = lib.create(ent);
        old.save.call(this, last);
        
        last.set(this.opdate,  e.field("AppointDate"));
        last.link("Patient", links[0]);
        last.set("Dr", e.field("Dr"));
        last.set("Underlying", e.field("Underlying"));
        if (e.field("Photo").length>0)
          last.set("Photo", e.field("Photo").join());
        if(this.lib!="Consult") {
          last.set("Op", e.field("Operation"));
          last.set("Dx", e.field("Diagnosis"));
          let ortype = fill.ortypebyop(last);
          if (ortype)
            last.set("ORType", ortype);
        }
        else {
          last.set("Dx", e.field("Diagnosis"));
        }
        let vstype = fill.visittypebydx.call(this, last);
        if (vstype)
          last.set("VisitType", vstype);

        trig.BeforeEdit.call(this, last, "update");
        trig.AfterEdit.call(this, last, "create");
        //message("successfully created new Entry") ;
      }
    }
    return last;
  }, 
  run : function (e) {
    let last = null;
    let hdents = cal.getEntries(e.field("AppointDate"));
    let outofduty = false;
    let holiday = false;
    let opextra = false;
    let calname = "";
    if(hdents && hdents.length) {
      const regOH = new RegExp("or\\s*นอกเวลา", "i");
      outofduty = hdents.some(h => h.field("OutOfDuty"));
      holiday = hdents.some(h => h.field("Holiday")) || my.gday(e.field("AppointDate"))==0 || my.gday(e.field("AppointDate"))==6;
      opextra = hdents.some(h => regOH.test(h.field("Title")));
      let found = hdents.find(h => regOH.test(h.field("Title")));
      if (found) calname = found.field("Calendar");
    }
    
    let duplicate = false;
    if (e.field("EntryMx")== "F/U" &&  e.field("AppointDate")) {
      duplicate = emx.checkduplicate.call(cso, e);
      if(!duplicate) {
        last = emx.createnew.call(cso, e);
        last.show();
        cal.notify(outofduty, holiday, opextra, calname)  // warning when outofduty, holiday, opextra
      }
      else message("Check appoint date whether it is duplicated");
    }
    else if (e.field("EntryMx")== "set OR" &&  e.field("AppointDate")) {
      duplicate = emx.checkduplicate.call(uro, e);
      if(!duplicate) {
        if(outofduty) {
          if(e.field("Dr")!="ชัยพร") {
            last = emx.createnew.call(uro, e);
            last.show();
            cal.notify(outofduty, holiday, opextra, calname)  // warning when outofduty, holiday, opextra
          }
          else {
            let found = hdents.find(h=>h.field("OutOfDuty"));
            if(found) message("This 'AppointDate' overlap with '" + found.field("Title") + "' . please change Appointdate or Dr");
          }
        }
        else {
          last = emx.createnew.call(uro, e);
          last.show();
          cal.notify(outofduty, holiday, opextra, calname)  // warning when outofduty, holiday, opextra
        }
      }
      else message("check appoint date whether it is duplicated");
    }
    else if (e.field("EntryMx")=="F/U" || e.field("EntryMx")=="set OR") {
      message("Appoint date must not leave blank");
    }
    e.set("EntryMx", "<Default>");
  }
};
var dxop = {
  id : 0,
  run : function (e, create, id) {
    dxop.id = id?id:0;
    if(e.field("Status") == "Not" ) { // status not, fill Dx/Op not complete
      dxop.deletelink.call(this, e);
    }
    else { // status plan/done
      let found = dxop.findlink.call(this, e);
      if(found) {
        dxop.updatelink.call(this, e, found, create);
      }
      else {
        found = dxop.create.call(this, e);
        dxop.updatelink.call(this, e, found, create);
      }
    }
  },
  findlink : function (e) {
    let lb = this.lib=="DxAutoFill"?dx:op;
    let lbs = lb.entries();
    let found = null;
    if (lbs.length > 0) {
      found = lbs.find(d=>d.id!=dxop.id && this.title.every((v,i)=>(d.field(v)==e.field(this.link[i]))));
    }
    return found?found:null;
  },
  autofill : function (e) {
    let opLinks = e.field(opo.lib);
    if (opLinks.length == 0) return;

    let opList = opLinks[0];
    
    if (e.field("OpExtra")) {
      if(e.field("x1.5")) {
        e.set("Bonus", opList.field("PriceExtra"));
      }
      else {
        e.set("Bonus", opList.field("Price"));
      }
    }
    else if(!e.field("OpExtra")){
      e.set("Bonus", 0);
    }
    
    let oplength = fill.oplength(e);
    e.set("OpLength", oplength != null ? oplength : opList.field("Optime"));
  },
  updatelink : function (e, found, create) {
    if(e.field(this.lib).length>0) {
      let oldlink = e.field(this.lib)[0];
      if(oldlink.id!=found.id) { // change link
        e.unlink(this.lib, oldlink);
        e.link(this.lib, found);
        dxop.count.call(this, oldlink);
        dxop.count.call(this, found);
      }
    }
    else if(found) { // old link is []
      if (create)
        e.set(this.lib, found.title);
      else
        e.link(this.lib, found);
      dxop.count.call(this, found);
    }
  },
  create : function (e) {
    let o = new Object();
    let lb;
    if(this.lib=="DxAutoFill"){
      lb = dx;
      o["Dx"] = e.field("Dx");
      o["Op"] = e.field("Op");
      o["Count"] = 1;
      
      let found = lb.create(o);
    
      old.save.call(this, found);
      return found;
    }
    else {
      lb = op;
      o["OpFill"] = e.field("Op");
      o["OpList"] = "";
      o["Price"] = 0;
      o["PriceExtra"] = 0;
      o["Count"] = 1;
      o["Optime"] = fill.oplength(e);
      o["Visible"] = false; 
      
      let found = lb.create(o);
    
      old.save.call(this, found);
      return found;
    }
  },
  deletelink : function (e) {
    if(e.field(this.lib).length>0) {
      let oldlink = e.field(this.lib)[0];
      e.unlink(this.lib, oldlink);
      dxop.count.call(this, oldlink);
    
      if(this.lib == "OperationList") {
        e.set("Bonus", 0);
        e.set("OpLength", fill.oplength(e));
      }
    }
  },
  setOpType : function (e) {
    let date = e.field("Date");
    let dow = date.getDay();   // 0-6
    let op = e.field("Op").toLowerCase();
    let timein = e.field("TimeIn");
    let timeout = (timein && (timein.getHours()<8 || timein.getHours()>=16)) ? true : false;

    // link entry object
    let opLinks = e.field(opo.lib);
    if (opLinks.length == 0) return;
    
    let opList = opLinks[0];
    let hds = e.field(cal.lib);
    
    if (hds.length == 0) {
      if (!timeout && dow >= 1 && dow <= 5) {
        opList.setAttr("OpType", "ES");
        return;
      }
      else {  // OH
        opList.setAttr("OpType", "OH");
        return;
      }
    }
    
    if (hds.some(h => h.field("OutOfDuty"))) return;

    // SM (Special Medical)
    if (op.indexOf("smc") >  -1) {
      opList.setAttr("OpType", "SM");
      return;
    }

    // OH (Off-Hour)
    // เงื่อนไข: Holidays-Title = OR นอกเวลา
    const regOH = new RegExp("or\\s*นอกเวลา", "i");
    let holOH = hds.some(h => regOH.test(h.field("Title")));
    if (holOH) {
      opList.setAttr("OpType", "OH");
      return;
    }

    // ES (Elective Surgery)
    // จันทร์–ศุกร์ + ไม่ใช่วันหยุด + ไม่ใช่ OutOfDuty + เวลา 08:00–15:59
    let isholiday = hds.some(h => h.field("Holiday"));
    if (!timeout && dow >= 1 && dow <= 5 && !isholiday) {
      opList.setAttr("OpType", "ES");
      return;
    }
    else {  // EM (Emergency)
      opList.setAttr("OpType", "EM");
      return;
    }
  },
  count : function (e) {
    let linkuro = e.linksFrom("UroBase", this.lib);
    let linkbup = e.linksFrom("Backup", this.lib);
    let all = [];
    for(let i=0; i<linkuro.length; i++) {
      all.push(linkuro[i]);
    }
    for(let i=0; i<linkbup.length; i++) {
      all.push(linkbup[i]);
    }
    if(all.length>0) {
      e.set("Count", all.length);
      if (this.lib=="OperationList") {
        let total =0;
        let count =0;
        for (let i=0; i<all.length; i++) {
          let oplength = fill.oplength(all[i]);
          if(oplength) {
            total+=oplength;
            count++;
          }
        }
        if (count>0)
          e.set("Optime", Math.floor(total/count));
        else
          e.set("Optime", null);
      }
    }
    else {
      e.set("Count", 0);
      e.trash();
    }
  },
  effectother : function(e){
    let oe = this.title.map(f=>old.field(f));
    let orlinks = e.linksFrom("UroBase", this.lib);
    let bulinks = e.linksFrom("Backup", this.lib);
    if (orlinks.length+bulinks.length==0) {
      let dxops = this.lib=="DxAutoFill"?dx.entries():op.entries();
      let found = dxops.find(a=>a.id!=e.id && this.title.every((f,i)=>a.field(f) == e.field(f)) );
      if (found) {
        old.load(found);
        e = found;
        orlinks = found.linksFrom("UroBase", this.lib);
        bulinks = found.linksFrom("Backup", this.lib);
      }
    }
    
    if (orlinks.length+bulinks.length>0) {
      let all = [];
      let lib = [];
      for(let i=0; i<orlinks.length; i++) {
        all.push(orlinks[i]);
        lib.push("UroBase");
      }
      for(let i=0; i<bulinks.length; i++) {
        all.push(bulinks[i]);
        lib.push("Backup");
      }
      for(let i=0; i<all.length; i++) {
        let u = all[i];
        let l = lib[i]=="UroBase"?uro:buo;
        old.load(u);
        let ou = this.link.map(f=>old.field(f));
        if (this.title.every((f,i)=>u.field(this.link[i]) == e.field(f) && ou[i] == oe[i])) {
          rpo.updatenew(u);
          old.save.call(l, u);
        }
      }
    }
  }
};
var valid = {
  dxop : function(e){
    let dx = e.field("Dx").trim();
    if (dx) {
      if(old.field("Dx")!=dx)
        e.set("Dx", dx.replace(/-|#/g, '').replace(/\s+/g, ' '));
    }
    else {
      message("field 'Dx' must fill anything. Try again.");
      cancel();
      exit();
    }
    if (this.lib!="Consult") {
      let op = e.field("Op").trim();
      if (op) {
        if(old.field("Op")!=op)
          e.set("Op", op.replace(/-|#/g, '').replace(/\s+/g, ' '));
      }
      else {
        message("field 'Op' must fill anything. Try again.");
        cancel();
        exit();
      }
    }
  },
  //un-duplicate HN
  uniqueHN : function (e, value) {
    let unique = true;
    let HN = e.field("HN");
    if (HN != null) {
      let entries = pt.entries();
      for (let ent=0; ent<entries.length; ent++) {
        if (entries[ent].field("HN") === HN)
          if (entries[ent].id != e.id || value) 
            unique = false;
      }
      if (!unique) {
        message("field 'HN' is not unique. Try again.");
        cancel();
        exit();
      }
    }
  }, 
  //un-duplicate UroBase, Consult, Backup
  uniqueVisit : function (e, value) {
    let unique = true;
    let fieldname = [this.opdate, "Patient", "Dx", this.op];
    let lb;
    if (this.lib=="UroBase")
      lb = or;
    else if (this.lib=="Consult")
      lb = cs;
    else if (this.lib=="Backup")
      lb = bu;
    let entries = lb.entries();
    entries.forEach(v=>{
      if (fieldname.every(f=>{
        if (f.includes("Date")) 
          return my.gdate(v.field(f))==my.gdate(e.field(f));
        else if (f=="Patient") {
          if(v.field(f) && v.field(f).length>0 && e.field(f) && e.field(f).length>0){
            return v.field(f)[0].id==e.field(f)[0].id;
          }
          else {
            return false
          }
        }
        else if (f=="Rx")
          return true;
        else
          return v.field(f)==e.field(f);
      }))
        if (v.id != e.id || value) 
          unique = false;
    });
    if (!unique) {
      message("field " + fieldname.join() + " some are not unique. Try again.");
      cancel();
      exit();
    }
  },
  uniqueDxOp : function (e, create) {
    let unique = true;
    let ents = this.lib=="DxAutoFill"?dx.entries():op.entries();
    if (ents.some(v=>(create || v.id!=e.id) && this.title.every(f=>v.field(f)==e.field(f)))) {
      unique = false;
    }
    return unique;
  },
  // check opdate is not working elsewhere 
  opdateOutOfDuty : function(e) {
    let hds = e.field(cal.lib);
    if (hds.length > 0) {
      let found = hds.find(h => h.field("OutOfDuty") === true);
      if (found) {
        let title = found.field("Title");
        message("วันนี้ไม่ว่าง : " + title + ", กรุณาเปลี่ยนวันผ่าตัด");
        cancel();
      }
    }
  }
};
var fill = {
  setnewdate: function (e) {
    if (my.gdate(old.field(this.opdate)) != my.gdate(e.field(this.opdate))) {
      e.set(this.opdate, my.date(e.field(this.opdate)));
    }
    if (my.gdate(old.field("VisitDate")) != my.gdate(e.field("VisitDate"))) {
      e.set("VisitDate", my.date(e.field("VisitDate")));
    }
    if (my.gdate(old.field("DischargeDate")) != my.gdate(e.field("DischargeDate"))) {
      e.set("DischargeDate", my.date(e.field("DischargeDate")));
    }
    if (my.gdate(old.field("AppointDate")) != my.gdate(e.field("AppointDate"))) {
      e.set("AppointDate", my.date(e.field("AppointDate")));
    }
    if(this.lib!="Consult") {
      if (my.gdate(old.field("RecordDate")) != my.gdate(e.field("RecordDate"))) {
        e.set("RecordDate", my.date(e.field("RecordDate")));
      }
    }
  },
  setortype : function (e, create) {
    if(create && old.field("Op")!=e.field("Op") && e.field("Op") && old.field("ORType") == e.field("ORType")) {
      let ortype = fill.ortypebyop(e);
      if (ortype)
        e.set("ORType", ortype);
    }
  } ,
  setvisittype : function (e, create) {
    if(e.field("Merge") && e.field("VisitType") == "OPD")
      e.set("VisitType", "Admit");
    if(create && old.field("Dx")!=e.field("Dx") && e.field("Dx") && old.field("VisitType") == e.field("VisitType")) {
      let vstype = fill.visittypebydx.call(this, e);
      if (vstype)
        e.set("VisitType", vstype);
    }
  } ,
  setward : function (e) {
    if(e.field("VisitType")=="OPD" && e.field("Ward")!="OPD") {
      e.set("Ward", "OPD");
    }
    else if(e.field("VisitType")!="OPD" && e.field("Ward")=="OPD") {
      e.set("Ward", "Uro");
    }
  } ,
  setvisitdate : function (e) {
    if(this.lib!="Consult") {
      if(e.field("ORType") == "LA" && e.field("VisitType") == "OPD" && (my.gdate(e.field("VisitDate")) != my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", e.field(this.opdate));
      }
      else if(e.field("ORType") == "LA" && e.field("VisitType") == "Admit" && (my.gdate(e.field("VisitDate")) > my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", e.field(this.opdate));
      }
      else if(e.field("ORType") == "GA" && e.field("VisitType") == "Admit" && (my.gdate(e.field("VisitDate")) > my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", my.dateminus(e.field(this.opdate), 1));
      }
    }
    else { // this.lib == "Consult"
      if(e.field("VisitType") == "OPD" && (my.gdate(e.field("VisitDate")) != my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", e.field(this.opdate));
      }
      else if(e.field("VisitType") == "Admit" && (my.gdate(e.field("VisitDate")) > my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", e.field(this.opdate));
      }
    }
  },
  sumpasthx : function (e, date) {
    let orlinks = e.linksFrom("UroBase", "Patient");
    let bulinks = e.linksFrom("Backup", "Patient");
    let list = [] ;
    let str = "";
    if (orlinks.length>0) {
      for (let i=0; i<orlinks.length; i++) {
        if (orlinks[i].field("Status")=="Done" && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)) {
          list.push(orlinks[i]);
        }
      }
    }
    if (bulinks.length>0) {
      for (let i=0; i<bulinks.length; i++) {
        if (bulinks[i].field("Status")=="Done"  && my.gdate(bulinks[i].field("Date")) <= my.gdate(date)) {
          list.push(bulinks[i]);
        }
      }
    }
    list.sort((a, b) => {
      if(a.field("Date")<b.field("Date"))
        return -1;
      else if(a.field("Date")>b.field("Date"))
        return 1;
      else
        return 0;
    });
    for(let i=0; i<list.length; i++){
      if(str) str += "\n";
      str += list[i].field("Dx") + " > " + list[i].field("Op") + " " + list[i].field("Date").toDateString().replace(/mon|tue|wed|thu|fri|sat|sun/ig,"");
    }
    return str;
  },
  pasthx : function (e) {
    let links = e.field("Patient");
    if(links.length && !e.field("PastHx")){
      let ptent = pt.findById(links[0].id) ;
      e.set("PastHx", fill.sumpasthx(ptent, my.dateminus(e.field(this.opdate), 1)));
    }
  },
  ortypebyop : function (e) {
    let libs = [or, bu];
    let matches = [];
    for (let l=0; l<libs.length; l++) {
      let ors = libs[l].find(e.field("Op"));
      if(ors.length>0) {
        for (let i=0; i<ors.length; i++) {
          if(ors[i].field("Dx")==e.field("Dx") && ors[i].field("Op")==e.field("Op") && ors[i].id!=e.id) {
            let o = new Object();
            o["dx"] = ors[i].field("Dx");
            o["op"] = ors[i].field("Op");
            o["type"] = ors[i].field("ORType");
            matches.push(o);
          }
        }
      }
    }
    
    if(matches.length>0) {
      let group = {};
      matches.forEach(v => {
        group[v.dx+">"+v.op+">"+v.type] = (group[v.dx+">"+v.op+">"+v.type] || 0) + 1;
      });
      let results = Object.keys(group).map(key => {
        let arr = key.split(">");
        let o = new Object();
        o["dx"] = arr[0];
        o["op"] = arr[1];
        o["type"] = arr[2];
        o["count"] = group[key];
        return o;
      });
      results.sort((a,b)=>{return b.count-a.count});
      return results[0].type;
    }
    else {
      return null;
    }
  },
  visittypebydx : function (e) {
    let libs = [or, bu, cs];
    let matches = [];
    for (let l=0; l<libs.length; l++) {
      let ors = libs[l].find(e.field("Dx"));
      if(ors.length>0) {
        for (let i=0; i<ors.length; i++) {
          if(ors[i].field("Dx")==e.field("Dx")  && ors[i].id!=e.id) {
            let o = new Object();
            o["dx"] = ors[i].field("Dx");
            o["type"] = ors[i].field("VisitType");
            matches.push(o);
          }
        }
      }
    }
    
    if(matches.length>0) {
      let group = {};
      matches.forEach(v => {
        group[v.dx+">"+v.type] = (group[v.dx+">"+v.type] || 0) + 1;
      });
      let results = Object.keys(group).map(key => {
        let arr = key.split(">");
        let o = new Object();
        o["dx"] = arr[0];
        o["type"] = arr[1];
        o["count"] = group[key];
        return o;
      });
      results.sort((a,b)=>{return b.count-a.count});
      return results[0].type;
    }
    else {
      if(this.lib!="Consult") {
        if(e.field("ORType")=="LA")
          return "OPD";
        else if(e.field("ORType")=="GA")
          return "Admit";
      }
      else {
        return null;
      }
    }
  },
  statusbyresult : function(e) {
    let opresult = e.field(this.result);
    let notonly = opresult.match(this.notonlyreg);
    let notdone = opresult.match(this.notdonereg);
    notonly = notonly==null?0:notonly.length;
    this.notdone = notdone==null?0:notdone.length;
    
    if(opresult) {
      if(this.notdone) {
        e.set("Status", "Not");
        e.set("DischargeDate", null);
        let links = e.field("Patient");
        if(links.length>0 && links[0].field("Status")=="Active") {
          links[0].set("Status", "Still");
        }
      }
      else if(notonly)
        e.set("Status", "Not");
      else {
        e.set("Status", "Done");
        if (e.field("VisitType") == "OPD")
          e.set("DischargeDate", e.field("VisitDate"));
      }
    }
    else {
      e.set("Status", "Plan");
      if (e.field("Merge") == false && old.field("Merge") == false)
        e.set("DischargeDate", null);
    }
  },
  djbyresult : function(e) {
    if (this.lib != "Consult" && e.field("Status") != "Not") {
        let opresult = (e.field(this.result) || "").toLowerCase();
        let optext   = (e.field("Op") || "").toLowerCase();
        
        if (!opresult) {
            e.set("DJstent", null);
            return;
        }

        // -----------------------------
        // 1) หมวด "ไม่ใช่ DJ / ทำไม่สำเร็จ"
        // -----------------------------
        const notDJregex = new RegExp(
            "(" +
            // อังกฤษ: fail … dj
            "\\b(no|not|can't|cannot|dont|don't|failed|fail|unable)\\b.*\\bdj\\b" +
            "|" +
            // ไทย: ไม่สามารถ … dj
            "(ไม่ใส่|ไม่ได้ใส่|ไม่สามารถใส่).*dj" +
            "|" +
            // ไทย: ใส่ … dj … ไม่ได้
            "(ใส่|ทำ|on|insert).*dj.*(ไม่ได้|ไม่สำเร็จ)" +
            ")",
            "i"
        );

        // -----------------------------
        // 2) on DJ
        // -----------------------------
        const onDJregex = new RegExp(
            "\\b(on|insert|place|put)\\b.*\\bdj\\b|" +
            "(ใส่|ทำ).*dj",
            "i"
        );

        // -----------------------------
        // 3) off DJ
        // -----------------------------
        const offDJregex = new RegExp(
            "\\b(off|remove|take\\s*out)\\b.*\\bdj\\b|" +
            "(เอา|ถอน).*dj.*(ออก)?",
            "i"
        );
        
        // -----------------------------
        // 4) change DJ
        // -----------------------------
        const changeDJregex = new RegExp(
            "\\b(change|replace|redo)\\b.*\\bdj\\b" +
            "(เปลี่ยน).*dj",
            "i"
        );

        /// -----------------------------
        // 5) ตรวจผล
        // -----------------------------
        const isNotDJ   = notDJregex.test(opresult);
        const isOn      = onDJregex.test(opresult)     || onDJregex.test(optext);
        const isOff     = offDJregex.test(opresult)    || offDJregex.test(optext);
        const isChange  = changeDJregex.test(opresult) || changeDJregex.test(optext);
        
        e.set("DJstent", null);

        if (!isNotDJ) {
            if (isChange)
                e.set("DJstent", "change DJ");
            else if (isOff)
                e.set("DJstent", "off DJ");
            else if (isOn)
                e.set("DJstent", "on DJ");
        }
    }
    else if (this.lib != "Consult" && e.field("Status") == "Not") {
        e.set("DJstent", null);
    }
  },
  resultbydate : function(e) {
    let opresult = e.field(this.result);
    
    if(opresult) {
      if(this.lib!="Consult") {
        if(my.gdate(e.field("Date"))<=ntoday) {
          let d = Math.floor((ntoday-my.gdate(e.field("Date")))/86400000);
          let found = opresult.match(/today\s?[+-]?[\d\s]+/ig);
          if (found) {
            let txtarr = found.map((v, i)=>{
              let num = parseInt(v.replace(/\s+/g, "").replace(/today/i, ""));
              num = isNaN(num)?0:num;
              return {"txt" : v, "inx" : i, "num" : num+d};
            });
            opresult = txtarr.reduce((t,v)=>{
              return t.replace(v.txt, "P/O day" + v.num + ": ");
            }, opresult);
          }
        }
      }
      else {
        if(my.gdate(e.field("VisitDate"))<=ntoday) {
          let d = Math.floor((ntoday-my.gdate(e.field("VisitDate")))/86400000);
          let found = opresult.match(/today\s?[+-]?[\d\s]+/ig);
          if (found) {
            let txtarr = found.map((v, i)=>{
              let num = parseInt(v.replace(/\s+/g, "").replace(/today/i, ""));
              num = isNaN(num)?0:num;
              return {"txt" : v, "inx" : i, "num" : num+d};
            });
            opresult = txtarr.reduce((t,v)=>{
              return t.replace(v.txt, "P/V day" + v.num + ": ");
            }, opresult);
          }
        }
      }
      e.set(this.result, opresult);
    }
  },
  resulteffect : function(e) {
    let opresult = e.field(this.result).replace(/ +/g, ' ').trim().replace(/\n +/g, '\n');
    e.set(this.result, opresult);
    fill.statusbyresult.call(this, e);
    fill.djbyresult.call(this, e);
  },
  track : function (e) {
    if (!this.notdone && e.field("VisitType")=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && e.field("DischargeDate") == null && e.field("Summary") == true && old.field("Summary") == false) {
      e.set("Track", 3);
      e.set("DischargeDate", today);
    }
    else if (!this.notdone && e.field("VisitType")=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate") == null || my.gdate(e.field("DischargeDate")) > ntoday) ) {//Admit
      if (e.field("Track") == 0) {
        e.set("Track", 1) ;
      }
      else if (e.field("Track") == 3) {
        e.set("Track", 2) ;
      }
      e.set("DischargeDate", null);
    }
    else if (!this.notdone && e.field("VisitType")=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && my.gdate(e.field("DischargeDate")) <= ntoday ) { // D/C
      e.set("Track", 3) ;
      e.set("Summary", true);
    }
    else if (e.field("VisitType")=="Admit" && my.gdate(e.field("VisitDate")) > ntoday) { // future
      e.set("Track", 0) ;
      e.set("DischargeDate", null);
    }
    else if (this.notdone) { // notdone
      e.set("Track", 0) ;
      e.set("DischargeDate", null);
    }
  },
  linkunderlying : function (e) {
    let lib = masterLib();
    let ent = masterEntry();
    if (lib.title=="UroBase"||lib.title=="Consult"||lib.title=="Backup") {
      ent.set("Underlying", e.field("Underlying").join());
    }
  },
  underlying : function (e) {
    if (this.lib == "Patient") {
      if (e.field("Underlying").join()!=old.field("Underlying").join()) {
        let urs = e.linksFrom("UroBase", "Patient");
        let bus = e.linksFrom("Backup", "Patient");
        let css = e.linksFrom("Consult", "Patient");
        for (let i=0; i<urs.length; i++) {
          urs[i].set("Underlying", e.field("Underlying").join());
        }
        for (let i=0; i<bus.length; i++) {
          bus[i].set("Underlying", e.field("Underlying").join());
        }
        for (let i=0; i<css.length; i++) {
          css[i].set("Underlying", e.field("Underlying").join());
        }
      }
    }
    else if (this.lib == "UroBase" || this.lib == "Backup" || this.lib == "Consult") {
      let p = e.field("Patient");
      if (p.length>0) {
        e.set("Underlying", p[0].field("Underlying").join());
      }
    }
  }, 
  los : function (e) {
    let diff;
    if(this.notdone) {
      diff = null;
    }
    else if (e.field("VisitDate") != null && e.field("DischargeDate") != null && my.gdate(e.field("DischargeDate"))>=my.gdate(e.field("VisitDate"))) {
      diff = Math.floor((my.gdate(e.field("DischargeDate"))-my.gdate(e.field("VisitDate")))/86400000);
    }
    else if(e.field("VisitDate") != null && e.field("DischargeDate") == null && ntoday>=my.gdate(e.field("VisitDate"))){
      diff = Math.floor((ntoday-my.gdate(e.field("VisitDate")))/86400000);
    }
    else {
      diff = null;
    }
    e.set("LOS", diff);
    e.set("LOSDisp", diff);
  }, 
  dr : function (e, value) {
    let link = e.field("Patient");
    if (link.length>0 && value) {
      if (old.field("Dr")==e.field("Dr") && e.field("Dr")!=link[0].field("Dr")) {
        e.set("Dr", link[0].field("Dr"));
      }
    }
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
    if (e.field("TimeOut") > e.field("TimeIn")) {
      return e.field("TimeOut")-e.field("TimeIn");
    }
    else if (e.field("TimeIn") > e.field("TimeOut")) {
      return 86400000-(e.field("TimeIn")-e.field("TimeOut"));
    }
    else {
      return null;
    }
  },
  descripttxt : function (e) {
    let arr = [];
    if (e.field("Dx")) arr.push(e.field("Dx"));
    if (e.field(this.op)) arr.push(e.field(this.op));
    if (this.lib=="UroBase" && e.field(this.result)) arr.push(e.field(this.result));
    return arr.join("->");
  },
  ptstatus : function (e) {
    let links = e.field("Patient");
    if (links.length>0) {
      let ptent = pt.findById(links[0].id);
        
      let o = pto.findLast(true, true, ptent, today, e, this);
      let str = "" ;
      if (o.length==0) { // never Visit
        links[0].set("WardStamp",null);
        links[0].set("Ward",  e.field("VisitType")=="Admit"?e.field("Ward"):"OPD");
        links[0].set("Descript", "");
        links[0].set("Status", "Still");
        links[0].set("LastDischarge", null);
      }
      else { // ever visit
        let lib;
        if(o[0].lib=="UroBase") lib = uro;
        else if(o[0].lib=="Backup") lib = buo;
        else if(o[0].lib=="Consult") lib = cso;
          
        str = fill.descripttxt.call(lib, o[0].e);
        links[0].set("Descript", str);
        links[0].set("WardStamp", o[0].e.field("VisitDate"));
        if (o[0].e.field("VisitType")=="Admit") {
          links[0].set("Ward", o[0].e.field("Ward"));
          links[0].set("LastDischarge", o[0].e.field("DischargeDate"));
        }
        else {
          links[0].set("Ward", "OPD");
          links[0].set("LastDischarge", o[0].e.field("VisitDate"));
        }
        
        let dead = o[0].e.field(lib.result).match(/dead|death/ig);
        dead = dead?dead.length:0;
        if (o[0].e.field("Active")!=null || dead) { // last entry is active
          if (dead) { // dead
            links[0].set("Status" ,"Dead");
          }
          else  { //Admit or OPD visit today
            links[0].set("Status" ,"Active");
          }
        }
        else if (links[0].field("Status")!="Dead") { //  this entry is not active
          links[0].set("Status", "Still");
        }
      }
      return o;
    }
    return [];
  }, 
  ptnextstatus : function (e) {
    let links = e.field("Patient");
    if (links.length>0) {
      let ptent = pt.findById(links[0].id);
        
      let o = pto.findNext(true, ptent, today, e, this);
      let str = "" ;
      if (o.length==0) { // never Visit
        links[0].set("NextVisit",null);
        links[0].set("NextDescript", "");
      }
      else { // have next visit
        let lib;
        if(o[0].lib=="UroBase") lib = uro;
        else if(o[0].lib=="Backup") lib = buo;
        else if(o[0].lib=="Consult") lib = cso;
          
        str = fill.descripttxt.call(lib, o[0].e);
        links[0].set("NextDescript", str);
        links[0].set("NextVisit", o[0].e.field("VisitDate"));

        let vsdiff = Math.floor((my.gdate(o[0].e.field("VisitDate"))-ntoday)/86400000);
        if(vsdiff>=0 && vsdiff<8) {
          links[0].set("Descript", str);
        }
      }
      return o;
    }
    return [];
  },
  opdiff : function(e, o, n) {
    let links = e.field("Patient");
    if (links.length>0) {
      let ptent = links[0];
      o = o.filter(v=>v.lib!="Consult" && v.e.field("Status")!="Not");
      n = n.filter(v=>v.lib!="Consult" && v.e.field("Status")!="Not");
      if(o.length>0 && (my.gdate(ptent.field("WardStamp"))<=ntoday) && ((ptent.field("LastDischarge")==null) || (ntoday < my.gdate(ptent.field("LastDischarge")))) ) { // admit or OPD OR LA
        ptent.set("OpDiff", Math.floor((my.gdate(o[0].e.field("Date"))-ntoday)/86400000));
      }
      else if(n.length>0) { // found next visit
        ptent.set("OpDiff", Math.floor((my.gdate(n[0].e.field("Date"))-ntoday)/86400000));
      }
      else { // pass last admit, or no visit
        ptent.set("OpDiff", -1000);
      }
    }
  } ,
  color : function (e) {
    if(this.lib!="Consult") {
      if(e.field("Status")=="Not") {
        if(e.field("Color")!="#5B5B5B") e.set("Color", "#5B5B5B");
      } 
      else if(e.field("Status")=="Plan") {
        if (e.field("Active")!=null){
          if (e.field("VisitType")=="OPD") {
            if(e.field("Color")!="#A7FF87") e.set("Color", "#A7FF87"); 
          } 
          else { // Admit
            if(e.field("Color")!="#5CD3FF") e.set("Color", "#5CD3FF"); 
          } 
        } 
        else { // no Active
          if (e.field("VisitType")=="OPD"){
            if(e.field("Color")!="#ABC39A") e.set("Color", "#ABC39A");
          }
          else { // Admit
            if(e.field("Color")!="#66B2FF") e.set("Color", "#66B2FF");
          } 
        } 
      }
      else if(e.field("Status")=="Done") {
        if (e.field("Active")!=null){
          if (e.field("VisitType")=="OPD") {
            if(e.field("Color")!="#6EB73D") e.set("Color", "#6EB73D"); 
          } 
          else { // Admit
            if(e.field("Color")!="#00B0F0") e.set("Color", "#00B0F0"); 
          } 
        } 
        else { // no Active
          if (e.field("VisitType")=="OPD"){
            if(e.field("Color")!="#577244") e.set("Color", "#577244");
          }
          else { // Admit
            if(e.field("Color")!="#3974AA") e.set("Color", "#3974AA");
          } 
        } 
      }
    }
    else { // lib == Consult
      if(e.field("Status")=="Not") {
        if(e.field("Color")!="#5B5B5B") e.set("Color", "#5B5B5B");
      } 
      else if (e.field("Active")!=null){
        if (e.field("VisitType")=="OPD"){
          if(e.field("Color")!="#6EB73D") e.set("Color", "#6EB73D");
        }
        else { // Admit
          if(e.field("Color")!="#00B0F0") e.set("Color", "#00B0F0");
        } 
      } 
      else { // not Active
        if (e.field("VisitType")=="OPD"){
          if(e.field("Color")!="#577244") e.set("Color", "#577244");
        }
        else { // Admit
          if(e.field("Color")!="#3974AA") e.set("Color", "#3974AA");
        } 
      }
    }
  },
  future : function(e){
    if(my.gdate(e.field(this.opdate))>=ntoday)
      e.set("Future", Math.floor((my.gdate(e.field(this.opdate))-ntoday)/86400000));
    else
      e.set("Future", null);
  },
  active : function(e){
    if( !this.notdone && ( (e.field("VisitType")=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate") == null || my.gdate(e.field("DischargeDate")) > ntoday)) || (e.field("VisitType")=="OPD" && my.gdate(e.field("VisitDate")) == ntoday) ) ) {//Admit or OPD visit today
      if (e.field("VisitType")=="Admit") {
        e.set("Active", Math.floor((ntoday-my.gdate(e.field("VisitDate")))/86400000));
      }
      else if (e.field("VisitType")=="OPD") {
        e.set("Active", 0);
      }
    }
    else {
      e.set("Active", null);
    }
  },
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
  },
  twodigit : function(value) {
    if(value<10)
      return "0"+value.toString();
    else
      return value.toString();
  },
  ptDetail : function (e) {
    let links = e.field("Patient");
    if (links.length>0) {
      let ptent = pt.findById(links[0].id) ;
      if(ptent) {
        pto.djStamp(ptent);
        pto.reop(ptent);
      }
    }
  },
  lastOther : function (e) {
    if (e.field("Patient").length>0) {
      let ptent = pt.findById(e.field("Patient")[0].id);
      let date = e.field("VisitDate");
      return pto.findLast(true, false, ptent, date, e, this);
    }
    return [];
  },
  opDetail : function (e) {
    let links = e.field(opo.lib);
    if (links.length>0) {
      let opent = links[0] ;
      opo.fillOpList(opent);
    }
  }
};
var pto = {
  lib : "Patient",
  rearrangename : function(e) {
    let newname = e.field("PtName").replace(/\s+/g, ' ').trim();
    e.set("PtName", newname);
  }, 
  getYMD : function(birthday) {
    let ymd = []
    if(my.isDate(birthday)) {
      let ageDifMs = Date.now() - birthday.getTime();
      let ageDate = new Date(ageDifMs); // miliseconds from epoch
      ymd.push(Math.abs(ageDate.getUTCFullYear() - 1970));
      ymd.push(ageDate.getUTCMonth());
      ymd.push(ageDate.getUTCDate());
      return ymd
    }
    else if(my.isDateStr(birthday)) {
      let ageDifMs = Date.now() - new Date(birthday).getTime();
      let ageDate = new Date(ageDifMs); // miliseconds from epoch
      ymd.push(Math.abs(ageDate.getUTCFullYear() - 1970));
      ymd.push(ageDate.getUTCMonth());
      ymd.push(ageDate.getUTCDate());
      return ymd
    }
    else {
      return null
    }
  },
  getBirthday : function(ymd) {
    if(ymd.length==3) {
      return new Date(today.getFullYear()-ymd[0], today.getMonth()-ymd[1], today.getDate()-ymd[2], 7)
    }
    else {
      return null
    }
  },
  agetext : function (e, ymd) {
    if (ymd[0]){
      e.set("Age", ymd[0] + " ปี");
    }
    else if (ymd[1]){
      e.set("Age", ymd[1] + " เดือน");
    }
    else if(ymd[2]) {
      e.set("Age" , ymd[2] + " วัน");
    }
    else {
      e.set("Age", "");
    }
  }, 
  //Age
  age : function (e) {
    let oldDOB = old.field("Birthday")?old.field("Birthday").toDateString():"";
    let eDOB = e.field("Birthday")?e.field("Birthday").toDateString():"";
    if(oldDOB != eDOB) {
      if(eDOB) {
        let ymd = this.getYMD(e.field("Birthday"));
        e.set("YY", ymd[0]);
        e.set("MM", ymd[1]);
        e.set("DD", ymd[2]);
        this.agetext(e, ymd);
      }
      else {
        e.set("YY", null)
        e.set("MM", null);
        e.set("DD", null);
        this.agetext(e, [0,0,0]);
      }
    }
    else if(old.field("YY") != e.field("YY") || old.field("MM") != e.field("MM") || old.field("DD") != e.field("DD")) {
      if(e.field("YY") || e.field("MM") || e.field("DD")) {
        let ymd = []
        ymd.push(e.field("YY")?e.field("YY"):0);
        ymd.push(e.field("MM")?e.field("MM"):0);
        ymd.push(e.field("DD")?e.field("DD"):0);
        e.set("Birthday", this.getBirthday(ymd))
        this.agetext(e, [e.field("YY"),e.field("MM"),e.field("DD")]);
      }
      else {
        e.set("Birthday", null)
      }
    }
    else {
      if(eDOB) {
        let ymd = this.getYMD(e.field("Birthday"));
        e.set("YY", ymd[0]);
        e.set("MM", ymd[1]);
        e.set("DD", ymd[2]);
        this.agetext(e, ymd);
      }
    }
  }, 
  //DJ stent
  dj : function (e) {
    if (!e.field("DJstent")) {
      e.set("DJStamp", null);
    }
  }, 
  findLast : function(allvisit, withme, ptent, date, e, olib) {
    let eid ;
    let all = [];
    if (ptent) {
      let orlinks = ptent.linksFrom("UroBase", "Patient") ;
      let bulinks = ptent.linksFrom("Backup", "Patient") ;
      let cslinks = ptent.linksFrom("Consult", "Patient") ;
      // if withme==true , there is this entry and this entry is not exist, include it
      if (e) {
        eid = e.id;
        if (olib.lib == "UroBase") {
          if (withme && !orlinks.some(o=>o.id==e.id))
            orlinks.push(e);
        }
        else if (olib.lib == "Backup") {
          if (withme && !bulinks.some(o=>o.id==e.id))
            bulinks.push(e);
        }
        else if (olib.lib == "Consult") {
          if (withme && !cslinks.some(o=>o.id==e.id))
            cslinks.push(e);
        }
      }
      else {
        eid = 0;
      }
      let alllinks = [{"l":orlinks,"o":uro},{"l":bulinks,"o":buo},{"l":cslinks,"o":cso}];
      let lastvsd = 0;
      alllinks.forEach(a=>{
        if (a.l.length>0) {
          for (let i=0; i<a.l.length; i++) {
            let o = new Object();
            let notdone = a.l[i].field(a.o.result).match(a.o.notdonereg);
            o["nd"] = notdone==null?0:notdone.length;
            if ((allvisit || a.l[i].field("VisitType")=="Admit") && !o.nd && my.gdate(a.l[i].field("VisitDate")) <= my.gdate(date)) {
              if (a.l[i].id != eid) { // save to array if not this entry
                o["vsd"] = a.l[i].field("VisitDate");
                o["opd"] = a.l[i].field(a.o.opdate);
                o["lib"] = a.o.lib;
                o["e"] = a.l[i];
                all.push(o);
                // find max VisitDate
                if (lastvsd<my.gdate(a.l[i].field("VisitDate"))) {
                  lastvsd = my.gdate(a.l[i].field("VisitDate"));
                }
              }
              else if (withme && e) { // save this entry to array if withme == true
                o["vsd"] = e.field("VisitDate");
                o["opd"] = e.field(olib.opdate);
                o["lib"] = olib.lib;
                o["e"] = e;
                all.push(o);
                // find max VisitDate
                if (lastvsd<my.gdate(e.field("VisitDate"))) {
                  lastvsd = my.gdate(e.field("VisitDate"));
                }
              }
            }
          }
        }
      });
      // filter by max visitDate
      all = all.filter(o=>my.gdate(o.vsd) == lastvsd);
      // sort by opdate desc
      all.sort((a,b)=>{
        return my.gdate(b.opd)-my.gdate(a.opd);
      });
    }
    return all;
  },
  findNext : function(allvisit, ptent, date, e, olib) {
    let eid ;
    let all = [];
    if (ptent) {
      let orlinks = ptent.linksFrom("UroBase", "Patient") ;
      let bulinks = ptent.linksFrom("Backup", "Patient") ;
      let cslinks = ptent.linksFrom("Consult", "Patient") ;
      // if withme==true , there is this entry and this entry is not exist, include it
      if (e) {
        eid = e.id;
        if (olib.lib == "UroBase") {
          if (!orlinks.some(o=>o.id==e.id))
            orlinks.push(e);
        }
        else if (olib.lib == "Backup") {
          if (!bulinks.some(o=>o.id==e.id))
            bulinks.push(e);
        }
        else if (olib.lib == "Consult") {
          if (!cslinks.some(o=>o.id==e.id))
            cslinks.push(e);
        }
      }
      else {
        eid = 0;
      }
      let alllinks = [{"l":orlinks,"o":uro},{"l":bulinks,"o":buo},{"l":cslinks,"o":cso}];
      let nextvsd = Infinity;
      alllinks.forEach(a=>{
        if (a.l.length>0) {
          for (let i=0; i<a.l.length; i++) {
            let o = new Object();
            let notdone = a.l[i].field(a.o.result).match(a.o.notdonereg);
            o["nd"] = notdone==null?0:notdone.length;
            if ((allvisit || a.l[i].field("VisitType")=="Admit") && !o.nd && my.gdate(a.l[i].field("VisitDate")) > my.gdate(date)) {
              // find min VisitDate
              if (nextvsd>my.gdate(a.l[i].field("VisitDate"))) {
                nextvsd = my.gdate(a.l[i].field("VisitDate"));
              }
              o["vsd"] = a.l[i].field("VisitDate");
              o["opd"] = a.l[i].field(a.o.opdate);
              o["lib"] = a.o.lib;
              o["e"] = a.l[i];
              all.push(o);
            }
          }
        }
      });
      // filter by min visitDate
      all = all.filter(o=>my.gdate(o.vsd) == nextvsd);
      // sort by opdate desc
      all.sort((a,b)=>{
        return my.gdate(b.opd)-my.gdate(a.opd);
      });
    }
    return all;
  },
  lastDJStamp : function (ptent, date)  {
    let orlinks = ptent.linksFrom("UroBase", "Patient") ;
    let bulinks = ptent.linksFrom("Backup", "Patient") ;
    let o = null ;
    let last = null, r = null, u = null;
    if (orlinks.length>0) {
      for (let i=0; i<orlinks.length; i++) {
        if (orlinks[i].field("DJstent") && my.gdate(orlinks[i].field("Date")) > my.gdate(last) && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)) {
          last = orlinks[i].field("Date");
          r=i;
        }
      }
    }
    if (bulinks.length>0) {
      for (let i=0; i<bulinks.length; i++) {
        if (bulinks[i].field("DJstent") && my.gdate(bulinks[i].field("Date")) > my.gdate(last) && my.gdate(bulinks[i].field("Date")) <= my.gdate(date)) {
          last = bulinks[i].field("Date");
          u=i;
        }
      }
    }
    if (last != null){
      if (u==null)
        o = orlinks[r] ;
      else if (u!=null)
        o = bulinks[u] ;
    }
    return o ;
  },
  djStamp : function (ptent) {
    let d = this.lastDJStamp(ptent, today) ;
    if (!d) { // not found
      ptent.set("DJstent", null);
      ptent.set("DJStamp", null);
    } 
    else if (d){ // found off, on, change DJ before
      if (d.field("DJstent") == "off DJ") {
        ptent.set("DJstent", null);
        ptent.set("DJStamp", d.field("Date"));
      }
      else {
        ptent.set("DJstent", "on DJ");
        ptent.set("DJStamp", d.field("Date"));
      }
    }
  },
  reop : function(ptent) {
    let orlinks = ptent.linksFrom("UroBase", "Patient") ;
    let bulinks = ptent.linksFrom("Backup", "Patient") ;
    let alllinks = [];
    orlinks.forEach(v=>{
      alllinks.push(v);
    });
    bulinks.forEach(v=>{
      alllinks.push(v);
    });
    alllinks = alllinks.filter(v=>v.field("Status")!="Not");
    let result = [];
    if(alllinks.length>0){
      result = alllinks.filter((v,i,a)=>a.some(u=>u.id != v.id && my.gdate(u.field("Date"))>=my.gdate(v.field("Date")) && Math.floor((my.gdate(u.field("Date"))-my.gdate(v.field("Date")))/86400000)<=14 && u.field("Status")=="Done"));
    }
    ptent.set("ReOpValue", result.length);
  }
};
var uro = {
  lib : "UroBase",
  opdate : "Date",
  op : "Op",
  result : "OpResult",
  notonlyreg : /งด[^\u0E30-\u0E39]/,
  notdonereg : /ไม่ทำ/,
  notdone : null,
  setopextra : function (e) {
    let opLinks = e.field(opo.lib);
    if (opLinks.length == 0) {
      e.set("OpExtra", false);
      return;
    }

    let opList = opLinks[0];
    
    if(e.field("AutoOpExtra")){
      if (opList.attr("OpType") == "OH") {
        e.set("OpExtra", true);
      }
      else {
        e.set("OpExtra", false);
      }
    }
  },
  setDJstent : function (e) {
    let links = e.field("Patient");
    if (links.length>0) {
      if (links[0].field("DJStamp") == null) { // never ever DJStamp
        if(e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")
          e.set("DJstent", null);
      }
      else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) > ntoday) { // ever DJStamp, future entry
        if (e.field("DJstent"))
          e.set("DJstent", null) ;
      }
      else if (e.field("Date") > links[0].field("DJStamp") && my.gdate(e.field("Date")) <= ntoday) { // ever DJStamp, after Stamp but not future entry
        if (!links[0].field("DJstent")) {// ever off DJ, get only on DJ
          if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ")
            e.set("DJstent", null) ;
        }
        else { // ever on DJ or change DJ, get off or change DJ
          if (e.field("DJstent") == "on DJ")
            e.set("DJstent", null) ;
        }
      }
      else if (e.field("Date") < links[0].field("DJStamp")){// edit entry before last DJStamp, can't edit
        e.set("DJstent", old.field("DJstent"));
      }
      else if (my.gdate(e.field("Date")) == my.gdate(links[0].field("DJStamp"))) {// this entry is last DJStamp
        if (!links[0].field("DJstent")) {// this entry is off DJ, get only off or changeDJ
          if (e.field("DJstent") == "on DJ") 
              e.set("DJstent", null) ;
        }
        else { // this entry is on DJ, must check last DJStamp before
          let ptent = pt.findById(links[0].id) ;
          let d = pto.lastDJStamp(ptent, my.dateminus(e.field("Date"), 1)) ;
          if (d != null && d.field("DJstent") != "off DJ") { // ever on or change DJ before -> get only off or change DJ
            if (e.field("DJstent") == "on DJ") 
              e.set("DJstent", null) ;
          } 
          else { // never on DJ or ever off DJ before -> get only on DJ
            if (e.field("DJstent") == "change DJ" || e.field("DJstent") == "off DJ") 
              e.set("DJstent" , null) ;
          }
        } 
      }
    }
  },
  setx15 : function (e) {
    if((e.field("Dx") && old.field("Dx")!=e.field("Dx") || e.field("Date")!=null && my.gday(old.field("Date"))!=my.gday(e.field("Date")) || e.field("TimeIn")!=null && my.gdate(old.field("TimeIn"))!=my.gdate(e.field("TimeIn"))) ) {
      let str = e.field("Dx").toLowerCase();
      let isstone = false;
      let isorextra = false;
      
      if ((str.indexOf("stone")!=-1 || str.indexOf("uc")!=-1 || str.indexOf("rc")!=-1 || str.indexOf("vc")!=-1 || str.indexOf("calculi")!=-1) && str.indexOf("orchi")==-1)  // match stone, not orchi
        isstone = true;
        
      if ((my.gday(e.field("Date"))==6 || my.gday(e.field("Date"))==0) )
        isorextra = true;
      if (e.field("TimeIn") != null)
        if (e.field("TimeIn").getHours() < 8 || e.field("TimeIn").getHours() >= 16)
          isorextra = true;
     
      if(isstone && isorextra) {
        e.set("x1.5", true) ;
      }
      else {
        e.set("x1.5", false) ;
      }
    }
  },
  setoptype : function (e) {
    let opLinks = e.field(opo.lib);
    if (opLinks.length == 0) {
      e.set("OpType", "");
    }
    else {
      e.set("OpType", opLinks[0].attr("OpType"));
    }
  }
};
var buo = {
  lib : "Backup",
  opdate : "Date",
  op : "Op",
  result : "OpResult",
  notonlyreg : /งด[^\u0E30-\u0E39]/,
  notdonereg : /ไม่ทำ/,
  notdone : null
}
var cso = {
  lib : "Consult",
  opdate : "ConsultDate",
  op : "Rx",
  result : "Rx",
  notonlyreg : /ไม่ดู/,
  notdonereg : /ไม่มา/,
  notdone : null
};
var dxo = {
  lib : "DxAutoFill",
  link : ["Dx","Op"],
  title : ["Dx","Op"],
  validate : function(e){
    let dx = e.field("Dx").trim();
    let op = e.field("Op").trim();
    if (dx && op) {
      if(old.field("Dx")!=dx)
        e.set("Dx", dx.replace(/-|#/g, '').replace(/\s+/g, ' '));
      if(old.field("Op")!=op)
        e.set("Op", op.replace(/-|#/g, '').replace(/\s+/g, ' '));
    }
    else {
      message("field 'Dx' and 'Op' must fill anything. Try again.");
      cancel();
      exit();
    }
  },
  effect : function(e, create, unique){
    let orlinks = e.linksFrom("UroBase", this.lib);
    let bulinks = e.linksFrom("Backup", this.lib);
    let all = [];
    for(let i=0; i<orlinks.length; i++) {
      all.push(orlinks[i]);
    }
    for(let i=0; i<bulinks.length; i++) {
      all.push(bulinks[i]);
    }
    if (all.length>0) {
      for(let i=0; i<all.length; i++) {
        let u = all[i];
        if (this.title.some((f,i)=>u.field(this.link[i]) != e.field(f))) { // update related child.dxop
          this.title.forEach((f,i)=>u.set(this.link[i], e.field(f)));
          // if non unique, move dx link to other entry
          let pid = unique?0:e.id;
          dxop.run.call(this, u, create, pid);
          // op link is update
          dxop.run.call(opo, u, create);
          dxop.setOpType(u);
          uro.setopextra(u);
          dxop.autofill(u);
          uro.setoptype(u);
        }
      }
    }
    
    if (!unique) { // if non unique, re count this link after move link to other
      orlinks = e.linksFrom("UroBase", this.lib);
      bulinks = e.linksFrom("Backup", this.lib);
    }
    
    if (orlinks.length+bulinks.length>0) {
      e.set("Count", orlinks.length+bulinks.length);
    }
    else {
      e.set("Count", 0);
      e.trash();
    }
  }
};
var opo = {
  lib : "OperationList",
  link : ["Op"],
  title : ["OpFill"],
  validate : function(e){
    let op = e.field("OpFill").trim();
    if (op) {
      if(old.field("Op")!=op)
        e.set("OpFill", op.replace(/-|#/g, '').replace(/\s+/g, ' '));
    }
    else {
      message("field 'OpFill' must fill somebuthing. Try again.");
      cancel();
      exit();
    }
    e.set("OpList", e.field("OpList").trim());

    if(e.field("Price") > 0 && e.field("PriceExtra") == 0) {
      e.set("PriceExtra", e.field("Price")*1.5);
    }
    else if(e.field("Price") == 0 && e.field("PriceExtra") > 0) {
      e.set("Price", e.field("PriceExtra")*2/3);
    }
    else if(e.field("Price") > 0 && e.field("PriceExtra") > 0 && e.field("Price")*1.5 != e.field("PriceExtra")) {
      e.set("PriceExtra", e.field("Price")*1.5);
    }
  },
  fillOpList : function(e) {

    // ใช้ AI เฉพาะเมื่อ Visible ยังไม่ถูกตั้งค่า
    if (e.field("Visible") === true) return;

    var opText = e.field("OpFill");
    var currentOpList = e.field("OpList");

    // ใช้ AI เฉพาะเมื่อ OpList ยังว่าง
    if (currentOpList.trim() !== "") return;

    // โหลดรายการ OperationList ทั้งหมด
    var entries = op.entries().filter(o => o.field("OpList"));
    var ops = entries.map(o => o.field("OpFill"));
    // -----------------------------
    // STEP 1: ให้ AI เลือก OpList ที่ใกล้เคียงที่สุด
    // -----------------------------
    var response = ai()
      .model("gpt-4o-mini")
      .system(
        "You are a medical operation classifier. " +
        "Match new surgical terms to the closest known OpFill. " +
        "If similarity is low, return UNKNOWN."
      )
      .ask(
        "Given this operation text: \"" + opText + "\"\n" +
        "Choose the closest OpFill from this list:\n" +
        JSON.stringify(ops, null, 2) +
        "\nReturn plain text"
      );

    // ถ้าไม่พบ → ไม่ต้องทำอะไร
    if (!response || response === "UNKNOWN") {
      return;
    }
    
    // -----------------------------
    // STEP 2: หา entry ที่ match OpList
    // -----------------------------
    var matched = entries.find(o => o.field("OpFill") == response);
    if (!matched) return; // ถ้าไม่เจอจริง ๆ → ปล่อย default

    // -----------------------------
    // STEP 3: Autofill ค่าอื่น ๆ จากรายการที่ match
    // -----------------------------
    e.set("OpList", matched.field("OpList"));
    e.set("OpGroup", matched.field("OpGroup").join(","));
    e.set("Price", matched.field("Price"));
    e.set("PriceExtra", matched.field("PriceExtra"));
    e.set("Visible", true);  // Visible = true = ผ่าน AI แล้ว 
  },
  fillVisible : function(e) {
    log(old.field("OpList") + " : " + e.field("OpList"));
    if (old.field("OpList").trim() != e.field("OpList")) {
        e.set("Visible", false);
    }
  },
  effect : function(e, create, unique){
    let orlinks = e.linksFrom("UroBase", this.lib);
    let bulinks = e.linksFrom("Backup", this.lib);
    let all = [];
    for(let i=0; i<orlinks.length; i++) {
      all.push(orlinks[i]);
    }
    for(let i=0; i<bulinks.length; i++) {
      all.push(bulinks[i]);
    }
    if (all.length>0) {
      for(let i=0; i<all.length; i++) {
        let u = all[i];
        if (this.title.some((f,i)=>u.field(this.link[i]) != e.field(f))) { // update related child.dxop
          this.title.forEach((f,i)=>u.set(this.link[i], e.field(f)));
          // if non unique, move op link to other entry
          let pid = unique?0:e.id;
          dxop.run.call(this, u, create, pid);
          dxop.setOpType(u);
          uro.setopextra(u);
          dxop.autofill(u);
          uro.setoptype(u);
          // dx link is update
          dxop.run.call(dxo, u, create);
        }
      }
    }
    
    if (!unique) { // if non unique, re count this link after move link to other
      orlinks = e.linksFrom("UroBase", this.lib);
      bulinks = e.linksFrom("Backup", this.lib);
    }
    
    if (orlinks.length+bulinks.length>0) {
      e.set("Count", orlinks.length+bulinks.length);
    }
    else if (!create) {
      e.set("Count", 0);
      e.set("Optime", null);
      e.trash();
    }
  }
};
var rpo = {
  lib : "Report",
  setAll : function (r, e) {
    //---Date, Patient, Dx, Op, ORType, Extra, LOS
    r.set("OpDate", e.field("Date"));
    r.set("Dx", e.field("Dx"));
    r.set("Op", e.field("Op"));
    r.set("ORType", e.field("ORType"));
    r.set("Extra", e.field("OpExtra"));
    r.set("Dr", e.field("Dr"));
    r.set("LOS", e.field("LOS"));
    r.set("OpDateCal", e.field("OpDateCal"));
    r.set("OpLength", e.field("OpLength"));

    //---OpGroup, Organ
    if (e.field("OperationList").length>0){
      r.set("OpGroup", e.field("OperationList")[0].field("OpList"));
      r.set("Organ", e.field("OperationList")[0].field("OpGroup").join(" "));
    }
      
    //---WeekDay
    r.set("WeekDay", my.wkname(my.gday(e.field("Date")) ));
    //---Dead
    if(e.field("Patient").length>0 && e.field("Patient")[0].field("Status")=="Dead")
      r.set("Dead","Dead");
    else
      r.set("Dead","Alive");
  },
  createnew : function (e) {
    if(e.field("Status") != "Not"){
      let ent = new Object();
      let r = rp.create(ent);
      
      if(e.field("Patient").length>0){
        r.link("Patient", e.field("Patient")[0]);
      }
      rpo.setAll(r, e);
    }
  },
  updatenew : function (e) {
    if(old.field("Status") != "Not" && e.field("Status") != "Not"){
      //update
      let ptlks = pt.find(old.field("Patient"));
      if (ptlks.length>0) {
        let ptent = pt.findById(ptlks[0].id);
        let rps = ptent.linksFrom("Report", "Patient");
        if (rps.length>0) {
          for (let r=0; r<rps.length; r++) {
            if (my.gdate(rps[r].field("OpDate")) == my.gdate(old.field("Date")) && rps[r].field("ORType") == old.field("ORType") && rps[r].field("Dx") == old.field("Dx") && rps[r].field("Op") == old.field("Op")) {
              rpo.setAll(rps[r], e);
              break;
            }
          }
        }
      }
    }
    else if(old.field("Status") == "Not" && e.field("Status") != "Not" ){
      //create
      this.createnew(e);
    }
    else if(old.field("Status") != "Not" && e.field("Status") == "Not" ){
      //delete
      this.deleteold(e);
    }
  }, 
  deleteold : function (e) {
    if(old.field("Status") != "Not"){
      let ptlks = pt.find(old.field("Patient"));
      if (ptlks.length>0) {
        let ptent = pt.findById(ptlks[0].id);
        let rps = ptent.linksFrom("Report", "Patient");
        if (rps.length>0) {
          for (let r=0;  r<rps.length; r++){
            if (my.gdate(rps[r].field("OpDate")) == my.gdate(old.field("Date")) && rps[r].field("Dx") == old.field("Dx") && rps[r].field("Op") == old.field("Op")){
              rps[r].trash();
              break;
            }
          }
        }
      }
    }
  }
};

var cal = {
  lib : "Holidays",

  run : function(e, isCreate) {
    let opdate = e.field(this.opdate);   // field opdate ใน UroBase

    if (!opdate) {
      cal.deletelink(e);
      return;
    }

    let founds = cal.findlink(e, opdate);

    if (founds.length > 0) {
      cal.updatelink(e, founds, isCreate);
    }
    else {
      cal.deletelink(e);
    }
  },
  findlink : function(e, opdate) {
    let lbs = hd.entries();   // library Holidays
    if (lbs.length == 0) return [];

    // ค้นหา วันตรงกับ opdate + วันหยุดนักขัตร + วันที่ไม่อยู่ รพ.
    let strdate = opdate.toDateString();
    return lbs.filter(h => h.field("Date").toDateString() == strdate);
  },
  updatelink : function(e, founds, isCreate) {
    let old = e.field(cal.lib);

    if (old.length > 0) {
      let mapId = {};
      old.forEach(o => mapId[o.id] = o);
      founds.forEach(f => {
        if (!mapId[f.id]) {
          e.link(cal.lib, f);
        }
        delete mapId[f.id];
      });
      Object.values(mapId).forEach(o => e.unlink(cal.lib, o));
    }
    else {
      founds.forEach(f => {
        if (isCreate) e.set(cal.lib, f.title);
        else e.link(cal.lib, f);
      });
    }
  },
  deletelink : function(e) {
    let old = e.field(cal.lib);
    if (old.length > 0) {
      old.forEach(o => e.unlink(cal.lib, o));
    }
  },
  getEntries : function(date) {
    let hds = hd.entries();
    if (!my.dateIsValid(date) || hds.length == 0) return [];
    
    let strdate = date.toDateString();
    return hds.filter(h => h.field("Date").toDateString()==strdate);
  },
  notify : function (outofduty, holiday, opextra, own) {
    if(outofduty || holiday || opextra) {  // warning when outofduty, holiday, opextra
      let textarr = [];
      const calName = ["Calendar","Sak","Krissana","Suthee"];
      const translate = ["ชัยพร", "เอกณัฏฐ์","กฤษณะ","สุธี"];
      if(outofduty) textarr.push("out of office");
      if(holiday) textarr.push("holiday");
      if(opextra) textarr.push("ORนอกเวลา " + translate[calName.indexOf(own)]);
      message("Warning : Date is overlap with " + textarr.join());
    }
  }
};

var sync = {
  run : function(e, fieldname) {
    let diff = 0;
    if(hour>=old.field(fieldname)) {
      diff = hour-old.field(fieldname);
    }
    else {
      diff = 24-(hour-old.field(fieldname));
    }
    
    if(old.field(fieldname)==null || diff>=1) {
      if(fieldname=="orsync") {
        or.syncGoogleSheet();
      }
      old.savesync(e, fieldname);
    }
  }
};

var trig = {
  DailyPtUpdate : function (all) {
    for (let i=0; i<all.length; i++) {
      let p = all[i]
      if (p.field("Done")==true) {
        p.set("Done", false) ;
      }
      if(p.field("Birthday")) {
        let ymd = pto.getYMD(p.field("Birthday"));
        p.set("YY", ymd[0]);
        p.set("MM", ymd[1]);
        p.set("DD", ymd[2]);
        pto.agetext(p, ymd);
      }
    }
  },
  DailyChildUpdate : function (all) {
    let change = false;
    for (let i=0; i<all.length; i++) {
      if (my.gdate(all[i].lastModifiedTime) < ntoday) {
        if (all[i].field("Done")==true) 
          all[i].set("Done", false);
      }
      if (all[i].field("Done")==false) {
        let end = null;
        let notdone = all[i].field(this.result).match(this.notdonereg);
        this.notdone = notdone==null?0:notdone.length;
        if (all[i].field("VisitType")=="OPD" || this.notdone)
          end = my.dateadd(all[i].field(this.opdate),1);
        else if (all[i].field("VisitType")=="Admit" && all[i].field("DischargeDate")==null)
          end = today;
        else if (my.gdate(all[i].field("DischargeDate"))<my.gdate(all[i].field(this.opdate)))
          end = my.dateadd(all[i].field(this.opdate),1);
        else
          end = my.dateadd(all[i].field("DischargeDate"),1);

        if (ntoday <= my.gdate(end)) { 
          fill.future.call(this, all[i]);
          fill.track.call(this, all[i]);
          fill.los.call(this, all[i]);
          fill.active.call(this, all[i]);
          fill.opdiff.call(this, all[i], fill.ptstatus.call(this, all[i]), fill.ptnextstatus.call(this, all[i]));
          fill.color.call(this, all[i]);
          all[i].set("Done", true);
          change = true;
        }
      }
    }
    if(change) {
      or.syncGoogleSheet();
    }
  }, 
  DailyHDUpdate : function (all) {
    hd.syncGoogleSheet();
  },
  DailyUpdateAll : function () {
    let pta = pt.entries();
    trig.DailyPtUpdate(pta);
    let ura = or.entries();
    trig.DailyChildUpdate.call(uro, ura);
    let csa = cs.entries();
    trig.DailyChildUpdate.call(cso, csa);
    let hda = hd.entries();
    trig.DailyHDUpdate(hda);
    wd.syncGoogleSheet();
  }, 
  PatientBeforeViewCard : function (e) {
    pto.djStamp(e);
    pto.reop(e);
    old.save.call(pto, e);
  }, 
  PatientOpenEdit : function(e, value) {
    old.save.call(pto, e);
  }, 
  PatientBeforeEdit : function (e, value) {
    pto.rearrangename(e);
    old.load(e);
    valid.uniqueHN(e, value=="create");
    fill.underlying.call(pto, e);
    pto.age(e);
    pto.dj(e);

    let contact = e.field("Contact")
    if(e.field("Phone") && old.field("Phone") != e.field("Phone")) {
      AndroidContacts.create(e.field("PtName"), 
        {phone:e.field("Phone")});
    }
    else if(contact && contact.phone && old.field("Phone") != contact.phone) {
      e.set("Phone", contact.phone);
    }
  }, 
  PatientAfterEdit : function (e, value) {
    old.load(e);

    old.save.call(pto, e);
  }, 
  PatientUpdatingField : function (e) {
    // update track
    if(e.field("Done")==true) {
      let o = pto.findLast(false, true, e, today);
      if (o.length>0) {
        if (e.field("Done") && o.some(l=>l.e.field("Track") == 1)) {
          if (o.some(l=>l.e.field("Active") != null)) { // Admit
            for (let i=0; i<o.length; i++) {
              o[i].e.set("Track", 2);
            }
          }
        }
      }
    }
  }, 
  PatientBeforeLink : function (e) {
    fill.linkunderlying(e);
  }, 
  PatientAfterLink : function (e) {
    
  }, 
  PatientBeforeUnlink : function (e) {
    
  }, 
  PatientAfterUnlink : function (e) {
    
  }, 
  OpenEdit : function(e, value) {
    old.save.call(this, e);
  }, 
  BeforeEdit : function (e, value) {
    old.load(e);
    valid.dxop.call(this, e); //fill dx,op complete 
    fill.setnewdate.call(this, e);
    cal.run.call(this, e, value=="create");
    valid.opdateOutOfDuty.call(this, e);
    valid.uniqueVisit.call(this, e, value=="create");
    fill.underlying.call(this, e);
    fill.resulteffect.call(this, e);
    fill.future.call(this, e);
    if (this.lib!="Consult") {
      fill.setortype(e, value=="create");
    }
    fill.setvisittype.call(this, e, value=="create");
    fill.setward.call(this, e);
    fill.setvisitdate.call(this, e);
    fill.resultbydate.call(this, e);
    fill.pasthx.call(this, e);
    fill.track.call(this, e);
    if (value=="create" || !e.field("MergeID"))
      mer.newmergeid.call(this, e);
    mer.merge.call(this, e);
    if (this.lib!="Consult") {
      uro.setDJstent(e);
      uro.setx15(e);
      dxop.run.call(opo, e, value=="create");
      dxop.setOpType(e);
      uro.setopextra(e);
      dxop.autofill(e);
      uro.setoptype(e);
      dxop.run.call(dxo, e, value=="create");
      que.run.call(this, e);
      fill.opdatecal(e);
    }
    fill.los.call(this, e);
    fill.dr(e, value=="create");
    fill.active.call(this, e);
    fill.opdiff.call(this, e, fill.ptstatus.call(this, e), fill.ptnextstatus.call(this, e));
    fill.color.call(this, e);
    mer.effect(e);
  }, 
  AfterEdit : function (e, value) {
    emx.run.call(this, e);
    old.load(e);
    if (this.lib!="Consult") {
      let change = false;
      fill.ptDetail(e);
      // try fill OpList by AI
      fill.opDetail(e);
      // manipulate que in urobase and save que to previous
      que.load.call(this, e);
      que.sortque(que.o);
      que.sortque(que.q);
      if (value=="create") {
        rpo.createnew(e);
      }
      else if (value=="update") {
        rpo.updatenew(e);
      }
      que.runeffect(e);
      
      if (this.lib=="UroBase") {
        sync.run(e, "orsync");
      }
    }
    old.save.call(this, e);
  }, 
  BeforeViewCard : function (e) {
    old.save.call(this, e);
  },
  BeforeUpdatingField : function (e) {
    old.load(e);
    fill.setnewdate.call(this, e);
    if (this.lib!="Consult") {
      fill.setortype(e, false);
    }
    fill.setvisittype.call(this, e, false);
    fill.setward.call(this, e);
    fill.setvisitdate.call(this, e);
    fill.track.call(this, e);
    if (!e.field("MergeID"))
      mer.newmergeid.call(this, e);
    mer.merge.call(this, e);
    if (this.lib!="Consult") {
      que.run.call(this, e);
    }
    fill.los.call(this, e);
    fill.active.call(this, e);
    fill.opdiff.call(this, e, fill.ptstatus.call(this, e), fill.ptnextstatus.call(this, e));
    fill.color.call(this, e);
    mer.effect(e);
  }, 
  AfterUpdatingField : function (e) {
    old.load(e);
    if (this.lib!="Consult") {
      let change = false;
      // manipulate que in urobase and save que to previous
      que.load.call(this, e);
      que.sortque(que.o);
      que.sortque(que.q);
      que.runeffect(e);
      
      sync.run(e, "orsync");
    }
    old.save.call(this, e);
  }, 
  BeforeDelete : function (e) {
    old.load(e);
    if (this.lib!="Consult") {
      que.load.call(this, e);
      que.sortque(que.q);
      que.remove(e, que.q);
      que.save(que.q);
    }
    if (e.field("Merge")==true) {
      e.set("Merge", false);
      mer.cancel.call(this, e);
    }
  }, 
  AfterDelete : function (e) {
    old.load(e);
    let o = fill.lastOther.call(this, e);
    if(o.length>0) {
      let lib ;
      if(o[0].lib=="UroBase") lib = uro;
      else if(o[0].lib=="Backup") lib = buo;
      else if(o[0].lib=="Consult") lib = cso;
      fill.opdiff.call(lib, o[0].e, fill.ptstatus.call(lib, o[0].e), fill.ptnextstatus.call(lib, o[0].e));
    }
    if (this.lib!="Consult") {
      let change = false;
      dxop.deletelink.call(dxo, e);
      dxop.deletelink.call(opo, e);
      rpo.deleteold(e);
      // manipulate que in urobase and save que to previous
      que.load.call(this, e);
      que.sortque(que.o);
      que.sortque(que.q);
      que.runeffect(e);
      
      sync.run(e, "orsync");
    }
    cal.deletelink(e);
    fill.deletept(e);
  }, 
  DxOpenEdit : function(e, value) {
    old.save.call(dxo, e);
  },
  DxBeforeEdit : function (e, value) {
    old.load(e);
    dxo.validate(e);
    dxo.effect(e, value=="create", valid.uniqueDxOp.call(dxo, e, value=="create"));
  },
  DxAfterEdit : function (e, value) {
    old.load(e);
    dxop.effectother.call(dxo, e);
    old.save.call(dxo, e);
  },
  OpListOpenEdit : function(e, value) {
    old.save.call(opo, e);
  },
  OpListBeforeEdit : function (e, value) {
    old.load(e);
    opo.validate(e);
    opo.fillVisible(e);
    opo.effect(e, value=="create", valid.uniqueDxOp.call(opo, e, value=="create"));
  }, 
  OpListAfterEdit : function (e, value) {
    old.load(e);
    dxop.effectother.call(opo, e);
    old.save.call(opo, e);
  }, 
  HDBeforeEdit : function (e, value) {
    
  }, 
  HDAfterEdit : function (e, value) {
    if(value == "create") {
      e.set("CreatedTime",e.creationTime);
      e.set("ModifiedTime",e.lastModifiedTime);
    }
    else {
      e.set("ModifiedTime",e.lastModifiedTime);
    }
    hd.syncGoogleSheet();
  }
};
