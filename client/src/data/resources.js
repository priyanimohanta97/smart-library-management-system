/**
 * Athenaeum Smart Library - Digital Academic Resources Catalog
 * 
 * Centralized catalog of verified PDF notes and previous year examination questions (PYQs).
 * All entries map strictly to physical static files residing in `client/public/pdf/`.
 */

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'All Resources', iconName: 'Layers' },
  { id: 'notes', label: 'Notes', iconName: 'BookOpen' },
  { id: 'college-pyq', label: 'College PYQs', iconName: 'GraduationCap' },
  { id: 'govt-pyq', label: 'Government Exam PYQs', iconName: 'Award' },
];

export const PDF_RESOURCES = [
  // ==========================================
  // SECTION 1: NOTES (client/public/pdf/notes/)
  // ==========================================
  {
    id: 'note-c-complete',
    title: 'C Programming Complete Notes',
    filename: 'C_Complete_Notes.pdf',
    category: 'notes',
    categoryLabel: 'Notes',
    subject: 'C Programming Language',
    filePath: '/pdf/notes/C_Complete_Notes.pdf',
    downloadUrl: encodeURI('/pdf/notes/C_Complete_Notes.pdf'),
    fileSize: '31.6 MB',
    semester: null,
    academicSession: null,
    examName: null,
    description: 'Comprehensive notes covering fundamental C syntax, pointers, data structures, and memory management.',
    tags: ['C Programming', 'Pointers', 'Data Structures', 'Procedural Programming', 'Computer Science'],
  },
  {
    id: 'note-css-complete',
    title: 'CSS Complete Notes',
    filename: 'CSS_Complete_Notes.pdf',
    category: 'notes',
    categoryLabel: 'Notes',
    subject: 'Web Design & Stylesheets',
    filePath: '/pdf/notes/CSS_Complete_Notes.pdf',
    downloadUrl: encodeURI('/pdf/notes/CSS_Complete_Notes.pdf'),
    fileSize: '25.1 MB',
    semester: null,
    academicSession: null,
    examName: null,
    description: 'In-depth reference notes on Cascading Style Sheets, modern CSS Grid, Flexbox, responsive layouts, and typography.',
    tags: ['CSS', 'Web Development', 'Flexbox', 'CSS Grid', 'Responsive Design', 'Frontend'],
  },
  {
    id: 'note-html-complete',
    title: 'HTML Complete Notes',
    filename: 'HTML_Complete_Notes.pdf',
    category: 'notes',
    categoryLabel: 'Notes',
    subject: 'Web Markup & Document Structure',
    filePath: '/pdf/notes/HTML_Complete_Notes.pdf',
    downloadUrl: encodeURI('/pdf/notes/HTML_Complete_Notes.pdf'),
    fileSize: '12.9 MB',
    semester: null,
    academicSession: null,
    examName: null,
    description: 'Essential guide to semantic HTML5 markup, forms, accessibility standards, and document architecture.',
    tags: ['HTML', 'HTML5', 'Web Standards', 'Accessibility', 'Frontend'],
  },
  {
    id: 'note-java-complete',
    title: 'Java Complete Notes',
    filename: 'Java_Complete_Notes.pdf',
    category: 'notes',
    categoryLabel: 'Notes',
    subject: 'Java Programming & OOP',
    filePath: '/pdf/notes/Java_Complete_Notes.pdf',
    downloadUrl: encodeURI('/pdf/notes/Java_Complete_Notes.pdf'),
    fileSize: '39.2 MB',
    semester: null,
    academicSession: null,
    examName: null,
    description: 'Comprehensive study materials on Java language fundamentals, Object-Oriented Programming (OOP), collections framework, and multithreading.',
    tags: ['Java', 'Object Oriented Programming', 'Collections', 'Multithreading', 'Software Engineering'],
  },

  // ==========================================
  // SECTION 2: COLLEGE PYQS (client/public/pdf/pyq/college_pyqs/)
  // ==========================================
  {
    id: 'pyq-college-bee-midsem-2024-25',
    title: 'Basic Electrical Engineering - Mid Sem Question Paper',
    filename: 'Basic electrical engineering mid sem 1st year (2024-25).pdf',
    category: 'college-pyq',
    categoryLabel: 'College PYQs',
    subject: 'Basic Electrical Engineering',
    filePath: '/pdf/pyq/college_pyqs/Basic electrical engineering mid sem 1st year (2024-25).pdf',
    downloadUrl: encodeURI('/pdf/pyq/college_pyqs/Basic electrical engineering mid sem 1st year (2024-25).pdf'),
    fileSize: '632.6 KB',
    semester: '1st Year (B.Tech)',
    academicSession: '2024-25',
    examName: 'Mid Semester Examination',
    institution: 'Veer Surendra Sai University of Technology',
    description: 'Official 1st year mid-semester examination paper covering AC/DC circuit analysis, magnetic circuits, and basic electrical machines.',
    tags: ['Basic Electrical Engineering', 'Mid Sem', '1st Year', '2024-25', 'VSSUT Exam Paper'],
  },
  {
    id: 'pyq-college-physics-midsem-2024-25',
    title: 'Physics - Mid Sem Question Paper',
    filename: 'Physics mid sem 1 st year (2024-25).pdf',
    category: 'college-pyq',
    categoryLabel: 'College PYQs',
    subject: 'Engineering Physics',
    filePath: '/pdf/pyq/college_pyqs/Physics mid sem 1 st year (2024-25).pdf',
    downloadUrl: encodeURI('/pdf/pyq/college_pyqs/Physics mid sem 1 st year (2024-25).pdf'),
    fileSize: '539.2 KB',
    semester: '1st Year (B.Tech)',
    academicSession: '2024-25',
    examName: 'Mid Semester Examination',
    institution: 'Veer Surendra Sai University of Technology',
    description: 'Official 1st year mid-semester examination paper covering wave optics, electromagnetism, and classical & modern physics.',
    tags: ['Physics', 'Engineering Physics', 'Mid Sem', '1st Year', '2024-25', 'VSSUT Exam Paper'],
  },

  // ==========================================
  // SECTION 3: GOVERNMENT EXAM PYQS (client/public/pdf/pyq/govt_exam_pyqs/)
  // ==========================================
  {
    id: 'pyq-govt-ee',
    title: 'Gate Electrical Engineering Examination Question Paper',
    filename: 'EE.pdf',
    category: 'govt-pyq',
    categoryLabel: 'Government Exam PYQs',
    subject: 'Electrical Engineering (EE)',
    filePath: '/pdf/pyq/govt_exam_pyqs/EE.pdf',
    downloadUrl: encodeURI('/pdf/pyq/govt_exam_pyqs/EE.pdf'),
    fileSize: '2.83 MB',
    semester: null,
    academicSession: null,
    examName: 'Electrical Engineering Competitive Examination',
    institution: null,
    description: 'Previous year examination paper covering power systems, electrical machines, control systems, and network analysis.',
    tags: ['Electrical Engineering', 'EE', 'Power Systems', 'Control Systems', 'Engineering Exam'],
  },
  {
    id: 'pyq-govt-ssc-cgl-2025-english',
    title: 'SSC CGL 12-Sep-2025 Shift 1 - English Paper',
    filename: 'SSC-CGL-12-Sep-2025-S1-English.pdf',
    category: 'govt-pyq',
    categoryLabel: 'Government Exam PYQs',
    subject: 'English Comprehension & Language',
    filePath: '/pdf/pyq/govt_exam_pyqs/SSC-CGL-12-Sep-2025-S1-English.pdf',
    downloadUrl: encodeURI('/pdf/pyq/govt_exam_pyqs/SSC-CGL-12-Sep-2025-S1-English.pdf'),
    fileSize: '978.9 KB',
    semester: null,
    academicSession: '12 Sep 2025 · Shift 1',
    examName: 'SSC CGL Tier 1',
    institution: 'Staff Selection Commission (SSC)',
    description: 'Official question paper from the SSC Combined Graduate Level (CGL) examination held on 12th September 2025, Shift 1 (English section).',
    tags: ['SSC CGL', 'Staff Selection Commission', 'English', 'Shift 1', 'Government Exams', '2025'],
  },
];

