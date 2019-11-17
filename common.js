var e;
var links = e.field("Patient")​;

var ntoday = my.ndate(new Date()​);​
var today = my.date(new Date())​;

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
