export type ProgressCourse = { lectures: Array<{ completed: boolean }> };

export function courseProgress(course: ProgressCourse) {
  if (course.lectures.length === 0) return 0;
  return Math.round((course.lectures.filter((lecture) => lecture.completed).length / course.lectures.length) * 100);
}
