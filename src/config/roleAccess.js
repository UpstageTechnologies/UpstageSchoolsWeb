// src/config/roleAccess.js
export const ROLE_ACCESS = {
    master: {
      pages: [
        "home",
        "calendar",
        "applications",
        "accounts",
        "approvals",
        "courses",
        "admin",
        "teacher",
        "student",
        "parent",
        "office_staff",
        "timetable",
        "attendance"
      ],
      people: ["admin", "teacher", "student", "parent", "office_staff"]
    },
  
    admin: {
      pages: [
        "home",
        "calendar",
        "accounts",
        "timetable",
        "attendance",
        "courses",
        "teacher",
        "student",
        "parent",
        "office_staff"
      ],
      people: ["teacher", "student", "parent", "office_staff"]
    },
  
    teacher: {
      pages: [
        "teacher-home",
        "studentDetails",
        "teacher-timetable",
        "teacher-attendance",
        "calendar"
      ],
      people: ["student"]
    },
  
    parent: {
      pages: [
        "parent-home",
        "studentDetails",
        "calendar"
      ],
      people: ["student"]
    },
  
    office_staff: {
      pages: ["accounts"],
      people: []
    }
  };
  