export const RESOURCES_CATALOG = PDF_RESOURCES;

/**
 * Returns all registered resources.
 */
export function getAllResources() {
  return [...PDF_RESOURCES];
}

/**
 * Returns resources filtered by category ID ('notes', 'college-pyq', 'govt-pyq') or all.
 */
export function getResourcesByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') {
    return getAllResources();
  }
  return PDF_RESOURCES.filter((r) => r.category === categoryId);
}

/**
 * Searches and filters resources by query string and optional category ID.
 */
export function searchResources(query = '', categoryId = 'all') {
  let list = getResourcesByCategory(categoryId);
  if (!query || !query.trim()) {
    return list;
  }
  const cleanQuery = query.toLowerCase().trim();
  return list.filter((r) => {
    const titleMatch = r.title.toLowerCase().includes(cleanQuery);
    const subjectMatch = r.subject?.toLowerCase().includes(cleanQuery);
    const examMatch = r.examName?.toLowerCase().includes(cleanQuery);
    const sessionMatch = r.academicSession?.toLowerCase().includes(cleanQuery);
    const semesterMatch = r.semester?.toLowerCase().includes(cleanQuery);
    const filenameMatch = r.filename.toLowerCase().includes(cleanQuery);
    const tagMatch = r.tags.some((t) => t.toLowerCase().includes(cleanQuery));

    return titleMatch || subjectMatch || examMatch || sessionMatch || semesterMatch || filenameMatch || tagMatch;
  });
}

/**
 * Returns dynamic document counts grouped by category.
 */
export function getResourceCounts() {
  const all = PDF_RESOURCES.length;
  const notes = PDF_RESOURCES.filter((r) => r.category === 'notes').length;
  const collegePyq = PDF_RESOURCES.filter((r) => r.category === 'college-pyq').length;
  const govtPyq = PDF_RESOURCES.filter((r) => r.category === 'govt-pyq').length;

  return { all, notes, collegePyq, govtPyq };
}
