import { c as createSsrRpc } from "./createSsrRpc-CzYOcfyh.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
const getProfileAndRole = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5f3e1afbd59a67eb332e5fd38e92393763d77773b4f1fcbd1c579202d69c72b4"));
const updateProfileRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  role: z.enum(["student", "faculty", "admin"])
})).handler(createSsrRpc("a2b638ee33f966c037e5c42fef16df31d154df9719a4adbf67e36b0db4e8dede"));
const StudentInputSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  department: z.string(),
  semester: z.string(),
  section: z.string(),
  cgpa: z.number().optional(),
  attendancePercentage: z.number().optional()
});
const listStudents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  semester: z.string().optional()
}).optional()).handler(createSsrRpc("c578202a04e96f99fb5d117de1def870ea1d024f70304ffec0027e3d9a74da9a"));
const createStudent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(StudentInputSchema).handler(createSsrRpc("cbec1f792a2e942c3c6953b4d2f7491d425631e047bb43fbfcc962a24d236860"));
const updateStudent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(StudentInputSchema).handler(createSsrRpc("a81a9446464e8352b079d109e4289e9470f32888090e6537694cb6818a9593ca"));
const deleteStudent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string()
})).handler(createSsrRpc("c4293a05886c3060946e0020a5b155043eba30a160ff12fdff4cd5654a75eaf9"));
const listSubjects = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ce5e041f08dd190f22302ab1a12791df830e16b78604b77fc46dfdda3806d631"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  records: z.array(z.object({
    studentId: z.string(),
    subjectId: z.string(),
    date: z.string(),
    // YYYY-MM-DD
    status: z.enum(["present", "absent", "late", "excused"])
  }))
})).handler(createSsrRpc("0ff6f3fafb1219cfb8fc75359b61b70148565d3a5210f1b9f4586da4a6091633"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  studentId: z.string().optional()
})).handler(createSsrRpc("e28f6a48258b8527f164fb5ad8c0e0322e3e5b16b187c94965e1a9e36c9932b6"));
const listAssignments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6a4e3aaedf45fef27511bd72ef9f09283df180001f003394777c772d84b7a9ca"));
const createAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string(),
  dueDate: z.string(),
  fileUrl: z.string().optional()
})).handler(createSsrRpc("e0411ef8648e8af532e568954fdb48af4979670aab2ac84a18241f12ad7f4325"));
const listSubmissions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  assignmentId: z.string().optional(),
  studentId: z.string().optional()
}).optional()).handler(createSsrRpc("f55b5c82eafea0286ff81d80eb1596a7821849a9eccd6e767b9118dca16dab1b"));
const createSubmission = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  assignmentId: z.string(),
  fileUrl: z.string().optional()
})).handler(createSsrRpc("a82c511d935e29d8e3fa4a6a0b6bea407d2aabc18f2f2158e12c2c199fbbfc0e"));
const gradeSubmission = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string(),
  grade: z.string(),
  feedback: z.string().optional()
})).handler(createSsrRpc("633df9240cc7d599a0e81555b4503663b709815dc36d205c22fc878ad37488f2"));
const listStudyMaterials = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subjectId: z.string().optional()
}).optional()).handler(createSsrRpc("d9eebd5e088b0536ebf4a7a4d4add442f5fd8f0c9a322cfff8a9736e2badd117"));
const createStudyMaterial = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string(),
  fileUrl: z.string(),
  category: z.string().optional()
})).handler(createSsrRpc("d4898c6df1aac74c8e9d50b359b433a3c9ee227878f9b024731f3ae20445234c"));
const toggleFavoriteMaterial = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  materialId: z.string()
})).handler(createSsrRpc("6f737c304292f43f7367e47abc89ff72da008874f7996ff88430056ddee0263b"));
const listAnnouncements = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("1a90d6216116c6d6eee5c80cf8f6fc831c9abaadbc6bd13801054e3225a7341c"));
const createAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["academic", "event", "placement", "general"])
})).handler(createSsrRpc("4e30c23d5648957dedab43857d60dfe617e79a1aad52cd7306de904354bbc63c"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("e5bed2a53f48e794973392c9689332c51fbfa9bb50c724e803f18f01c271b4c5"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string()
})).handler(createSsrRpc("74b4b55a27bb8b74b9f37101f840550a63ba58e59b5f871887633ba11b86b2c1"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f5bdf59ad11692a73b4a51fede413f0387fa2b5b80f10f3e83254fc87e3918b5"));
const listPlacements = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d4b2cac39220b2f98888343f95105df561298f30b06b96fb0ec7ab337cdcb751"));
const createPlacement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.enum(["applied", "interviewing", "offered", "rejected"]),
  notes: z.string().optional()
})).handler(createSsrRpc("4689e9c16ac836e1e88ac4b184406d06ae6f1cd5bece3c3fb36e472bbc595758"));
const updatePlacement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string(),
  status: z.enum(["applied", "interviewing", "offered", "rejected"]),
  notes: z.string().optional()
})).handler(createSsrRpc("8640ac0f0e2c310fdebff22eeab47470a25a342c408500ad404bc49ae60cd41e"));
const getResumeProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3414cc12b8f78b4c147dc68e76e79c56a57be371e214545fb3b9817f276baae3"));
const saveResumeProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    year: z.string()
  })),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    points: z.string()
  })),
  projects: z.array(z.object({
    title: z.string(),
    tech: z.string(),
    description: z.string()
  }))
})).handler(createSsrRpc("ba5e76a244b7058d8ff72206b06b6b5aab76967ed4d21670b18e819c3d066ac7"));
const logActivity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  type: z.string(),
  duration: z.number(),
  // in minutes
  details: z.string().optional()
})).handler(createSsrRpc("86b6034d806979defd2e0e8152455232de667052edd1d78c1d8b944ecf7fc443"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0958d294ffcf49600a5d3b48ec4350e377e1f338e681a51f360a9c29ebdbe3e7"));
export {
  updateProfileRole as a,
  listStudyMaterials as b,
  createStudent as c,
  deleteStudent as d,
  listSubjects as e,
  createStudyMaterial as f,
  getProfileAndRole as g,
  listPlacements as h,
  getResumeProfile as i,
  logActivity as j,
  createPlacement as k,
  listStudents as l,
  updatePlacement as m,
  listAssignments as n,
  listSubmissions as o,
  createAssignment as p,
  createSubmission as q,
  gradeSubmission as r,
  saveResumeProfile as s,
  toggleFavoriteMaterial as t,
  updateStudent as u,
  listAnnouncements as v,
  createAnnouncement as w
};
