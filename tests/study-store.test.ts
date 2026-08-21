import { describe, expect, it } from "vitest";
import { courseProgress } from "../lib/course-progress";

describe("courseProgress", () => {
  it("يعيد صفراً للمقرر الذي لا يحتوي محاضرات", () => {
    const course = { lectures: [] };
    expect(courseProgress(course)).toBe(0);
  });

  it("يحسب نسبة المحاضرات المكتملة بصورة صحيحة", () => {
    const course = {
      lectures: [
        { id: "1", title: "أ", type: "pdf", duration: "10", date: "اليوم", completed: true },
        { id: "2", title: "ب", type: "pdf", duration: "10", date: "اليوم", completed: true },
        { id: "3", title: "ج", type: "pdf", duration: "10", date: "اليوم", completed: false },
      ],
    };
    expect(courseProgress(course)).toBe(67);
  });
});
