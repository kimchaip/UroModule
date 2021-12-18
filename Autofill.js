var autofill = {
  findresult : function (query, libName, title, desc, count) {
    // filter
    let dx = libByName(libName);
    let dxs =  dx.entries();
    let qarr = query.toLowerCase()
                    .replace(/[ -\/]+/g, ";");
    dxs = dxs.filter(e=>{
      let str = e.field(title)
                 .toLowerCase()
                 .replace(/[ -\/]+/g, ";");
      if (str.indexOf(qarr) >-1)
        return true;
      return false;
    });
    let result;
    if(count) {
      // to object
      result = dxs.map(e=>{
        let o = new Object();
        o["title"] = e.field(title);
        if(desc.length>0) {
          o["desc"] = desc.map(v=>e.field(v))
                          .join() + " ©" + e.field(count);
          desc.forEach(v=>o[v.toLowerCase()] = e.field(v));
        }
        o["count"] = e.field(count);
        return o;
      });
    }
    else {
      // grouping
      let group = {};
      for(let i in dxs) {
        let ent = [];
        ent.push(dxs[i].field(title));
        if(desc && desc.length>0)
          ent = ent.concat(desc.map(v=>dxs[i].field(v)));
        let key = ent.join(";");
        group[key] = (group[key] || 0) + 1;
      }
      // to object
      result = Object.keys(group).map(k=>{
        let o = new Object();
        let a = k.split(";");
        o["title"] = a.splice(0, 1);
        if(a.length>0) {
          o["desc"] = a.join();
          for(let i=0; i<desc.length; i++)
            o[desc[i].toLowerCase()] = a[i];
        }
        o["count"] = group[k];
        return o;
      });
    }
    // sort by count
    result.sort((a,b)=>b.count-a.count);
    return result;
  }
}
