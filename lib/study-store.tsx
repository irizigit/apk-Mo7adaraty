import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
export { courseProgress } from "./course-progress";

export type Lecture = {
  id: string;
  title: string;
  type: "pdf" | "video" | "audio" | "file";
  duration: string;
  date: string;
  completed: boolean;
  size?: string;
};

export type Course = {
  id: string;
  title: string;
  code: string;
  lecturer: string;
  color: string;
  accent: string;
  icon: string;
  lectures: Lecture[];
};

export type Note = {
  id: string;
  title: string;
  body: string;
  courseId?: string;
  updatedAt: string;
  pinned: boolean;
  tone: "blue" | "gold" | "mint";
};

type StudyContextValue = {
  courses: Course[];
  notes: Note[];
  ready: boolean;
  toggleLecture: (courseId: string, lectureId: string) => void;
  addNote: (note: Pick<Note, "title" | "body" | "courseId">) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  addCourse: (title: string, code: string) => void;
  importFile: (courseId: string, file: { name: string; size?: number; mimeType?: string | null }) => void;
};

const STORAGE_KEY = "mo7adaraty-nova-data-v1";

const defaultCourses: Course[] = [
  {
    id: "data-structures",
    title: "هياكل البيانات",
    code: "CS 241",
    lecturer: "د. أحمد السالمي",
    color: "#173D5C",
    accent: "#B9DCFF",
    icon: "account-tree",
    lectures: [
      { id: "ds-1", title: "المصفوفات والقوائم", type: "pdf", duration: "42 دقيقة", date: "الأحد", completed: true },
      { id: "ds-2", title: "القوائم المرتبطة", type: "video", duration: "58 دقيقة", date: "الثلاثاء", completed: true },
      { id: "ds-3", title: "المكدسات والطوابير", type: "video", duration: "51 دقيقة", date: "اليوم", completed: false },
      { id: "ds-4", title: "تدريب تطبيقي 01", type: "file", duration: "ملف تمارين", date: "الخميس", completed: false },
    ],
  },
  {
    id: "calculus",
    title: "التفاضل والتكامل",
    code: "MATH 120",
    lecturer: "د. هدى الرفاعي",
    color: "#2C8FE8",
    accent: "#D8EDFF",
    icon: "function-variant",
    lectures: [
      { id: "ca-1", title: "قواعد الاشتقاق", type: "video", duration: "47 دقيقة", date: "السبت", completed: true },
      { id: "ca-2", title: "تطبيقات المشتقات", type: "pdf", duration: "36 دقيقة", date: "الإثنين", completed: false },
      { id: "ca-3", title: "تمارين المراجعة", type: "file", duration: "ملف PDF", date: "الأربعاء", completed: false },
    ],
  },
  {
    id: "networks",
    title: "شبكات الحاسوب",
    code: "CS 315",
    lecturer: "م. ليان الخطيب",
    color: "#47745C",
    accent: "#D9F1E0",
    icon: "lan-connect",
    lectures: [
      { id: "ne-1", title: "مقدمة في نموذج OSI", type: "video", duration: "39 دقيقة", date: "الأحد", completed: true },
      { id: "ne-2", title: "طبقة النقل", type: "audio", duration: "28 دقيقة", date: "الخميس", completed: false },
    ],
  },
];

const defaultNotes: Note[] = [
  {
    id: "note-1",
    title: "مراجعة قبل الاختبار",
    body: "التأكد من فهم الفرق بين المكدس والطابور وحل ثلاثة تمارين على القوائم المرتبطة.",
    courseId: "data-structures",
    updatedAt: "منذ 20 دقيقة",
    pinned: true,
    tone: "gold",
  },
  {
    id: "note-2",
    title: "قاعدة السلسلة",
    body: "الدالة المركبة: نشتق الدالة الخارجية ثم نضرب في مشتقة الداخلية.",
    courseId: "calculus",
    updatedAt: "أمس",
    pinned: false,
    tone: "blue",
  },
  {
    id: "note-3",
    title: "طبقات الشبكات",
    body: "احفظ ترتيب الطبقات مع مثال على البروتوكولات الخاصة بكل طبقة.",
    courseId: "networks",
    updatedAt: "منذ يومين",
    pinned: false,
    tone: "mint",
  },
];

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: PropsWithChildren) {
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as { courses: Course[]; notes: Note[] };
        if (parsed.courses?.length) setCourses(parsed.courses);
        if (parsed.notes?.length) setNotes(parsed.notes);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ courses, notes }));
  }, [courses, notes, ready]);

  const value = useMemo<StudyContextValue>(() => ({
    courses,
    notes,
    ready,
    toggleLecture(courseId, lectureId) {
      setCourses((current) => current.map((course) => course.id !== courseId ? course : {
        ...course,
        lectures: course.lectures.map((lecture) => lecture.id === lectureId ? { ...lecture, completed: !lecture.completed } : lecture),
      }));
    },
    addNote(note) {
      setNotes((current) => [{
        id: `note-${Date.now()}`,
        title: note.title.trim() || "ملاحظة بدون عنوان",
        body: note.body.trim() || "أضف أفكارك أو ملخصك هنا.",
        courseId: note.courseId,
        updatedAt: "الآن",
        pinned: false,
        tone: ["blue", "gold", "mint"][current.length % 3] as Note["tone"],
      }, ...current]);
    },
    deleteNote(id) {
      setNotes((current) => current.filter((note) => note.id !== id));
    },
    togglePin(id) {
      setNotes((current) => current.map((note) => note.id === id ? { ...note, pinned: !note.pinned } : note));
    },
    addCourse(title, code) {
      const colors = [
        ["#5C4B8A", "#E8E1FF"],
        ["#B45F45", "#FFE6DC"],
        ["#3D7665", "#D9F3E9"],
      ];
      const [color, accent] = colors[courses.length % colors.length];
      setCourses((current) => [{
        id: `course-${Date.now()}`,
        title: title.trim() || "مقرر جديد",
        code: code.trim() || "NEW 101",
        lecturer: "لم تتم الإضافة بعد",
        color,
        accent,
        icon: "book-open-page-variant",
        lectures: [],
      }, ...current]);
    },
    importFile(courseId, file) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const type: Lecture["type"] = extension === "pdf" ? "pdf" : extension === "mp4" || extension === "mov" ? "video" : "file";
      const size = file.size ? `${Math.max(1, Math.round(file.size / 1024 / 1024))} م.ب` : "مرفق جديد";
      setCourses((current) => current.map((course) => course.id !== courseId ? course : {
        ...course,
        lectures: [...course.lectures, {
          id: `file-${Date.now()}`,
          title: file.name,
          type,
          duration: size,
          date: "الآن",
          completed: false,
          size,
        }],
      }));
    },
  }), [courses, notes, ready]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used within StudyProvider");
  return context;
}
