var pt = libByName("Patient") ;​
var or = libByName("UroBase") ;​
var cs = libByName("Consult") ;
var bu = libByName("Backup") ;
var dx = libByName("DxAutoFill") ;
var op = libByName("OperationList") ;
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
      if(this.lib=="Patient") {
        old.d["PtName"] = e.field("PtName"); 
        old.d["Age"] = e.field("Age");
        old.d["YY"] = e.field("YY");
        old.d["MM"] = e.field("MM");
        old.d["DD"] = e.field("DD"); 
        old.d["Birthday"] = e.field("Birthday");
        old.d["HN"] = e.field("HN");
        old.d["Underlying"] = e.field("Underlying");
        old.d["VIP"] = e.field("VIP");
        old.d["Allergies"] = e.field("Allergies");
        old.d["DJstent"] = e.field("DJstent");
        old.d["DJStamp"] = e.field("DJStamp");
        old.d["Status"] = e.field("Status");
        old.d["Done"] = e.field("Done");
        old.d["Ward"] = e.field("Ward");
        old.d["WardStamp"] = e.field("WardStamp");
        old.d["Address"] = e.field("Address");
        old.d["Phone"] = e.field("Phone");
        old.d["Contact"] = e.field("Contact");
        old.d["Descript"] = e.field("Descript");
        old.d["Dr"] = e.field("Dr");
      }
      else {
        old.d["Patient"] = e.field("Patient").length>0? e.field("Patient")​[0].title: ""; 
        old.d["PastHx"] = e.field("PastHx");
        old.d["InvResult"] = e.field("InvResult");
        old.d["Dx"] = e.field("Dx");
        old.d["VisitType"] = e.field("VisitType");
        old.d["VisitDate"] = e.field("VisitDate");
        old.d["Ward"] = e.field("Ward");
        old.d["Merge"] = e.field("Merge");
        old.d["EntryMx"] = e.field("EntryMx");
        old.d["AppointDate"] = e.field("AppointDate");
        old.d["Operation"] = e.field("Operation");
        old.d["Color"] = e.field("Color");
        old.d["MergeID"] = e.field("MergeID");
        old.d["Dr"] = e.field("Dr");
        old.d["Status"] = e.field("Status");
        old.d["Photo"] = e.field("Photo"); 
        old.d["DischargeDate"] = e.field("DischargeDate");
        old.d["LOS"] = e.field("LOS");
        old.d["Summary"] = e.field("Summary");
        old.d["Track"] = e.field("Track");
      }
      if(this.lib=="UroBase" || this.lib=="Backup") {
        old.d["Date"] = e.field("Date")​;
        old.d["DxAutoFill"] = e.field("DxAutoFill").length>0? e.field("DxAutoFill")[0].title: "";
        old.d["Op"] = e.field("Op");
        old.d["OperationList"] = e.field("OperationList").length>0? e.field("OperationList")​[0].title: "";
        old.d["AutoOpExtra"] = e.field("AutoOpExtra");
        old.d["OpExtra"] = e.field("OpExtra");
        old.d["x1.5"] = e.field("x1.5");
        old.d["Bonus"] = e.field("Bonus");
        old.d["ORType"] = e.field("ORType");
        old.d["Que"] = e.field("Que");
        old.d["RecordDate"] = e.field("RecordDate");
        old.d["Future"] = e.field("Future");
        old.d["OpResult"] = e.field("OpResult");
        old.d["DJstent"] = e.field("DJstent");
        old.d["TimeIn"] = e.field("TimeIn");
        old.d["TimeOut"] = e.field("TimeOut");
        old.d["OpDateCal"] = e.field("OpDateCal");
        old.d["OpLength"] = e.field("OpLength");
        old.d["Active"] = e.field("Active");
      }
      else if(this.lib=="Consult") {
        old.d["ConsultDate"] = e.field("ConsultDate");
        old.d["Rx"] = e.field("Rx");
      }
      
      e.set("Previous", JSON.stringify(old.d));
    },
    field : function (fieldname) {
      //get data by field
      if(fieldname in this.d)
        return this.d[fieldname];
      
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
    this.m = this.m.sort((a,b)=>{
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
    let range = ["VisitDate","PastHx","InvResult","VisitType","Ward","DischargeDate","Track","Summary","Underlying","LOS","Active"];
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
          e.field("Ward", "Uro");
          e.field("DischargeDate", null);
          e.field("Track", 0);
          e.field("Summary", false);
          e.field("LOS", null);
        }
        mer.save(e, mergeobj);
        mer.save(o, mer.m);
        mer.setall("MergeID", o.field("MergeID"));
        if (mer.m.length==1) o.set("Merge", false);
      }
    }
  },
  merge : function(e) {
    if (e.field("Merge")​!=old.field("Merge")​)​ {
      if (e.field("Merge")​) {
        mer.run.call(this, e)​;
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
  q: [],​
  load: function(e) {  // load entry to q
    let lib = this.lib=="UroBase"? or: bu;
    all = lib.entries();
    q = all.filter(v=>my.gdate(v.field("Date"))==my.gdate(e.field("Date")) && v.field("ORType")=="GA" && v.field("Status")!="Not");
  },
  save : function(e) {
    // reorder by TimeIn
    this.sorttime();
    // set new que to every entry
    q.forEach((v,i)=>{
      v.set("Que", ("0"+(i+1)).slice(-2));
      this.oldsave(v);
    }, this);
  },
  oldsave : function (e) {
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
  run : function (e) {
    if (my.gdate(e.field("TimeIn")) != my.gdate(old.field("TimeIn")) || e.field("Que") != old.field("Que") || e.field("Status") != old.field("Status") || e.field("ORType") != old.field("ORType") || (e.field("Que") == "00" && e.field("Status") != "Not" && e.field("ORType")​ == "GA")) {
      // load old entry to q
      que.load.call(this, e);
      // remove old e or insert new e
      if (e.field("Status") == "Not" || e.field("ORType")​ == "LA") {  // change Status -> Not or ORType -> LA
        que.remove(e);
        e.set("Que", "00");
      }
      else {  // change Status -> !Not and ORType -> GA
        que.insert(e);
      }
      // sort q by que
      que.sortque(e);
      // update when Que change and !Not and GA
      if (e.field("Que") != old.field("Que") && e.field("Status") != "Not" && e.field("ORType")​ == "GA") {
        // insert this entry to q at position que
        que.insert(e);
      }
      //reorder by TimeIn -> set new que to every entry
      que.save(e);
    }
  }
};
var emx = {
  createnew : function (e)​ {
    let last = null;
    let libfrom = lib().title;
    let min = this.lib==libfrom? 1: 0;
    let links = e.field("Patient")​;
    if (links.length && links[0].field("Status")!="Dead") {
      let lib = this.lib!="Consult"? or: cs;
      let ptent = pt.findById(links[0].id);
      let entlinks = ptent.linksFrom(this.lib, "Patient");
      let found = false;
      if (entlinks.length > min) {
        for (let i=0; i<entlinks.length; i++) {
          if (my.gdate(entlinks[i].field(this.opdate))​ == my.gdate(e.field("AppointDate")) &​& entlinks[i].id!=e.id)​{
            found = true;
            break ;
          }
        }
      } 
      if (!found) {
        let ent​ = new Object();
        last = lib.create(ent);
        old.save.call(this, last);
        
        last.set(this.opdate,  my.date(e.field("AppointDate")​));
        last.link("Patient", links[0]);
        last.set("Dr", links[0].field("Dr")​);
        last.set("Underlying", e.field("Underlying"));
        if (e.field("Photo").length>0)​
            last.set("Photo", e.field("Photo").join()​);
        if(this.lib!="Consult") {
          last.set("Op", e.field("Operation")​);
          last.set("Dx", e.field("Diagnosis"));
        }
        else {
          last.set("Dx", e.field("Diagnosis")​);
        }
        trig.BeforeEdit.call(this, last, "update");
        trig.AfterEdit.call(this, last, "create");
        //message("successfully created new Entry") ;
      }
    }​
    return last;
  }, 
  run : function (e)​ {
    let last = null;
    if (e.field("EntryMx")​== "F/U" &&  e.field("AppointDate")) {
      last = emx.createnew.call(cso, e)​;
      if(last) last.show();
      else message("check appoint date or Pt Status");
    }​
    else if (e.field("EntryMx")​== "set OR" &&  e.field("AppointDate")) {
      last = emx.createnew.call(uro, e);
      if(last) last.show()​;
      else message("check appoint date or Pt Status");
    }
    else if (e.field("EntryMx")​=="F/U" || e.field("EntryMx")​=="set OR")​ {
      message("Appoint date must not leave blank")​;
    }​
    e.set("EntryMx", "<Default>")​;
  }
}​;
var dxop = {
  run : function (e) {
    if(e.field("Status")​ == "Not" )​ { // status not, fill Dx/Op not complete
      dxop.deletelink.call(this, e);
    }
    else { // status plan/done
      let found = dxop.findlink.call(this, e);
      if(found) {
        dxop.autofill.call(this, e, found);
        dxop.updatelink.call(this, e, found);
      }
      else {
        found = dxop.create.call(this, e);
        dxop.updatelink.call(this, e, found);
      }
    }
  },
  findlink : function (e) {
    let lb = this.lib=="DxAutoFill"? dx: op;
    let lbs = lb.find(e.field(this.link[0])​);
    let found = null;
    if (lbs.length > 0) {
      found = lbs.find(d=>this.title.every((v,i)=>(d.field(v)==e.field(this.link[i]))));
    }​
    return found;
  },
  autofill : function (e, found) {
    if(this.lib=="OperationList") {
      if (e.field("OpExtra")​) {
        if(e.field("x1.5")​) {
          e.set("Bonus", found.field("PriceExtra")​)​;
        }
        else {
          e.set("Bonus", found.field("Price")​)​;
        }
      }
      else if(!e.field("OpExtra")​){
        e.set("Bonus", 0);
      }
      if (!fill.oplength(e)​) {
        e.set("OpLength", found.field("Optime")​)​;
      }
    }
  },
  updatelink : function (e, found) {
    if(e.field(this.lib).length>0) {
      let oldlink = e.field(this.lib)[0];
      if(oldlink.id!=found.id) { // change link
        e.unlink(this.lib, oldlink);
        e.link(this.lib, found);
        dxop.count.call(this, oldlink);
        dxop.count.call(this, found);
      }
    }
    else { // old link is []
      e.set(this.lib, found.title);
      dxop.count.call(this, found);
    }
  },
  create : function (e) {
    let o = new Object()​;
    let lb;
    if(this.lib=="DxAutoFill"){
      lb = dx;
      o["Dx"] = e.field("Dx");
      o["Op"] = e.field("Op")​;​
      o["Count"] = 1;
    }
    else {
      lb = op;
      o["OpFill"] = e.field("Op");
      o["Price"] = 0;
      o["PriceExtra"] = 0;
      o["Count"] = 1;
      o["Optime"] = fill.oplength(e);
    }
    let found = lb.create(o);
    //message("Create new " + this.lib + " Successfully​")​;
    return found;
  },
  deletelink : function (e) {
    if(e.field(this.lib).length>0) {
      let oldlink = e.field(this.lib)[0];
      e.unlink(this.lib, oldlink);
      dxop.count.call(this, oldlink);
    
      if(this.lib == "OperationList") {
        e.set("Bonus", 0)​;
        e.set("OpLength", fill.oplength(e))​;
      }
    }
  },
  count : function (e) {
    let linkuro = e.linksFrom("UroBase", this.lib);
    let linkbup = e.linksFrom("Backup", this.lib);
    let all = [];
    for(let i=0; i<linkuro.length; i++) {
      all.push(linkuro[i]);
    }​
    for(let i=0; i<linkbup.length; i++) {
      all.push(linkbup[i]);
    }​
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
      e.trash()​;
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
        if(old.field("Op")!=op)​
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
  uniqueHN : function (e, value)​ {
    let unique = true;
    let HN = e.field("HN")​;
    if (HN != null) {
      let entries = pt.entries();​​
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
    }​
  }, 
  //un-duplicate UroBase, Consult, Backup
  uniqueVisit : function (e, value)​ {
    let unique = true;
    let fieldname = [this.opdate, "Patient", "Dx", this.op];
    let lb;
    if (this.lib=="UroBase")
      lb = or;
    else if (this.lib=="Consult")
      lb = cs;
    else if (this.lib=="Backup")
      lb = bu;
    let entries = lb.entries();​​
    for (let ent=0; ent<entries.length; ent++) {
      if (fieldname.every(f=>{
        if (f.includes("Date")) 
          return my.gdate(entries[ent].field(f))==my.gdate(e.field(f));
        else if (f=="Patient")
          return entries[ent].field(f)[0].id==e.field(f)[0].id;
        else if (f=="Rx")
          return true;
        else
          return entries[ent].field(f)==e.field(f);
      }))
        if (entries[ent].id != e.id || value) 
          unique = false;
    }
    if (!unique) {
      message("field " + fieldname.join() + " some are not unique. Try again.");
      cancel();
      exit();
    }
  }
};
var fill = {
  setnewdate: function (e) {
    if (my.gdate(old.field(this.opdate)) != my.gdate(my.date(​e.field(this.opdate))​)) {
      e.set(this.opdate, my.date(e.field(this.opdate)));
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
    if(this.lib!="Consult") {
      if (my.gdate(​old.field("RecordDate")) != my.gdate(my.date(​e.field("RecordDate"))​)) {
        e.set("RecordDate", my.date(e.field("RecordDate")));
      }​
    }
  },
  setortype : function (e) {
    if(old.field("Op")!=e.field("Op") && e.field("Op") && old.field("ORType") == e.field("ORType")) {
      let ortype = fill.ortypebyop(e);
      if (ortype)
        e.set("ORType", ortype);
    }
  } ,
  setvisittype : function (e) {
    if(e.field("Merge")​ && e.field("VisitType") == "OPD")
      e.set("VisitType", "Admit")​;
    if(old.field("Dx")!=e.field("Dx") && e.field("Dx") && old.field("VisitType") == e.field("VisitType")) {
      let vstype = fill.visittypebydx.call(this, e);
      if (vstype)
        e.set("VisitType", vstype);
    }
  } ,
  setvisitdate ​: function (e)​ {
    if(this.lib!="Consult") {
      if(e.field("ORType") == "LA" &​& e.field("VisitType") == "OPD" && (my.gdate(e.field("VisitDate")) != my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", my.date(e.field(this.opdate)))​;
      }
      else if(e.field("ORType") == "LA" &​& e.field("VisitType") == "Admit" && (my.gdate(e.field("VisitDate")) > my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", my.date(e.field(this.opdate)))​;
      }
      else if(e.field("ORType") == "GA" &​& e.field("VisitType") == "Admit" && (my.gdate(e.field("VisitDate")) > my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", my.dateminus(e.field(this.opdate), 1));
      }
    }
    else { // this.lib == "Consult"
      if(e.field("VisitType") == "OPD" && (my.gdate(e.field("VisitDate")) != my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", my.date(e.field(this.opdate)))​;
      }
      else if(e.field("VisitType") == "Admit" && (my.gdate(e.field("VisitDate")) > my.gdate(e.field(this.opdate)) || !e.field("VisitDate"))) {
        e.set("VisitDate", my.date(e.field(this.opdate)))​;
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
    }​
    if (bulinks.length>0)​ {
      for (let i=0; i<bulinks.length; i++) {
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
      if(this.notdone)​ {
        e.set("Status", "Not")​;
        e.set("DischargeDate", null)​;
        let links = e.field("Patient");
        if(links.length>0 && links[0].field("Status")=="Active") {
          links[0].set("Status", "Still")​;
        }
      }
      else if(notonly)​
        e.set("Status", "Not")​;
      else {
        e.set("Status", "Done");
        if (e.field("VisitType") == "OPD")
          e.set("DischargeDate", e.field("VisitDate"))​;
      }
    }
    else {
      e.set("Status", "Plan");
      if (e.field("Merge") == false && old.field("Merge") == false)
        e.set("DischargeDate", null)​;
    }
  },
  djbyresult : function(e) {
    let opresult = e.field(this.result);
    if(this.lib!="Consult" && e.field("Status") != "Not") {
      if(opresult) {
        Array.prototype.match = function (a2) {
          let arr = [];
          this.forEach(v=>{a2.forEach(u=>{arr.push(v+" "+u)});});
          return arr;
        };
        let arr1 = ["can't","don't","not"];
        let arr2 = ["on","retain","change"];
        let arr3 = ["dj"];
        let arr4 = ["no"];
        let txt = arr4.match(arr3).concat(arr1.match(arr2).match(arr3)).join(`|`).replace(/ /g,`\\s+`);
        let reg = new RegExp(txt,"i");
        let notdj = opresult.match(reg);
        notdj = notdj==null?0:notdj.length;
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
        
        e.set("DJstent", null);
        if(!notdj) {
          if(changedj>0||opchange>0)
            e.set("DJstent", "change DJ");
          else if(offdj>0||opoff>0)
            e.set("DJstent", "off DJ");
          else if(ondj>0||opon>0)
            e.set("DJstent", "on DJ");
        }
      }
    }
    else if(this.lib!="Consult" && e.field("Status") == "Not") {
      e.set("DJstent", null);
    }
  },
  resultbydate : function(e) {
    let opresult = e.field(this.result);
    
    if(opresult) {
      if(this.lib!="Consult") {
        if(my.gdate(e.field("Date"))<=ntoday​)​ {
          let d = Math.floor((ntoday-my.gdate(e.field("Date")​))​/86400000);
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
        if(my.gdate(e.field("VisitDate"))<=ntoday​)​ {
          let d = Math.floor((ntoday-my.gdate(e.field("VisitDate")​))​/86400000);
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
    if (!this.notdone && e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && e.field("DischargeDate")​ == null && e.field("Summary") == true) {
      e.set("Track", 3);
      e.set("DischargeDate", today);
    }​​
    else if (!this.notdone && e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday) ) {//Admit
      if (e.field("Track") == 0) {
        e.set("Track", 1) ;
      }​
      else if (e.field("Track") == 3) {​
        e.set("Track", 2) ;
      }​
      e.set("DischargeDate", null);
    }​
    else if (!this.notdone &​& e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && my.gdate(e.field("DischargeDate"))​ <= ntoday​​ ) { // D/C
      e.set("Track", 3) ;
      e.set("Summary", true);
    }​
    else if (e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")​) > ntoday) {​ // future
      e.set("Track", 0) ;
      e.set("DischargeDate", null);
    }​
    else if (this.notdone)​ { // notdone
      e.set("Track", 0) ;
      e.set("DischargeDate", null);
    }​
  }, 
  underlying : function (e) {
    if(this.lib=="Patient") { // e in Patient
      let lib = masterLib()​;
      let ent = masterEntry();
      if (lib.title=="UroBase"||lib.title=="Consult"||lib.title=="Backup") {
        if (e.field("Underlying").length>0) {
          ent.set("Underlying", e.field("Underlying").join());
        }​
        else {
          ent.set("Underlying", "" );
        }​
      }​
    }
    else { // e in UroBase, Consult, Backup
      let ptent = e.field("Patient");
      if (ptent.length>0) {
        if (ptent[0].field("Underlying").length>0) {
          e.set("Underlying", ptent[0].field("Underlying").join());
        }​
        else {
          e.set("Underlying", "" );
        }​
      }
    }
  }, 
  los : function (e) {
    if (e.field("VisitDate") != null &​& e.field("DischargeDate") != null) {
      let diff = Math.floor((my.gdate(e.field("DischargeDate"))-my.gdate(e.field("VisitDate")))/86400000);
      e.set("LOS", diff)​;
    }​
    else {
      e.set("LOS", null)​;
    }​
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
    if (e.field("TimeOut") > e.field("TimeIn"))​ {
      return e.field("TimeOut")-e.field("TimeIn")​;
    }​
    else if (e.field("TimeIn") > e.field("TimeOut"))​ {
      return 86400000-(e.field("TimeIn")-e.field("TimeOut"))​;
    }​
    else {
      return null​;
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
    let links = e.field("Patient")​;
    if (links.length>0) {
      let ptent = pt.findById(links[0].id);
        
      let o = pto.findLast(true, true, ptent, today, e, this);
      let str = "" ;
      if (o.length==0) { // never Visit
        links[0].set("WardStamp",null);
        links[0].set("Ward",  "");
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
        links[0].set("WardStamp", o[0].e.field("VisitDate")​);
        if (o[0].e.field("VisitType")=="Admit") {
          links[0].set("Ward", o[0].e.field("Ward"));
          links[0].set("LastDischarge", o[0].e.field("DischargeDate"));
        }
        else {
          links[0].set("Ward", "OPD");
          links[0].set("LastDischarge", o[0].e.field("VisitDate"));
        }
        
        let dead = o[0].e.field(lib.result).match(/dead|death/ig);
        dead = dead?dead.length​:0;
        if (o[0].e.field("Active")!=null || dead)​ { // last entry is active
          if (dead) { // dead
            links[0].set("Status" ,"Dead");
          }
          else  { //Admit or OPD visit today
            links[0].set("Status" ,"Active");
          }
        }
        else if (links[0].field("Status")!="Dead") { //  this entry is not active
          links[0].set("Status", "Still")​;
        }
      }
    }​​​​
  }, 
  ptnextstatus : function (e) {
    let links = e.field("Patient")​;
    if (links.length>0) {
      let ptent = pt.findById(links[0].id);
        
      let o = pto.findNext(true, ptent, today, e, this);
      let str = "" ;
      if (o.length==0) { // never Visit
        links[0].set("NextVisit",null);
        links[0].set("NextDescript", "");
      }
      else { // ever visit
        let lib;
        if(o[0].lib=="UroBase") lib = uro;
        else if(o[0].lib=="Backup") lib = buo;
        else if(o[0].lib=="Consult") lib = cso;
          
        str = fill.descripttxt.call(lib, o[0].e);
        links[0].set("NextDescript", str);
        links[0].set("NextVisit", o[0].e.field("VisitDate")​);
      }
    }​​​​
  },
  color : function (e)​ {
    if(this.lib!="Consult") {
      if(e.field("Status")=="Not") {
        if(e.field("Color")​!="#5B5B5B") e.set("Color", "#5B5B5B")​;
      } 
      else if(e.field("Status")=="Plan") {
        if (e.field("Active")​!=null)​{
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
        if (e.field("Active")​!=null​)​{
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
      if(e.field("Status")=="Not") {
        if(e.field("Color")​!="#5B5B5B") e.set("Color", "#5B5B5B")​;
      } 
      else if (e.field("Active")​!=null​)​{
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
  future : function(e)​{
    if(my.gdate(e.field(this.opdate))>=ntoday​)​
      e.set("Future", Math.floor((my.gdate(e.field(this.opdate)​)-ntoday)​/86400000))​;
    else
      e.set("Future", null)​;
  }​,
  active : function(e)​{
    if( !this.notdone && ( (e.field("VisitType")​=="Admit" && my.gdate(e.field("VisitDate")) <= ntoday && (e.field("DischargeDate")​ == null || my.gdate(e.field("DischargeDate"))​ > ntoday)) || (e.field("VisitType")​=="OPD" && my.gdate(e.field("VisitDate")) == ntoday) ) ) {//Admit or OPD visit today
      if (e.field("VisitType")=="Admit") {
        e.set("Active", Math.floor((ntoday-my.gdate(e.field("VisitDate")​))​/86400000))​;
      }
      else if (e.field("VisitType")​=="OPD") {
        e.set("Active", 0);
      }
    }
    else {
      e.set("Active", null)​;
    }
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
  },
  correctMergeID : function (e) {
    if(this.lib == "Backup") {
      let mstr = e.field("MergeID");
      let marr = JSON.parse(mstr);
      let inx;
      var list = [] ;
      let flag = false;
      do  {
        inx = marr.findIndex(m=>m.lib=="UroBase"&&!or.findById(m.e));
        if(inx==0&&marr.length==1){
          marr[inx].lib = "Backup";
          marr[inx].e = e.id;
          flag = true;
        }
        else if(inx>-1) {
          let vsdate = e.field("VisitDate");
          let dcdate = e.field("DischargeDate");
          let link = e.field("Patient");
          if(link.length>0) {
            let ptent = pt.findById(link[0].id);
            let orlinks = ptent.linksFrom("UroBase", "Patient");
            let bulinks = ptent.linksFrom("Backup", "Patient");
            if (orlinks.length>0) {
              for (let i=0; i<orlinks.length; i++) {
                if (orlinks[i].field("VisitType")=="Admit" && my.gdate(orlinks[i].field("Date")) >= my.gdate(vsdate) && (!dcdate || my.gdate(orlinks[i].field("Date")) <= my.gdate(dcdate))) {
                  list.push(orlinks[i]);
                }
              }
            }​
            if (bulinks.length>0) {
              for (let i=0; i<bulinks.length; i++) {
                if (bulinks[i].field("VisitType")=="Admit" && my.gdate(bulinks[i].field("Date")) >= my.gdate(vsdate) && (!dcdate || my.gdate(bulinks[i].field("Date")) <= my.gdate(dcdate))) {
                  list.push(bulinks[i]);
                }
              }
            }​
          }
          //sort by vsdate opdate creationTime
          list.sort((a,b)=>{
            if(a.field("Date") < b.field("Date"))
              return -1;
            else if(a.field("Date") > b.field("Date"))
              return 1;
            else if(a.creationTime < b.creationTime)
              return -1;
            else if(a.creationTime > b.creationTime)
              return 1;
            else
              return 0;
          });
          //replace Merge Object
          if(list.length>inx) {
            marr[inx].lib = "Backup";
            marr[inx].e = list[inx].id;
            flag = true;
          }
        }
      } while (inx>-1);
      //replace MergeID
      if(flag) {
        mstr = JSON.stringify(marr);
        e.set("MergeID", mstr);
      }
    }
  }
}​;
var pto = {
  lib : "Patient",
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
  //Age
  age : function​ (e) {
    let d = 0;
    if (e.field("YY") && !e.field("Birthday")​)​ {
      let month = e.field("MM")?e.field("MM"):0;
      let day = e.field("DD")?e.field("DD"):0;
      d = Math.round(e.field("YY")*365.2425 + month*30.4375 + day);
      e.set("Birthday", my.dateminus(today, d)​);
    }​
    if (e.field("Birthday")​)​ {
      d = Math.floor((ntoday-my.gdate(e.field("Birthday"))​)/86400000);
      if (parseInt(e.field("Age")) != d)
        pto.agetext(e, d)​;
    }​
  }, 
  //DJ stent
  dj : function (e) {
    if (!e.field("DJstent"))​ {
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
            if ((allvisit || a.l[i].field("VisitType")=="Admit") && !o.nd && my.gdate(​a.l[i].field("VisitDate"))​ <= my.gdate(​date)​) {
              if (a.l[i].id != eid) { // save to array if not this entry
                o["vsd"] = a.l[i].field("VisitDate");
                o["opd"] = a.l[i].field(a.o.opdate);
                o["lib"] = a.o.lib;
                o["e"] = a.l[i];
                all.push(o);
                // find max VisitDate
                if (lastvsd<my.gdate(​a.l[i].field("VisitDate"))) {
                  lastvsd = my.gdate(​a.l[i].field("VisitDate"));
                }
              }
              else if (withme && e) { // save this entry to array if withme == true
                o["vsd"] = e.field("VisitDate");
                o["opd"] = e.field(olib.opdate);
                o["lib"] = olib.lib;
                o["e"] = e;
                all.push(o);
                // find max VisitDate
                if (lastvsd<my.gdate(​e.field("VisitDate"))) {
                  lastvsd = my.gdate(​e.field("VisitDate"));
                }
              }
            }
          }
        }​
      });
      // filter by max visitDate
      all = all.filter(o=>my.gdate(o.vsd) == lastvsd);
      // sort by opdate desc
      all = all.sort((a,b)=>{
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
            if ((allvisit || a.l[i].field("VisitType")=="Admit") && !o.nd && my.gdate(​a.l[i].field("VisitDate"))​ > my.gdate(​date)​) {
              // find min VisitDate
              if (nextvsd>my.gdate(​a.l[i].field("VisitDate"))) {
                nextvsd = my.gdate(​a.l[i].field("VisitDate"));
              }
              o["vsd"] = a.l[i].field("VisitDate");
              o["opd"] = a.l[i].field(a.o.opdate);
              o["lib"] = a.o.lib;
              o["e"] = a.l[i];
              all.push(o);
            }
          }
        }​
      });
      // filter by min visitDate
      all = all.filter(o=>my.gdate(o.vsd) == nextvsd);
      // sort by opdate desc
      all = all.sort((a,b)=>{
        return my.gdate(b.opd)-my.gdate(a.opd);
      });
    }
    return all;
  }
}​;
var uro = {
  lib : "UroBase",
  opdate : "Date",
  op : "Op",
  result : "OpResult",
  notonlyreg : /งด[^\u0E30-\u0E39]/,
  notdonereg : /ไม่ทำ/,
  notdone : null,
  setopextra : function (e) {
    let hd = libByName("Holidays")​;
    let hds = hd.entries()​;
    let holiday = false;
    let timeout = false;
    if(e.field("TimeIn")!=null)​
      if(e.field("TimeIn").getHours()<8 || e.field("TimeIn").getHours()>=16)​
        timeout = true;
    for(let i=0; i<hds.length; i++)​ {
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
      for (let i=0; i<orlinks.length; i++) {
        if (orlinks[i].field("DJstent") && my.gdate(orlinks[i].field("Date")) > my.gdate(last) && my.gdate(orlinks[i].field("Date")) <= my.gdate(date)​) {
          last = orlinks[i].field("Date");
          r=i;
        }
      }
    }​
    if (bulinks.length>0)​ {
      for (let i=0; i<bulinks.length; i++) {
        if (bulinks[i].field("DJstent") && my.gdate(bulinks[i].field("Date")) > my.gdate(last) && my.gdate(bulinks[i].field("Date")) <= my.gdate(date)​) {
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
  }
}​;
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
}​;
var dxo = {
  lib : "DxAutoFill",
  link : ["Dx","Op"],
  title : ["Dx","Op"],
  validate : function(e){
    e.set("Dx", e.field("Dx").trim()​)​;
    e.set("Op", e.field("Op").trim()​)​;
  },
  effect : function(e){
    let orlinks = e.linksFrom("UroBase", "DxAutoFill") ;
    let bulinks = e.linksFrom("Backup", "DxAutoFill") ;​
    let all = [];
    for(let i=0; i<orlinks.length; i++) {
      all.push(orlinks[i]);
    }
    for(let i=0; i<bulinks.length; i++) {
      all.push(bulinks[i]);
    }
    if (all.length>0) {
      for(let i=0; i<all.length; i++) {
        if ((e.field("Dx") && all[i].field("Dx") != e.field("Dx"))​ || (e.field("Op") && all[i].field("Op") != e.field("Op"))​)​ {
          all[i].set("Dx", e.field("Dx"))​;
          all[i].set("Op", e.field("Op"))​;
        }​
      }​
    }​
    
    if(all.length>0) {
      e.set("Count", all.length);
    }
    else {
      e.set("Count", 0);
      e.trash()​;
    }
  }
};
var opo = {
  lib : "OperationList",
  link : ["Op"],
  title : ["OpFill"],
  validate : function(e){
    e.set("OpFill", e.field("OpFill").trim()​)​;
    e.set("OpList", e.field("OpList").trim()​)​;

    if(e.field("Price")​ > 0 &​& e.field("PriceExtra")​ == 0) {
      e.set("PriceExtra", e.field("Price")​*1.5)​;
    }
    else if(e.field("Price")​ == 0 &​& e.field("PriceExtra")​ > 0) {
      e.set("Price", e.field("PriceExtra")​*2/3)​;
    }​
    else if(e.field("Price")​ > 0 &​& e.field("PriceExtra")​ > 0 &​& e.field("Price")​*1.5 != e.field("PriceExtra")​) {
      e.set("PriceExtra", e.field("Price")​*1.5)​;
    }​
  },
  effect : function(e){
    let orlinks = e.linksFrom("UroBase", "OperationList") ;
    let bulinks = e.linksFrom("Backup", "OperationList")
    let all = [];
    for(let i=0; i<orlinks.length; i++) {
      all.push(orlinks[i]);
    }
    for(let i=0; i<bulinks.length; i++) {
      all.push(bulinks[i]);
    }
    if (all.length>0) {
      for(let i=0; i<all.length; i++) {
        if (e.field("OpFill") && all[i].field("Op") != e.field("OpFill")​)​ {
          all[i].set("Op", e.field("OpFill"))​;
        }
      }​
    }​
   
    if(all.length>0) {
      e.set("Count", all.length);
    }
    else if (value=="update") {
      e.set("Count", 0);
      e.set("Optime", null);
      e.trash()​;
    }
  }
};
var rpo = {
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
    if (e.field("OperationList").length>0)​{
      r.set("OpGroup", e.field("OperationList")[0].field("OpList"));
      r.set("Organ", e.field("OperationList")[0].field("OpGroup").join(" ")​);
    }​
      ​
    //---WeekDay
    r.set("WeekDay", my.wkname(my.gday(e.field("Date")​)​ ))​;
    //---Dead
    if(e.field("Patient").length>0 && e.field("Patient")​[0].field("Status")=="Dead")
      r.set("Dead","Dead");
    else
      r.set("Dead","Alive");
  },
  createnew : function (e) {
    if(e.field("Status") != "Not"){
      let ent = new Object();
      let r = rp.create(ent);
      
      if(e.field("Patient").length>0){
        r.link("Patient", e.field("Patient")​[0]);
      }​
      rpo.setAll(r, e);
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
          for (let r=0; r<rps.length; r++)​ {
            if (my.gdate(my.date(rps[r].field("OpDate"))​) == my.gdate(my.date(old.field("Date"))​) && rps[r].field("ORType") ==​ old.field("ORType") &​& rps[r].field("Dx") ==​ old.field("Dx") &​& rps[r].field("Op") ==​ old.field("Op"))​{
              rpo.setAll(rps[r], e);
              
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
          for (let r=0;  r<rps.length; r++)​{
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
        parr[2] = parr[2]?parr[2]:null;
        for (let s=0; s<oss.length; s++) {
          if (my.gdate(my.date(oss[s].field("OpDate")))​ == my.gdate(my.date(old.field("Date")))​ && oss[s].field("Dr") ==​ old.field("Dr") &​& oss[s].field("OpType") ==​ old.field("ORType") &​& oss[s].field("PtName") ==​ parr[0] && oss[s].field("HN") ==​ parr[2] &​& oss[s].field("Dx") ==​ old.field("Dx") &​& oss[s].field("Op") ==​ old.field("Op"))​{
            oss[s].set("OpDate", my.date(e.field("Date")));
            oss[s].set("Dr", e.field("Dr"));
            oss[s].set("OpType", e.field("ORType")​);
            oss[s].set("PtName", link.field("PtName"));
            oss[s].set("Age", Number(link.field("Age").replace(/\s*ปี/,"")));
            oss[s].set("HN", link.field("HN"));
            oss[s].set("Dx", e.field("Dx")​);
            oss[s].set("Op", e.field("Op")​);
            
            let note = oss[s].field("Note").split(",");
            let underly = link.field("Underlying").join().toLowerCase();
            note = note.map(v=>v.trim());
            note = note.filter(v=>underly.indexOf(v.trim().toLowerCase())==-1);
            let udnote = link.field("Underlying").join().split(",");
            udnote = udnote.concat(note);
            udnote = udnote.filter(v=>v);
            oss[s].set("Note", udnote.join(", "));
            
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
        parr[2] = parr[2]?parr[2]:null;
        for (let s=0; s<oss.length; s++)​{
          if (my.gdate(my.date(oss[s].field("OpDate")))​ == my.gdate(my.date(old.field("Date")))​ &​& oss[s].field("Dr") ==​ old.field("Dr") &​& oss[s].field("OpType") ==​ old.field("ORType") &​& oss[s].field("PtName") ==​ parr[0] && oss[s].field("HN") ==​ parr[2] &​& oss[s].field("Dx") ==​ old.field("Dx") &​& oss[s].field("Op") ==​ old.field("Op"))​{
            oss[s].trash();
            //message("delete OpUroSx!");
            break;
          }
        }​
      }​
    }
  },
  ptTrigOpuro : function (e) {
    if(old.field("PtName") != e.field("PtName") || old.field("Age") != e.field("Age") || old.field("YY") != e.field("YY") || old.field("MM") != e.field("MM")  || old.field("DD") != e.field("DD") || my.gdate(my.date(old.field("Birthday"))) != my.gdate(my.date(e.field("Birthday"))) || old.field("HN") != e.field("HN") ){
      let orlinks = e.linksFrom("UroBase", "Patient");
      let bulinks = e.linksFrom("Backup", "Patient");
      let found = [];
      if(orlinks.length+bulinks.length>0) {
        for (let i=0; i<orlinks.length; i++) {
          if (orlinks[i].field("OpExtra")==true) {
            found.push(orlinks[i]);
          }
        }
        for (let i=0; i<bulinks.length; i++) {
          if (bulinks[i].field("OpExtra")==true) {
            found.push(bulinks[i]);
          }
        }
      }
      if(found.length>0) {
        //update OpUroSx
        let oss = os.entries();
        let count = 0;
        for(let i=0; i<oss.length; i++) {
          if(old.field("PtName") && old.field("PtName") == oss[i].field("PtName") || old.field("HN") && old.field("HN") == oss[i].field("HN")) {
            oss[i].set("PtName", e.field("PtName"));
            oss[i].set("Age", Number(e.field("Age").replace(/\s*ปี/,"")));
            oss[i].set("HN", e.field("HN"));
            count++;
          }
        }
        if(count) {
          //message("Update related PtName in OpUroSx!");
        }
      }
    }
  }
};

var trig = {
  PatientOpenEdit : function(e) {
    if (e) old.save.call(pto, e);
  },
  PatientBeforeEdit : function (e, value)​ {
    pto.rearrangename(e);
    old.load(e);
    valid.uniqueHN(e, value=="create")​;
    pto.age(e)​;
    pto.dj(e)​;

    let contact = e.field("Contact")​;
    if (old.field("Phone") != e.field("Phone") && e.field("Phone")) {
      AndroidContacts.create(e.field("PtName"), 
        {phone:e.field("Phone")});
    }​
    else if(old.field("Phone") != contact && contact) {
      e.set("Phone", contact.phone)​;
    }​
  }, 
  PatientAfterEdit : function (e, value) {
    old.load(e)​;
    if (value=="update")​
      opu.ptTrigOpuro(e);
    old.save.call(pto, e)​;
  }, 
  PatientUpdatingField ​: function (all) {
    let e = entry()​;
    for(let i in all) {
      // update track
      if(all[i].id==e.id &​& all[i].field("Done")​==true) {
        let o = pto.findLast(false, true, e, today);
        if (o.length>0)​ {
          if (e.field("Done") &​& o.some(l=>l.e.field("Track") == 1)) {
            if (o.some(l=>l.e.field("Active"​) != null))​ { // Admit
              for (let i=0; i<o.length; i++) {
                o[i].e.set("Track", 2);
              }
            }​
          }​
        }​
        break;
      }​
    }​
  }, 
  PatientBeforeOpenLib : function (all) {
    for (let i=0; i<all.length; i++)​ {
      if (my.gdate(my.date(all[i]​.lastModifiedTime)​) < ntoday) {
        if (all[i].field("Done")==true) {
          all[i].set("Done", false)​ ;
        }
        pto.age(all[i]);
      }
    }
    let ura = or.entries();
    trig.BeforeOpenLib.call(uro, ura);
    let csa = cs.entries();
    trig.BeforeOpenLib.call(cso, csa);
  }, 
  PatientBeforeLink : function (e)​ {
    fill.underlying.call(pto, e)​;
  }, 
  PatientAfterLink : function (e)​ {
    
  }, 
  PatientBeforeUnlink : function (e)​ {
    
  }, 
  PatientAfterUnlink : function (e)​ {
    
  }, 
  OpenEdit : function (e)​ {
    if (e) old.save.call(this, e)​;
  }, 
  BeforeEdit : function (e, value)​ {
    old.load(e)​;
    valid.dxop.call(this, e); //fill dx,op complete 
    fill.setnewdate.call(this, e)​;​
    valid.uniqueVisit.call(this, e, value=="create")​;
    fill.underlying.call(this, e)​;
    fill.resulteffect.call(this, e);
    fill.future.call(this, e)​;
    if (this.lib!="Consult") {
      uro.setopextra(e)​;
      fill.setortype(e);
    }
    fill.setvisittype.call(this, e);
    fill.setvisitdate.call(this, e)​;
    fill.resultbydate.call(this, e);
    fill.pasthx.call(this, e);
    fill.track.call(this, e)​;
    if (value=="create" || !e.field("MergeID"))
      mer.newmergeid.call(this, e)​;
    fill.correctMergeID.call(this, e);
    mer.merge.call(this, e)​;
    if (this.lib!="Consult") {
      uro.setDJstent(e)​;
      uro.setx15(e)​;
      e.set("OpLength", fill.oplength(e));
      dxop.run.call(dxo, e)​;
      dxop.run.call(opo, e)​;
      que.run.call(this, e)​;
      fill.opdatecal(e);
    }
    fill.los(e)​;
    fill.dr(e, value=="create");
    fill.active.call(this, e);
    fill.ptstatus.call(this, e)​;
    fill.ptnextstatus.call(this, e)​;
    fill.color.call(this, e);
    mer.effect(e)​;
  }, 
  AfterEdit : function (e, value) {
    emx.run.call(this, e)​;
    old.load(e);
    if (this.lib!="Consult") {
      uro.updateDJStamp(e)​;
      if (value=="create") {
        rpo.createnew(e);
        if (this.lib=="UroBase")
          opu.createOp(e)​;
      }
      else if (value=="update")​ {
        rpo.updatenew(e);
        if (this.lib=="UroBase")
          opu.updateOp(e)​;
      }
    }
    old.save.call(this, e)​;
  }, 
  BeforeViewCard ​: function (e) {​
    old.save.call(this, e)​;
  }, 
  BeforeOpenLib : function (all) {
    for (let i=0; i<all.length; i++)​ {
      if (my.gdate(my.date(all[i]​.lastModifiedTime))​ < ntoday) {
        if (all[i].field("Done")==true) 
          all[i].set("Done", false);
      }
      if (all[i].field("Done")==false) {
        let start = my.dateminus(all[i]​.field("VisitDate"), 1);
        let end = null;
        let notdone = all[i].field(this.result).match(this.notdonereg);
        this.notdone = notdone==null?0:notdone.length;
        if (all[i].field("VisitType")=="OPD" || this.notdone)
          end = my.dateadd(all[i].field(this.opdate),1);
        else if (all[i].field("VisitType")=="Admit" && all[i].field("DischargeDate")==null)
          end = today;
        else
          end = my.dateadd(all[i].field("DischargeDate"),1);

        if (my.gdate(start) <= ntoday && ntoday <= my.gdate(end)) { 
          fill.future.call(this, all[i])​;​
          fill.track.call(this, all[i])​;​
          fill.active.call(this, all[i]);
          fill.ptstatus.call(this, all[i]);
          fill.ptnextstatus.call(this, all[i])​;
          fill.color.call(this, all[i]);
          all[i].set("Done", true);
        }
      }
    }
  }, 
  BeforeUpdatingField : function (e) {
    old.load(e)​;
    fill.setnewdate.call(this, e)​;​
    if (this.lib!="Consult") {
      fill.setortype(e);
    }
    fill.setvisittype.call(this, e);
    fill.setvisitdate.call(this, e)​;
    fill.track.call(this, e)​;
    fill.correctMergeID.call(this, e);
    mer.merge.call(this, e)​;
    if (this.lib!="Consult")
      que.run.call(this, e)​;
    fill.los(e)​;
    fill.active.call(this, e);
    fill.ptstatus.call(this, e)​;
    fill.ptnextstatus.call(this, e)​;
    fill.color.call(this, e);
    mer.effect(e)​;
  }, 
  AfterUpdatingField : function (e) {
    old.save.call(this, e)​;
  }, 
  BeforeDelete : function (e)​ {
    if (e.field("Merge")​==true)​ {
      fill.correctMergeID.call(this, e);
      mer.cancel.call(this, e)​;
    }
  }, 
  AfterDelete : function (e)​ {
    if (this.lib!="Consult") {
      old.load(e);
      dxop.deletelink.call(dxo, e)​;
      dxop.deletelink.call(opo, e)​;
      rpo.deleteold(e)​;
      if (this.lib=="UroBase")
        opu.deleteOp(e);
    }
    fill.deletept(e)​;
  }, 
  DxBeforeEdit : function (e, value)​ {
    dxo.validate(e);
    dxo.effect(e);
  },
  OpListBeforeEdit : function (e, value) {
    opo.validate(e);
    opo.effect(e);
  }, 
  OpUroBeforeEdit : function (e) {
    opu.setnewdate(e)​;
  }, 
  OpUroAfterEdit : function (e) {
    
  }
}​;
