// repository.js — the app's access to Memento data. Only this file calls memento or holds ids.
// Written by the Memento mini app Builder (copied from the app 2026-11-13). The app only reads.

function repository(libraryId, fields) {
  const lib = memento.libById(libraryId);
  const ids = Object.values(fields);
  const id = (name) => (Object.prototype.hasOwnProperty.call(fields, name) ? fields[name] : name);
  // The app's names in a filter as field ids; creationTime, lastModifiedTime and operators stay as they are.
  const where = (filter) => {
    if (filter === null || typeof filter !== "object" || Array.isArray(filter)) return filter;
    const result = {};
    for (const [key, value] of Object.entries(filter)) {
      result[id(key)] = (key === "$and" || key === "$or") && Array.isArray(value) ? value.map(where) : value;
    }
    return result;
  };
  const query = (options) => {
    const result = { ...options, fields: ids };
    if ("where" in options) result.where = where(options.where);
    if (Array.isArray(options.sort)) result.sort = options.sort.map((key) => ({ ...key, field: id(key.field) }));
    return result;
  };
  const toObject = (entry) => {
    const object = { id: entry.id, title: entry.title };
    for (const [name, id] of Object.entries(fields)) object[name] = entry.field(id);
    return object;
  };
  const toValues = (object) => {
    const values = {};
    for (const [name, id] of Object.entries(fields)) if (name in object) values[id] = object[name];
    return values;
  };
  return {
    lib,
    fields,
    list: async (options) => (await lib.entries(query(options || {}))).map(toObject),
    // A filter left out takes every entry.
    count: (...filter) => lib.count(...filter.map(where)),
    sum: (name, ...filter) => lib.sum(id(name), ...filter.map(where)),
    get: async (id) => { const entry = await lib.findById(id); return entry && toObject(entry); },
    search: async (text) => (await lib.find(text)).map(toObject),
    create: async (object) => toObject(await lib.create(toValues(object))),
    update: async (id, changes) => (await lib.findById(id)).update(toValues(changes)),
    trash: async (id) => (await lib.findById(id)).trash(),
    fileUrl: (id, name, file, options) => lib.fileUrl(id, fields[name], file, options),
  };
}

const repo = {
  urobase: repository("RjVzJnhKSVtXeFdtVnYhOUpAckw", {  // «UroBase»
    date: 0,            // «Date», date
    optime_day: 65,     // «Optime/Day», button
    holidays: 69,       // «Holidays», entries
    patient: 3,         // «Patient», entries
    underlying: 44,     // «Underlying», text
    pasthx: 22,         // «PastHx», text
    invresult: 5,       // «InvResult», text
    dx: 8,              // «Dx», text
    dxautofill: 54,     // «DxAutoFill», entries
    op: 9,              // «Op», text
    operationlist: 53,  // «OperationList», entries
    autoopextra: 56,    // «AutoOpExtra», boolean
    opextra: 35,        // «OpExtra», boolean
    x1_5: 49,           // «x1.5», boolean
    bonus: 34,          // «Bonus», double
    ortype: 36,         // «ORType», choice
    que: 43,            // «Que», choice
    visittype: 19,      // «VisitType», choice
    visitdate: 14,      // «VisitDate», date
    ward: 28,           // «Ward», choice
    merge: 42,          // «Merge», boolean
    dr: 57,             // «Dr», choice
    recorddate: 13,     // «RecordDate», date
    entrymx: 31,        // «EntryMx», choice
    appointdate: 33,    // «AppointDate», date
    operation: 39,      // «Operation», text
    diagnosis: 61,      // «Diagnosis», text
    color: 38,          // «Color», color
    mergeid: 40,        // «MergeID», text
    previous: 41,       // «Previous», text
    future: 52,         // «Future», int
    active: 62,         // «Active», int
    dcdiff: 55,         // «DCDiff», calc
    output: 60,         // «Output», text
    done: 63,           // «Done», boolean
    optype: 70,         // «OpType», choice
    request: 71,        // «Request», boolean
    opresult: 10,       // «OpResult», text
    clavien: 72,        // «Clavien», choice
    djstent: 30,        // «DJstent», radio
    timein: 15,         // «TimeIn», time
    timeout: 16,        // «TimeOut», time
    oplength: 59,       // «OpLength», duration
    status: 11,         // «Status», choice
    photo: 21,          // «Photo», image
    dischargedate: 17,  // «DischargeDate», date
    los: 68,            // «LOS», int
    losdisp: 67,        // «LOSDisp», choice
    summary: 48,        // «Summary», boolean
    track: 46,          // «Track», rating
    opdatecal: 58,      // «OpDateCal», datetime
  }),
  holidays: repository("RDk1KUBrWlUpZFdCc0dmM3ZFUkk", {  // «Holidays»
    holiday: 6,        // «Holiday», boolean
    outofduty: 10,     // «OutOfDuty», boolean
    date: 7,           // «Date», date
    title_2: 0,        // «Title», text
    calendar: 12,      // «Calendar», choice
    allday: 15,        // «AllDay», boolean
    enddate: 14,       // «EndDate», date
    starttime: 16,     // «StartTime», time
    endtime: 17,       // «EndTime», time
    location: 18,      // «Location», location
    description: 19,   // «Description», text
    remindset: 20,     // «RemindSet», boolean
    minuteset: 21,     // «MinuteSet», int
    modifiedtime: 22,  // «ModifiedTime», datetime
    createdtime: 23,   // «CreatedTime», datetime
    eid: 13,           // «eid», text
  }),
};
