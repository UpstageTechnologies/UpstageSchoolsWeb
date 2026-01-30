// utils/globalSearch.js

export const buildGlobalSearchResults = ({
    query,
    teachers = [],
    students = [],
    parents = [],
    admins = [],
    officeStaffs = [],
    searchMap = {}
  }) => {
  
    if (!query || query.trim() === "") return [];
  
    const q = query.toLowerCase();
    let results = [];
  
    // ---------- PAGE SEARCH ----------
    Object.keys(searchMap).forEach(key => {
      if (key.toLowerCase().includes(q)) {
        results.push({
          type: "page",
          label: key,
          value: searchMap[key]
        });
      }
    });
  
    // ---------- TEACHERS ----------
    teachers.forEach(t => {
      if (t.name?.toLowerCase().includes(q)) {
        results.push({
          type: "teacher",
          id: t.id,
          label: t.name
        });
      }
    });
  
    // ---------- STUDENTS ----------
    students.forEach(s => {
      if (s.studentName?.toLowerCase().includes(q)) {
        results.push({
          type: "student",
          id: s.id,
          label: s.studentName
        });
      }
    });
  
    // ---------- PARENTS ----------
    parents.forEach(p => {
      if (p.parentName?.toLowerCase().includes(q)) {
        results.push({
          type: "parent",
          id: p.id,
          label: p.parentName
        });
      }
    });
  
    // ---------- ADMINS ----------
    admins.forEach(a => {
      if (a.name?.toLowerCase().includes(q)) {
        results.push({
          type: "admin",
          id: a.id,
          label: a.name
        });
      }
    });
  
    // ---------- OFFICE STAFF ----------
    officeStaffs.forEach(s => {
      if (s.name?.toLowerCase().includes(q)) {
        results.push({
          type: "office_staff",
          id: s.id,
          label: s.name
        });
      }
    });
  
    return results.slice(0, 20);
  };
  